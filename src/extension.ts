import * as vscode from 'vscode';
import { FileScanner } from './fileScanner';
import { MentionCompletionProvider } from './completionProvider';

let fileScanner: FileScanner;

export async function activate(context: vscode.ExtensionContext) {
  fileScanner = new FileScanner();

  // Initial scan
  await fileScanner.scan();

  // Watch for file changes
  fileScanner.watchChanges();

  // Register completion provider for markdown files
  const provider = new MentionCompletionProvider(fileScanner);

  const disposable = vscode.languages.registerCompletionItemProvider(
    { language: 'markdown', scheme: 'file' },
    provider,
    '@'
  );

  // Re-trigger completion when editing after @ (handles backspace case)
  const textChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document !== event.document) {
      return;
    }
    if (event.document.languageId !== 'markdown') {
      return;
    }

    // Don't trigger suggest if a newline was just inserted
    const hasNewline = event.contentChanges.some(change => change.text.includes('\n'));
    if (hasNewline) {
      return;
    }

    const position = editor.selection.active;
    const lineText = event.document.lineAt(position.line).text;
    const linePrefix = lineText.substring(0, position.character);

    // If we're in a @ mention context, trigger suggest
    if (/@\S*$/.test(linePrefix)) {
      vscode.commands.executeCommand('editor.action.triggerSuggest');
    }
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(textChangeListener);
  context.subscriptions.push({ dispose: () => fileScanner.dispose() });

}

export function deactivate() {
  fileScanner?.dispose();
}
