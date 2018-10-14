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
        const targetRange = document.getWordRangeAtPosition(
          position,
          /<.+?-?.+?(>| )/
        )

        const targetText = document.getText(targetRange)
        const formmtedText = targetText
          .replace('<', '')
          .replace('>', '')
          .replace('/', '')
          .trim()

        if (formmtedText) {
          return createPeekingTooltip(document, formmtedText)
        } else {
          return new Promise<undefined>(resolve => resolve())
        }
      }
    })
  )
}
