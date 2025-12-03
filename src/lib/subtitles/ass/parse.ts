import type { ASSParseOutput, Subtitle } from "../../../types/subtitles"
import { extractAssHeader, extractAssFooter, parseASSEvents, convertSubtitleEventsToSubtitles } from "./helper"

interface ParsedResult {
  subtitles: Subtitle[]
  data: ASSParseOutput
}

export function _parseASS(fileContent: string): ParsedResult {
  const events = parseASSEvents(fileContent)
  return {
    subtitles: convertSubtitleEventsToSubtitles(events),
    data: {
      header: extractAssHeader(fileContent),
      events: events,
      footer: extractAssFooter(fileContent),
    }
  }
}
