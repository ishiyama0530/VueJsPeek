'use strict'

import * as vscode from 'vscode'
import { createPeekingTooltip } from './peekingTooltip'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('vue', {
      provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
      ): Promise<vscode.Hover | undefined> {
        const text = getText(document, position)
        if (text) {
          return createPeekingTooltip(document, text)
        } else {
          return new Promise<undefined>(resolve => resolve())
        }
      }
    })
  )
}

function getText(
  document: vscode.TextDocument,
  position: vscode.Position
): string {
  const targetRange = document.getWordRangeAtPosition(
    position,
    /<.+?-?.+?(>| )/
  )
  const targetText = document.getText(targetRange)
  const formatedText = targetText
    .replace('<', '')
    .replace('>', '')
    .replace('/', '')
    .trim()
  return formatedText
}
