import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class RouteExplorerProvider implements vscode.TreeDataProvider<Route> {
  constructor(private workspaceRoot: string) {}

  getTreeItem(element: Route): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Route): Thenable<Route[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage(
        '[Route Explorer] Cannot index routes folder as there is no available workspace.'
      );
      return Promise.resolve([]);
    }

    const srcDir = path.join(this.workspaceRoot, 'src');

    if (element) {
      console.log(element);
      return Promise.resolve(this.getRoutesFromDirectory(element.routePath));
    } else {
      if (this.pathExists(srcDir)) {
        return Promise.resolve(this.getRoutesFromDirectory(srcDir));
      } else {
        vscode.window.showInformationMessage(
          '[Route Explorer] Current workspace has no /src directory.'
        );
        return Promise.resolve([]);
      }
    }
  }

  /**
   * Given a directory containing (svelte) routes, convert child directories (non-recursivly) into tree items
   */
  private getRoutesFromDirectory(directoryRoot: string): Route[] {
    if (!this.pathExists(directoryRoot)) return [];
    if (
      path.basename(directoryRoot) === 'src' &&
      !this.pathExists(path.join(directoryRoot, 'routes'))
    )
      return [];

    let dir;
    let routes: Route[] = [];
    if (path.basename(directoryRoot) === 'src') {
      dir = ['routes'];
      console.log(directoryRoot);
    } else {
      dir = fs.readdirSync(directoryRoot);
      console.log(directoryRoot, dir);
    }

    for (let itemName of dir) {
      console.log(itemName, dir);

      let itemPath = path.join(directoryRoot, itemName);
      let stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        if (itemName === 'routes') itemName = 'root';

        let hasChildren;
        if (this.hasChildRoutes(itemPath)) {
          hasChildren = vscode.TreeItemCollapsibleState.Collapsed;
        } else {
          hasChildren = vscode.TreeItemCollapsibleState.None;
        }

        routes.push(
          new Route(itemName, hasChildren, itemPath, {
            command: 'directoryroutes.openPage',
            title: 'Open page',
            arguments: [itemPath],
          })
        );
      }
    }

    return routes || [];
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }

  private hasChildRoutes(directoryPath: string) {
    let dir = fs.readdirSync(directoryPath);
    let hasChildRoute = false;

    for (let item of dir) {
      let itemPath = path.join(directoryPath, item);
      let stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        hasChildRoute = true;
        break;
      }
    }
    return hasChildRoute;
  }
}

export class Route extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly routePath: string,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }

  contextValue = 'route';
}
