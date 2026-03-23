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

  context.subscriptions.push(disposable);
  context.subscriptions.push({ dispose: () => fileScanner.dispose() });

}

export function deactivate() {
  fileScanner?.dispose();
}
