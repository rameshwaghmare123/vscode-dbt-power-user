import {
  Disposable,
  QuickPickItem,
  QuickPickItemKind,
  ThemeIcon,
  Uri,
  commands,
  window,
} from "vscode";
import { provideSingleton } from "../utils";

@provideSingleton(DbtPowerUserControlCenterAction)
export class DbtPowerUserControlCenterAction {
  async openPuQuickPick() {
    const disposables: Disposable[] = [];
    try {
      return await new Promise<Uri | undefined>((resolve, reject) => {
        const dbtpuquickpick = window.createQuickPick<
          DbtPowerUserControlPanelItem | QuickPickItem
        >();
        dbtpuquickpick.title = "dbt Power User Control Panel";
        dbtpuquickpick.items = [
          new DbtPowerUserControlPanelItem(
            "Setup Extension",
            "debug",
            "Open the extension setup walkthrough",
            "dbtPowerUser.openSetupWalkthrough",
          ),
          new DbtPowerUserControlPanelItem(
            "dbt Power User Tutorials",
            "book",
            "Open the dbt Power User Tutorials",
            "dbtPowerUser.openTutorialWalkthrough",
          ),
          new DbtPowerUserControlPanelItem(
            "Shop support info",
            "debug",
            "Get Extension Support info",
            "dbtPowerUser.debugExtension",
          ),
          new DbtPowerUserControlPanelItem(
            "Readme",
            "link-external",
            "View the detailed ReadMe for the extension",
            // This really is an older interface meant to work with executeCommand.
            // recommended is to use vscode.env.openExternal
            "vscode.open",
            [
              Uri.parse(
                "https://github.com/AltimateAI/vscode-dbt-power-user/blob/master/README.md",
              ),
            ],
          ),
          {
            label: "",
            kind: QuickPickItemKind.Separator,
          },
          new DbtPowerUserControlPanelItem(
            "Run Project Healthcheck",
            "debug-start",
            "Run the Project healthcheck",
            "dbtPowerUser.altimateScan",
          ),
          new DbtPowerUserControlPanelItem(
            "Clear Healthcheck Results",
            "debug-stop",
            "Clear all problems",
            "dbtPowerUser.clearAltimateScanResults",
          ),
          {
            label: "",
            kind: QuickPickItemKind.Separator,
          },
          new DbtPowerUserControlPanelItem(
            "Join the Community",
            "add",
            "Join our slack community",
            "vscode.open",
            [Uri.parse("https://getdbt.slack.com/archives/C05KPDGRMDW")],
          ),
          new DbtPowerUserControlPanelItem(
            "Feedback",
            "feed",
            "Give us Feedback!",
            "vscode.open",
            [
              Uri.parse(
                "https://docs.google.com/forms/d/e/1FAIpQLSf7X2nQ3cfqpP6-uYSTE-mFg41ZKigCh2ytPUuX1jz7FoZOnw/viewform?usp=sf_link",
              ),
            ],
          ),
        ];

        disposables.push(
          dbtpuquickpick.onDidChangeValue((value) => {
            dbtpuquickpick.busy = true;
          }),
          dbtpuquickpick.onDidChangeSelection((items) => {
            const item = items[0];
            if (item instanceof DbtPowerUserControlPanelItem) {
              commands.executeCommand(item.command, ...item.commandArgs);
              dbtpuquickpick.hide();
            }
          }),
          dbtpuquickpick.onDidHide(() => {
            resolve(undefined);
            dbtpuquickpick.dispose();
          }),
        );
        dbtpuquickpick.show();
      });
    } finally {
      disposables.forEach((d) => d.dispose());
    }
  }
}

class DbtPowerUserControlPanelItem implements QuickPickItem {
  label: string;
  iconPath?: ThemeIcon | Uri | { light: Uri; dark: Uri } | undefined;
  description?: string | undefined;
  command: string;
  commandArgs: any[];

  constructor(
    label: string,
    iconPath: string = "",
    description?: string | undefined,
    commandStr?: string,
    commandArgs?: any[],
  ) {
    this.label = label;
    this.iconPath = new ThemeIcon(iconPath);
    this.description = description || "";
    this.command = commandStr || "";
    this.commandArgs = commandArgs || [];
  }
}
