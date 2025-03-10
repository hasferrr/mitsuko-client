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
    || `{"subtitles":[]}`
  return jsonString
}

export function isEscaped(str: string, index: number): boolean {
  let backslashes = 0
  for (let i = index - 1; i >= 0 && str[i] === '\\'; i--) {
    backslashes++
  }
  return backslashes > 0 && backslashes % 2 !== 0
}

export function repairJson(input: string): string {
  input = input.trim()

  type OpenBracket = "{" | "["
  type CloseBracket = "}" | "]"
  type Index = number

  const stack: [OpenBracket, Index][] = []
  const candidate = new Set(["{", "[", "}", "]"])
  const map = new Map<OpenBracket, CloseBracket>()
  map.set("{", "}")
  map.set("[", "]")

  let lastBalancedIndex = 0

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (candidate.has(char) && isEscaped(input, i)) continue

    if (char === "{") {
      stack.push([char, i])
    } else if (char === "[") {
      stack.push([char, i])
    } else if (char === "}") {
      if (stack[stack.length - 1][0] === "{") {
        stack.pop()
        lastBalancedIndex = i + 1
      }
    } else if (char === "]") {
      if (stack[stack.length - 1][0] === "[") {
        stack.pop()
        lastBalancedIndex = i + 1
      }
    }
  }

  if (lastBalancedIndex === 0) {
    return `{"subtitles":[]}`
  }

  input = input.slice(0, lastBalancedIndex).trim()

  while (stack.length > 0 && stack[stack.length - 1][1] > lastBalancedIndex) {
    stack.pop()
  }
  while (stack.length > 0) {
    input += map.get(stack.pop()![0])
  }

  return input
}

export function getThink(response: string): string {
  return keepOnlyWrapped(response, '<think>', '</think>')
}

export function getContent(response: string): string {
  const removedThink = removeWrapped(response, '<think>', '</think>')
  return removedThink.trim()
}

export function parseTranslationJson(response: string): SubOnlyTranslated[] {
  const repaired = repairJson(cleanUpJsonResponse(response))
  const parsed = JSON.parse(repaired) as Record<"subtitles", SubtitleNoTimeNoActorTranslated[]> | SubtitleNoTimeNoActorTranslated[]
  const subtitles = Array.isArray(parsed) ? parsed : parsed.subtitles
  return subtitles.map((sub) => ({
    index: sub.index,
    translated: sub.translated || "",
  }))
}

export function parseTranslationArrayStrict(response: string): SubOnlyTranslated[] {
  const subtitles = JSON.parse(cleanUpJsonResponse(response)) as SubtitleNoTimeNoActorTranslated[]
  return subtitles.map((sub) => ({
    index: sub.index,
    translated: sub.translated || "",
  }))
}
