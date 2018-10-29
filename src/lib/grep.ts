"use strict";

import * as globby from "globby";
import * as vscode from "vscode";

export async function grepAsync(
  patterns: string | string[],
  option: { absolute: boolean } = {
    absolute: false
  }
): Promise<string[]> {
  return globby(patterns, {
    cwd: vscode.workspace.rootPath,
    case: false,
    followSymlinkedDirectories: false,
    absolute: option.absolute,
    ignore: ["**/node_modules/**"]
  });
}

export function grepSync(
  patterns: string | string[],
  option: { absolute: boolean } = {
    absolute: false
  }
): string[] {
  return globby.sync(patterns, {
    cwd: vscode.workspace.rootPath,
    case: false,
    followSymlinkedDirectories: false,
    absolute: option.absolute,
    ignore: ["**/node_modules/**"]
  });
}
