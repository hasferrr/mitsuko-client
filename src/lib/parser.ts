import type { SubOnlyTranslated, Subtitle, SubtitleNoTimeNoActorTranslated } from "../types/types"
import { isSRT } from "./subtitle-utils"
import { parseSRT } from "./srt/parse"

export function keepOnlyWrapped(text: string, a: string, b: string): string {
  const startA = text.indexOf(a)
  if (startA === -1) return ''
  const startB = text.indexOf(b, startA + a.length)
  if (startB === -1) return ''
  return text.substring(startA, startB + b.length)
}

export function removeWrapped(text: string, a: string, b: string): string {
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
  return removedThink
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

export function parseTranscription(response: string): Subtitle[] {
  let text = response.trim()
  text = keepOnlyWrapped(text, "```", "```") || text

  const lines = text.split("\n").filter((line) => line.trim() !== "")

  const check = (i: number) => lines.length > 0 && (
    lines[i].trim().startsWith("[") || lines[i].trim().startsWith("```")
  )
  while (check(lines.length - 1)) lines.pop()
  while (check(0)) lines.shift()

  let i = 1
  let srtArr: string[] = []

  /**
   * Format:
   * mm:ss:ms --> mm:ss:ms
   * Transcribed Text
   */
  for (let line of lines) {
    line = line.trim()
    const splitted = line.split("-->")
    if (splitted.length === 2) {
      let [start, end] = splitted
      start = start.trim()
      end = end.trim()

      const [startMinuteStr, startSecondStr, startMillisecondStr] = start.split(":")
      const [endMinuteStr, endSecondStr, endMillisecondStr] = end.split(":")

      const startMinute = parseInt(startMinuteStr, 10)
      const startSecond = parseInt(startSecondStr, 10)
      const startMillisecond = parseInt(startMillisecondStr, 10)
      const endMinute = parseInt(endMinuteStr, 10)
      const endSecond = parseInt(endSecondStr, 10)
      const endMillisecond = parseInt(endMillisecondStr, 10)

      if (isNaN(startMinute) || isNaN(startSecond) || isNaN(startMillisecond) ||
        isNaN(endMinute) || isNaN(endSecond) || isNaN(endMillisecond)) {
        throw new Error("Invalid time format in transcription text")
      }

      const s = `00:${startMinute.toString().padStart(2, '0')}:${startSecond.toString().padStart(2, '0')},${startMillisecond.toString().padStart(3, '0')}`
      const e = `00:${endMinute.toString().padStart(2, '0')}:${endSecond.toString().padStart(2, '0')},${endMillisecond.toString().padStart(3, '0')}`

      srtArr.push(`\n${i}\n${s} --> ${e}`)
      i++
    } else {
      srtArr.push(line)
    }
  }

  const srt = srtArr.join("\n")
  if (!isSRT(srt)) {
    throw new Error("Invalid SRT format")
  }

  return parseSRT(srt)
}
