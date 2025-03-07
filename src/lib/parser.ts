import type { SubOnlyTranslated, SubtitleNoTimeNoActorTranslated } from "../types/types"

function keepOnlyWrapped(text: string, a: string, b: string): string {
  const startA = text.indexOf(a)
  if (startA === -1) return ''
  const startB = text.indexOf(b, startA + a.length)
  if (startB === -1) return ''
  return text.substring(startA, startB + b.length)
}

function removeWrapped(text: string, a: string, b: string): string {
  const startA = text.indexOf(a)
  if (startA === -1) return text
  const startB = text.indexOf(b, startA + a.length)
  if (startB === -1) return text
  return text.substring(0, startA) + text.substring(startB + b.length)
}

export function cleanUpJsonResponse(response: string): string {
  const a = '```json'
  const b = '```'
  const removedThink = removeWrapped(response, '<think>', '</think>')
  const jsonString = keepOnlyWrapped(removedThink, a, b).replace(a, '').replace(b, '')
    || keepOnlyWrapped(removedThink, b, b).replaceAll(b, '')
    || removedThink.replaceAll(a, '').replaceAll(b, '')
    || '[]'
  return jsonString
}

export function repairJson(input: string): string {
  input = input.trim()
  let openBraces = 0, closeBraces = 0, lastBalancedIndex = 1
  let inString = false
  let quoteChar: "'" | '"' | null = null

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    // The current character is a quote `"` or `'` and it's not escaped.
    if ((char === '"' || char === "'") && input[i - 1] !== '\\') {
      let backslashes = 0
      for (let j = i - 1; j >= 0 && input[j] === "\\"; j--) {
        backslashes++
      }
      if (backslashes % 2 !== 0) {
        if (inString && quoteChar === char) {
          // we've found the closing quote of the string
          inString = false
          quoteChar = null
        } else if (!inString) {
          // we've encountered the opening quote of a new string
          inString = true
          quoteChar = char
        }
      }
    }

    // Determining the last index where the braces are balanced
    if (!inString) {
      if (char === '{') openBraces++
      else if (char === '}') closeBraces++
      if (openBraces === closeBraces && openBraces > 0) {
        lastBalancedIndex = i + 1
      }
    }
  }

  if (openBraces === 0) {
    return input
  }

  let result = input.slice(0, lastBalancedIndex).trim()
  if (result.endsWith(',')) {
    result = result.slice(0, -1)
  }
  if (result.startsWith('[') && !result.endsWith(']')) {
    result += ']'
  }
  return result
}

export function getThink(response: string): string {
  return keepOnlyWrapped(response, '<think>', '</think>')
}

export function getContent(response: string): string {
  const removedThink = removeWrapped(response, '<think>', '</think>')
  return removedThink.trim()
}

export function parseTranslationJson(response: string): SubOnlyTranslated[] {
  const subtitles = JSON.parse(repairJson(cleanUpJsonResponse(response))) as SubtitleNoTimeNoActorTranslated[]
  return subtitles.map((sub) => ({
    index: sub.index,
    translated: sub.translated || "",
  }))
}

export function parseTranslationJsonStrict(response: string): SubOnlyTranslated[] {
  const subtitles = JSON.parse(cleanUpJsonResponse(response)) as SubtitleNoTimeNoActorTranslated[]
  return subtitles.map((sub) => ({
    index: sub.index,
    translated: sub.translated || "",
  }))
}
