import type { SubOnlyTranslated, Subtitle, SubtitleNoTimeNoActorTranslated } from "../../types/types"
import { isSRT } from "../subtitles/is"
import { parseSRT } from "../subtitles/srt/parse"
import { keepOnlyWrapped, removeWrapped, cleanUpJsonResponse } from "./cleaner"
import { repairJson } from "./repairer"

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
