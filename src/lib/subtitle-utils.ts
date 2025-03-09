import { Subtitle, SubtitleNoTime, SubtitleTranslated, Timestamp } from "@/types/types"

export function isASS(content: string): boolean {
  return content.trim().startsWith('[Script Info]')
}

export function isSRT(content: string): boolean {
  const lines = content.trim().split('\n', 2)
  const firstLine = lines[0]
  const secondLine = lines[1]
  return !isNaN(Number(firstLine)) && secondLine.includes(' --> ')
}

export function removeTimestamp(subtitles: Subtitle[]): SubtitleNoTime[] {
  return subtitles.map(sub => ({
    index: sub.index,
    actor: sub.actor,
    content: sub.content,
  }))
}

export function removeAllLineBreaks(
  subtitles: SubtitleTranslated[],
  field: "content" | "translated",
  isAss: boolean
): SubtitleTranslated[] {
  return subtitles.map((subtitle) => {
    const updatedContent = isAss
      ? subtitle[field].replaceAll("\\N", " ").replaceAll("\n", " ").replaceAll("  ", " ")
      : subtitle[field].replaceAll("\n", " ").replaceAll("  ", " ")
    return { ...subtitle, [field]: updatedContent }
  })
}

export function removeContentBetween(
  subtitles: SubtitleTranslated[],
  field: "content" | "translated",
  customStart: string,
  customEnd: string
): SubtitleTranslated[] {
  const regex = new RegExp(`${escapeRegExp(customStart)}(.*?)${escapeRegExp(customEnd)}`, "g")
  return subtitles.map((subtitle) => ({
    ...subtitle,
    [field]: subtitle[field].replace(regex, "").trim()
  }))
}

export function shiftSubtitles(
  subtitles: SubtitleTranslated[],
  shiftMs: number
): SubtitleTranslated[] {
  return subtitles.map((subtitle) => {
    const startMs = parseTimestamp(subtitle.timestamp.start)
    const endMs = parseTimestamp(subtitle.timestamp.end)

    const newStartMs = Math.max(0, startMs + shiftMs)
    const newEndMs = Math.max(0, endMs + shiftMs)

    return {
      ...subtitle,
      timestamp: {
        start: formatTimestamp(newStartMs),
        end: formatTimestamp(newEndMs)
      }
    }
  })
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseTimestamp(timestamp: Timestamp): number {
  return timestamp.h * 3600000 + timestamp.m * 60000 + timestamp.s * 1000 + timestamp.ms
}

function formatTimestamp(timeMs: number): Timestamp {
  const h = Math.floor(timeMs / 3600000)
  const m = Math.floor((timeMs % 3600000) / 60000)
  const s = Math.floor((timeMs % 60000) / 1000)
  const ms = timeMs % 1000
  return { h, m, s, ms }
}
