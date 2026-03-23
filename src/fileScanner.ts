import * as vscode from 'vscode';

export class FileScanner {
  private cache: string[] = [];
  private watcher: vscode.FileSystemWatcher | undefined;

  async scan(): Promise<string[]> {
    const files = await vscode.workspace.findFiles(
      '**/*',
      '**/node_modules/**'
    );

    this.cache = files.map(uri => {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
      if (workspaceFolder) {
        return vscode.workspace.asRelativePath(uri, false);
      }
      return uri.fsPath;
    });

    return this.cache;
  }

  watchChanges(): void {
    this.watcher = vscode.workspace.createFileSystemWatcher('**/*');

    this.watcher.onDidCreate(() => this.scan());
    this.watcher.onDidDelete(() => this.scan());
  }

  filter(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return this.cache.filter(file =>
      file.toLowerCase().includes(lowerQuery)
    );
  }

  getCache(): string[] {
    return this.cache;
  }

  dispose(): void {
    this.watcher?.dispose();
  }
}
