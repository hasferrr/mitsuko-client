import { Subtitle, SubtitleNoTime, SubtitleTranslated, Timestamp } from "@/types/subtitles"

/**
 * Converts a Timestamp object to a string in the format "HH:MM:SS,MS".
 *
 * @param timestamp The Timestamp object to convert.
 * @returns The formatted timestamp string.
 */
export function timestampToString(timestamp: Timestamp): string {
  const hours = String(timestamp.h).padStart(2, '0')
  const minutes = String(timestamp.m).padStart(2, '0')
  const seconds = String(timestamp.s).padStart(2, '0')
  const milliseconds = String(timestamp.ms).padStart(3, '0')

  return `${hours}:${minutes}:${seconds},${milliseconds}`
}

export function removeTimestamp(subtitles: Subtitle[]): SubtitleNoTime[] {
  return subtitles.map(sub => ({
    index: sub.index,
    actor: sub.actor,
    content: sub.content,
  }))
}

export function shiftSubtitles(
  subtitles: SubtitleTranslated[],
  shiftMs: number
): SubtitleTranslated[] {
  function timestampToMs(timestamp: Timestamp): number {
    return timestamp.h * 3600000 + timestamp.m * 60000 + timestamp.s * 1000 + timestamp.ms
  }

  function msToTimestamp(timeMs: number): Timestamp {
    const h = Math.floor(timeMs / 3600000)
    const m = Math.floor((timeMs % 3600000) / 60000)
    const s = Math.floor((timeMs % 60000) / 1000)
    const ms = timeMs % 1000
    return { h, m, s, ms }
  }

  return subtitles.map((subtitle) => {
    const startMs = timestampToMs(subtitle.timestamp.start)
    const endMs = timestampToMs(subtitle.timestamp.end)

    const newStartMs = Math.max(0, startMs + shiftMs)
    const newEndMs = Math.max(0, endMs + shiftMs)

    return {
      ...subtitle,
      timestamp: {
        start: msToTimestamp(newStartMs),
        end: msToTimestamp(newEndMs)
      }
    }
  })
}
