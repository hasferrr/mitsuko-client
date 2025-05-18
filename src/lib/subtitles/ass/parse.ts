import type { ASSParseOutput } from "../../../types/subtitles"
import { extractAssHeader, extractAssFooter, parseASSEvents, convertSubtitleEventsToSubtitles } from "./helper"

export function parseASS(fileContent: string): ASSParseOutput {
  const events = parseASSEvents(fileContent)
  return {
    subtitles: convertSubtitleEventsToSubtitles(events),
    header: extractAssHeader(fileContent),
    events: events,
    footer: extractAssFooter(fileContent),
  }
}
