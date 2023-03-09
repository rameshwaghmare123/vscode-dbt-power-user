import {
  CancellationToken,
  Disposable,
  TextEditor,
  Uri,
  WebviewOptions,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
} from "vscode";
import { GraphMetaMap } from "../domain";
import { DBTProjectContainer } from "../manifest/dbtProjectContainer";
import {
  ManifestCacheChangedEvent,
  ManifestCacheProjectAddedEvent,
} from "../manifest/event/manifestCacheChangedEvent";
import { provideSingleton } from "../utils";
import * as path from "path";

interface G6DataModel {
  nodes: {
    id: string;
    label: string;
  }[];
  edges: {
    source: string;
    target: string;
  }[];
}

@provideSingleton(ModelGraphViewPanel)
export class ModelGraphViewPanel implements WebviewViewProvider {
  public static readonly viewType = "dbtPowerUser.ModelViewGraph";
  private _panel: WebviewView | undefined = undefined;
  private g6Data?: G6DataModel;
  private childrenMap?: Map<string, GraphMetaMap["children"]> = new Map();
  private eventMap: Map<string, ManifestCacheProjectAddedEvent> = new Map();
  private _disposables: Disposable[] = [];

  public constructor(private dbtProjectContainer: DBTProjectContainer) {
    dbtProjectContainer.onManifestChanged((event) =>
      this.onManifestCacheChanged(event)
    );
    window.onDidChangeActiveColorTheme(
      async (e) => {
        if (this._panel) {
          this._panel.webview.html = this.getWebviewContent();
        }
      },
      null,
      this._disposables
    );
    window.onDidChangeActiveTextEditor((event: TextEditor | undefined) => {
      if (event === undefined) {
        return;
      }
      const fileRoute = event.document.uri.fsPath;
      this.g6Data = this.parseGraphData();
      this.transmitData(this.g6Data);
    });
  }

  private async transmitData(graphInfo: G6DataModel | undefined) {
    await this._panel!.webview.postMessage({
      command: "renderGraph",
      graph: graphInfo,
    });
  }

  public async resolveWebviewView(
    panel: WebviewView,
    context: WebviewViewResolveContext,
    _token: CancellationToken
  ) {
    this._panel = panel;
    this.setupWebviewOptions(context);
    this.renderWebviewView(context);
  }

  private async renderWebviewView(context: WebviewViewResolveContext) {
    const webview = this._panel!.webview!;
    this.g6Data = this.parseGraphData();
    this._panel!.webview.html = this.getWebviewContent();
  }

  private setupWebviewOptions(context: WebviewViewResolveContext) {
    this._panel!.title = "Lineage graph";
    this._panel!.description = "";
    this._panel!.webview.options = <WebviewOptions>{ enableScripts: true };
  }

  private onManifestCacheChanged(event: ManifestCacheChangedEvent): void {
    event.added?.forEach((added) => {
      this.eventMap.set(added.projectRoot.fsPath, added);
    });
    event.removed?.forEach((removed) => {
      this.eventMap.delete(removed.projectRoot.fsPath);
    });
  }

  private getWebviewContent(): string {
    if (!this.g6Data) {
      this.g6Data = {
        nodes: [],
        edges: [],
      };
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Model Node View</title>
</head>
<body>
    <div id="container"></div>
    <script src="https://gw.alipayobjects.com/os/antv/pkg/_antv.g6-3.7.1/dist/g6.min.js"></script>
    <script>
    const vscode = acquireVsCodeApi();
    const width = document.getElementById('container').scrollWidth;
    const height = document.getElementById('container').scrollHeight || 500;
    const miniMap = new G6.Minimap({
      size: [200, 100],
      className: 'minimap',
    });
    const graph = new G6.Graph({
      container: 'container',
      width,
      height,
      fitView: true,
      modes: {
        default: ['zoom-canvas', 'click-select', 'drag-canvas'],
      },
      layout: {
        type: 'dagre',
        rankdir: 'LR',
        align: 'UL',
        controlPoints: true,
        nodesepFunc: () => 1,
        ranksepFunc: () => 1,
      },
      defaultNode: {
        size: [250, 40],
        type: 'modelRect',
        style: {
          lineWidth: 2,
          stroke: '#5B8FF9',
          fill: '#C6E5FF',
        },
        stateIcon: {
          show: false,
        }
      },
      defaultEdge: {
        type: 'polyline',
        size: 1,
        color: '#e2e2e2',
        style: {
          endArrow: true,
        }
      },
    });
    
    graph.addPlugin(miniMap);
    graph.data(${JSON.stringify(this.g6Data)});
    graph.render();
    graph.on('nodeselectchange', (e) => {
      const nodeName = e.target._cfg.model.id;
      vscode.postMessage({
        nodeName
      })
    });
    window.addEventListener('message', (event) => {
      switch (event.data.command) {
        case 'renderGraph':
          graph.data(event.data.graph);
          graph.render();
          break;
      }
    });
    </script>
</body>
</html>`;
  }

  private parseGraphData = () => {
    if (window.activeTextEditor === undefined || this.eventMap === undefined) {
      return;
    }

    const currentFilePath = window.activeTextEditor.document.uri;
    const projectRootpath =
      this.dbtProjectContainer.getProjectRootpath(currentFilePath);
    if (projectRootpath === undefined) {
      return;
    }

    const event = this.eventMap.get(projectRootpath.fsPath);
    if (event === undefined) {
      return;
    }

    const { projectName, graphMetaMap } = event;
    const fileName = path.basename(
      window.activeTextEditor!.document.fileName,
      ".sql"
    );
    const packageName =
      this.dbtProjectContainer.getPackageName(currentFilePath) || projectName;
    return this.mapParentsAndChildren(graphMetaMap, fileName);
  };

  private mapParentsAndChildren = (graphMetaMap: any, fileName: string) => {
    const mapToWebviewURI = (uri: string) => {
      return this._panel?.webview.asWebviewUri(Uri.file(uri));
    };
    const nodeConfigurations: Record<string, any> = {
      children: { style: { fill: "#EFB27B" } },
      parents: { style: { fill: "#8DAAE8" } },
      tests: { style: { fill: "#8DE88E" } },
    };

    const nodes: any[] = [];
    const edges: any[] = [];
    Object.keys(nodeConfigurations).forEach((type) => {
      const dependencyNodes = graphMetaMap[type];
      Array.from(dependencyNodes.keys()).forEach((key: any) => {
        if (key.endsWith(`.${fileName}`) && key.startsWith("model.")) {
          const node = dependencyNodes!.get(key)!;
          const currentNode = node;
          const image =
            currentNode?.iconPath !== undefined
              ? {
                  show: true,
                  img: mapToWebviewURI(currentNode.iconPath.dark)!.toString(),
                }
              : {
                  show: false,
                };
          nodes.push({
            id: key,
            label: key,
            x: 150,
            y: 150,
            logoIcon: image,
            style: {
              fill: "#ffffff",
            },
          });
          if (currentNode !== undefined) {
            currentNode.nodes.map((childrenNode: { key: "string" }) => {
              let edge = { target: childrenNode.key, source: key };
              if (type === "parents") {
                edge = { target: key, source: childrenNode.key };
              }
              edges.push(edge);
              nodes.push({
                id: childrenNode.key,
                label: childrenNode.key,
                style: nodeConfigurations[type].style,
              });
            });
          }
        }
      });
    });
    return { nodes, edges };
  };
}
