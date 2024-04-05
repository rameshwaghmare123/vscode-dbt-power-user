import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  CompletionList,
  Disposable,
  Position,
  ProviderResult,
  TextDocument,
} from "vscode";
import { provideSingleton } from "../utils";
import { UsersService } from "../services/usersService";
import { DBTTerminal } from "../dbt_client/dbtTerminal";

@provideSingleton(UserCompletionProvider)
export class UserCompletionProvider
  implements CompletionItemProvider, Disposable
{
  private disposables: Disposable[] = [];

  constructor(
    private dbtTerminal: DBTTerminal,
    private usersService: UsersService,
  ) {}

  dispose() {
    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  provideCompletionItems(
    document: TextDocument,
    position: Position,
    token: CancellationToken,
    context: CompletionContext,
  ): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
    return this.usersService.users.map((user) => ({
      label: `${user.display_name}`,
      kind: CompletionItemKind.User,
    }));
  }
}
