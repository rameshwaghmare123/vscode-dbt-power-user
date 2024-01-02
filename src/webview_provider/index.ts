import { Disposable, window } from "vscode";
import { provideSingleton } from "../utils";
import { QueryResultPanel } from "./queryResultPanel";
import { DocsEditViewPanel } from "./docsEditPanel";
import { LineagePanel } from "./lineagePanel";
import { InsightsPanel } from "./insightsPanel";
import { DocsGeneratorPanel } from "./docsGenerationPanel";

@provideSingleton(WebviewViewProviders)
export class WebviewViewProviders implements Disposable {
  private disposables: Disposable[] = [];

  constructor(
    private queryResultPanel: QueryResultPanel,
    private docsEditPanel: DocsEditViewPanel,
    private lineagePanel: LineagePanel,
    private insightsPanel: InsightsPanel,
    private docsGeneratorPanel: DocsGeneratorPanel,
  ) {
    this.disposables.push(
      window.registerWebviewViewProvider(
        QueryResultPanel.viewType,
        this.queryResultPanel,
        { webviewOptions: { retainContextWhenHidden: true } },
      ),
      window.registerWebviewViewProvider(
        DocsEditViewPanel.viewType,
        this.docsEditPanel,
        { webviewOptions: { retainContextWhenHidden: true } },
      ),
      window.registerWebviewViewProvider(
        LineagePanel.viewType,
        this.lineagePanel,
        { webviewOptions: { retainContextWhenHidden: true } },
      ),
      window.registerWebviewViewProvider(
        InsightsPanel.viewType,
        this.insightsPanel,
        { webviewOptions: { retainContextWhenHidden: true } },
      ),
      window.registerWebviewViewProvider(
        DocsGeneratorPanel.viewType,
        this.docsGeneratorPanel,
        { webviewOptions: { retainContextWhenHidden: true } },
      ),
    );
  }

  dispose() {
    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
