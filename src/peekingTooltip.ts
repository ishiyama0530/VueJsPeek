'use strict'

import * as vscode from 'vscode'
import { getFirstMatchedPostion } from './lib/position'
import * as voca from 'voca'
import { grepAsync } from './lib/grep'
import { getMatchedRange } from './lib/range'
import * as path from 'path'

export async function createPeekingTooltip(
  document: vscode.TextDocument,
  hoverText: string
): Promise<vscode.Hover | undefined> {
  const vueFilePathList: string[] = findImportedVueFilePathList(document)
  const vuePathParsedList = createVuePathParsedList(vueFilePathList)
  const vuePathParsed = vuePathParsedList.find(path => {
    return (
      hoverText === path.fileName ||
      voca.kebabCase(hoverText) === path.fileName ||
      voca.camelCase(hoverText) === path.fileName ||
      voca.capitalize(voca.camelCase(hoverText)) === path.fileName
    )
  })

  if (vuePathParsed) {
    const pattern = vuePathParsed.path.startsWith('/')
      ? `**${vuePathParsed.path}`
      : `**/${vuePathParsed.path}`
    const pathList: string[] = await grepAsync(pattern, {
      absolute: true
    })
    if (pathList) {
      let path = ''
      if (pathList.length > 1) {
        path = pathList.reduce((pre, cur) => {
          return pre.length < cur.length ? pre : cur
        })
      } else {
        path = pathList[0]
      }
      const scriptText = await getComponentScriptText(path)
      if (scriptText) {
        return createPeekingTooltipContent([
          {
            title: path,
            content: `\`\`\`js${scriptText}\`\`\``
          }
        ])
      }
    }
  }
}

async function getComponentScriptText(
  uri: string
): Promise<string | undefined> {
  const document = await vscode.workspace.openTextDocument(uri)
  const scriptRange = getMatchedRange(/<script/, /<\/script>/, document)
  if (scriptRange) {
    const componentStartPosition = getFirstMatchedPostion(
      document,
      /@Component/,
      scriptRange.start,
      /<\/script>/
    )
    if (componentStartPosition) {
      const componentRange = new vscode.Range(
        componentStartPosition,
        scriptRange.end.with(scriptRange.end.line - 1) // remove for </script>
      )
      const compornentText = document.getText(componentRange)
      return compornentText
    }
  }
}

function createVuePathParsedList(
  uriList: string[]
): Array<{
  path: string
  fileName: string
}> {
  return uriList
    .map(path => {
      return { matchResult: /(\w|-)+.vue/.exec(path), path: path }
    })
    .filter(data => data.matchResult && data.matchResult.index > -1)
    .map(data => {
      const parsed = path.parse(data.path)
      return {
        path: data.path,
        fileName: parsed.name
      }
    })
}

function findImportedVueFilePathList(document: vscode.TextDocument): string[] {
  const range = getMatchedRange(/<script/, /@Component/, document)
  const text = document.getText(range)
  return voca
    .chain(text)
    .words(/(\w|\/)+\.vue(?=('|"))/g)
    .value()
}

function createPeekingTooltipContent(
  contents: Array<{ title: string; content: string }>
): vscode.Hover {
  const joined = new Array<string>()
  contents.forEach(c => {
    joined.push(c.title, c.content)
  })
  return new vscode.Hover(joined)
}
