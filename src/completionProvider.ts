import * as vscode from 'vscode';
import { FileScanner } from './fileScanner';

export class MentionCompletionProvider implements vscode.CompletionItemProvider {
  constructor(private fileScanner: FileScanner) {}

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionList | undefined {
    const lineText = document.lineAt(position).text;
    const linePrefix = lineText.substring(0, position.character);

    // Find @ optionally followed by characters
    const mentionMatch = linePrefix.match(/@(\S*)$/);
    if (!mentionMatch) {
      return undefined;
    }

    const query = mentionMatch[1];
    const files = query ? this.fileScanner.filter(query) : this.fileScanner.getCache();

    const items = files.slice(0, 50).map(filePath => {
      const item = new vscode.CompletionItem(
        filePath,
        vscode.CompletionItemKind.File
      );

      // Calculate range to replace @query with @filePath
      const startPos = position.character - mentionMatch[0].length;
      const range = new vscode.Range(
        position.line,
        startPos,
        position.line,
        position.character
      );

      item.insertText = `@${filePath}`;
      item.range = range;
      item.detail = 'File reference';
      item.filterText = `@${filePath}`;

      return item;
    });

    // isIncomplete: true ensures VSCode re-triggers when user types/deletes characters
    return new vscode.CompletionList(items, true);
  }
}
