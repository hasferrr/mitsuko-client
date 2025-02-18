import type { Subtitle, Timestamp } from '../../types/types'

export function parseTimestamp(timestamp: string): Timestamp {
  const [hms, ms] = timestamp.split(',')
  const [h, m, s] = hms.split(':').map(Number)
  return { h, m, s, ms: Number(ms) }
}

export function parseSRT(fileContent: string): Subtitle[] {
  const lines = fileContent.split('\n')
  const subtitles: Subtitle[] = []
  let currentSubtitle: Partial<Subtitle> = {}

  for (let line of lines) {
    line = line.replaceAll('\r', '').trim()
    if (line === '') {
      if (currentSubtitle.index !== undefined) {
        subtitles.push(currentSubtitle as Subtitle)
        currentSubtitle = {}
      }
    } else if (currentSubtitle.index === undefined) {
      currentSubtitle.index = parseInt(line, 10)
    } else if (currentSubtitle.timestamp === undefined) {
      const [start, end] = line.split(' --> ')
      currentSubtitle.timestamp = {
        start: parseTimestamp(start),
        end: parseTimestamp(end),
      }
    } else {
      if (currentSubtitle.content === undefined) {
        currentSubtitle.content = line
      } else {
        currentSubtitle.content += '\n' + line
      }
    }
  }

  if (currentSubtitle.index !== undefined) {
    currentSubtitle.actor = ""
    subtitles.push(currentSubtitle as Subtitle)
  }

  return subtitles
}
