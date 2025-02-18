import type { SubtitleEvent, Subtitle, Timestamp } from "../../types/types"

export function mergeSubtitles(events: SubtitleEvent[], subtitles: Subtitle[]): SubtitleEvent[] {
  const mergedEvents: SubtitleEvent[] = []
  let subtitleIndex = 0

  for (const event of events) {
    const mergedEvent = { ...event }
    if (event.format === 'Dialogue') {
      if (subtitleIndex < subtitles.length) {
        mergedEvent.text = subtitles[subtitleIndex].content
        subtitleIndex++
      } else {
        console.warn("More Dialogue events than Subtitles.")
      }
    }
    mergedEvents.push(mergedEvent)
  }

  if (subtitleIndex < subtitles.length) {
    console.warn("More Subtitles than Dialogue events. Ignoring extra subtitles")
  }

  return mergedEvents
}

export function reconstructAssSubtitle(header: string, footer: string, subtitleEvents: SubtitleEvent[]): string {
  let assString = header + '\n'
  for (const event of subtitleEvents) {
    const line = `${event.format}: ${event.layer},${event.start},${event.end},${event.style},${event.name},${event.marginL},${event.marginR},${event.marginV},${event.effect},${event.text}`
    assString += line + '\n'
  }
  if (footer) {
    assString += '\n' + footer + '\n'
  }
  return assString.trim()
}

function parseTimestamp(timestampStr: string): Timestamp {
  const [h, m, s_ms] = timestampStr.split(':')
  const [s, ms] = s_ms.split('.')

  return {
    h: parseInt(h),
    m: parseInt(m),
    s: parseInt(s),
    ms: parseInt(ms.padEnd(3, '0')), // Pad milliseconds to 3 digits
  }
}

export function convertSubtitleEventsToSubtitles(events: SubtitleEvent[]): Subtitle[] {
  const subtitles: Subtitle[] = []
  let index = 1

  for (const event of events) {
    if (event.format === 'Dialogue') {
      const subtitle: Subtitle = {
        index: index++,
        timestamp: {
          start: parseTimestamp(event.start),
          end: parseTimestamp(event.end),
        },
        actor: event.name || "",
        content: event.text,
      }
      subtitles.push(subtitle)
    }
  }

  return subtitles
}

export function extractAssHeader(assSubtitle: string): string {
  const lines = assSubtitle.split('\n')
  let header = ''
  let eventsHeaderFound = false

  for (const line of lines) {
    header += line + '\n'
    if (line.startsWith('Format:') && eventsHeaderFound) {
      break
    }
    if (line.startsWith('[Events]')) {
      eventsHeaderFound = true
    }
  }

  return header.trim()
}

export function extractAssFooter(assSubtitle: string): string {
  const lines = assSubtitle.split('\n')
  let footer = ''
  let eventsSection = false
  let footerStarted = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith('[Events]') || trimmedLine.startsWith('Format: Layer')) {
      eventsSection = true
      continue
    }
    if (eventsSection && (trimmedLine.startsWith('Dialogue:') || trimmedLine.startsWith('Comment:') || trimmedLine === "")) {
      continue // Skip Dialogue, Comment, and empty lines
    }
    if (eventsSection && trimmedLine !== "") {
      footerStarted = true // Start footer when non-empty line is found
    }
    if (footerStarted) {
      footer += line + '\n'
    }
  }

  return footer.trim()
}

export function parseASSEvents(assSubtitle: string): SubtitleEvent[] {
  const lines = assSubtitle.split('\n')
  let formatLine = ''
  const events: SubtitleEvent[] = []
  let formatKeys: string[] = []

  // Find the [Events] section and the Format line
  let eventsSection = false
  for (const line of lines) {
    const trimmedLine = line.trim() // Trim the line

    if (trimmedLine.startsWith('[Events]')) {
      eventsSection = true
      continue
    }
    if (eventsSection && trimmedLine.startsWith('Format:')) {
      formatLine = trimmedLine.substring(8).trim()
      formatKeys = formatLine.split(',').map((key) => key.trim())
      continue
    }

    if (eventsSection && (trimmedLine.startsWith('Dialogue:') || trimmedLine.startsWith('Comment:'))) { // Handle Dialogue and Comment
      const lineType = trimmedLine.startsWith('Dialogue:') ? 'Dialogue' : 'Comment'
      const linePrefixLength = lineType.length + 2 // "Dialogue: " or "Comment: "

      const rawValues = trimmedLine.substring(linePrefixLength).split(',')
      // Correctly handle commas in the Text field.
      const values: string[] = []
      let textValue = ""
      let textValueStarted = false

      for (let i = 0; i < rawValues.length; i++) {
        if (i < formatKeys.length - 1) {
          // Regular fields before 'Text'
          values.push(rawValues[i].trim())
        } else {
          // Accumulate the Text field, handling commas
          if (!textValueStarted) {
            textValueStarted = true
            textValue = rawValues[i]
          } else {
            textValue += "," + rawValues[i]
          }
        }
      }

      if (textValue) values.push(textValue.trim())

      // Combine formatKeys and values into an initial object
      const rawEvent: { [key: string]: string } = {}
      formatKeys.forEach((key, index) => {
        // Ensure that we don't access values out of bounds
        rawEvent[key] = (values[index] || '').trim()
      })

      // Create the final object with the correct keys and types.
      const event: SubtitleEvent = {
        format: lineType, // Use the determined line type
        layer: parseInt(rawEvent.Layer || '0'), // Default to 0 if Layer is missing
        start: rawEvent.Start,
        end: rawEvent.End,
        style: rawEvent.Style,
        name: rawEvent.Name,
        marginL: rawEvent.MarginL,
        marginR: rawEvent.MarginR,
        marginV: rawEvent.MarginV,
        effect: rawEvent.Effect,
        text: rawEvent.Text,
      }

      events.push(event)
    } else if (eventsSection && trimmedLine !== "") {
      // Stop if not Dialogue/Comment AND not empty
      // Stop parsing if we're in the events section, but the line is NOT a Dialogue or Comment
      break
    }
  }

  return events
}
