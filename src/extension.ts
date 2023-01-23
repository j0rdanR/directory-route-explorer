import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { RouteExplorerProvider, Route } from './RouteExplorerProvider';

export function activate(context: vscode.ExtensionContext) {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : '';

  vscode.window.showInformationMessage(
    'The `Directory Route Explorer` extension is still experimental and can cause performance issues.'
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'directory-route-explorer.openPage',
      (node: Route) => {
        if (fs.existsSync(path.join(node.routePath, '+page.svelte'))) {
          let uri = vscode.Uri.file(path.join(node.routePath, '+page.svelte'));
          vscode.commands.executeCommand('vscode.open', uri);
        } else {
          vscode.window.showInformationMessage(
            `The route: '${node.label}' does not contain a '+page.svelte' file`
          );
        }
      }
    )
  );

  vscode.window.createTreeView('routeExplorer', {
    treeDataProvider: new RouteExplorerProvider(rootPath),
  });
}

export function deactivate() {}
