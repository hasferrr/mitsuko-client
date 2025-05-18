import type { Subtitle, ASSParseOutput } from "../../../types/subtitles"
import { mergeSubtitles, reconstructAssSubtitle } from "./helper"

export function mergeASSback(subtitles: Subtitle[], parsed: ASSParseOutput): string {
  const newEvents = mergeSubtitles(parsed.events, subtitles)
  const merged = reconstructAssSubtitle(parsed.header, parsed.footer, newEvents)
  return merged
}
