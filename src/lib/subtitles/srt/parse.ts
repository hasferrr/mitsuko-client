import type { Subtitle, Timestamp } from '../../../types/subtitles'

function parseTimestamp(timestamp: string): Timestamp {
  const [hms, ms] = timestamp.split(',')
  const [h, m, s] = hms.split(':').map(Number)
  return { h, m, s, ms: Number(ms) }
}

export function parseSRT(fileContent: string): Subtitle[] {
  const lines = fileContent.trim().split('\n').map(line => line.trim())
  const subtitles: Subtitle[] = []

  let i = 0
  while (i < lines.length && !lines[i].includes("-->")) {
    i++
  }

  let currentIndex = 1
  while (i < lines.length) {
    const index = currentIndex
    const timestamp = lines[i].split("-->")
    const start = parseTimestamp(timestamp[0].trim())
    const end = parseTimestamp(timestamp[1].trim())
    const content: string[] = []
    i++

    while (i < lines.length) {
      if (lines[i].includes("-->")) {
        while (content.length && !content[content.length - 1]) {
          content.pop()
        }
        content.pop()
        break
      }
      content.push(lines[i])
      i++
    }

    subtitles.push({
      index,
      timestamp: { start, end },
      actor: "",
      content: content.join("\n").trim(),
    })
    currentIndex++
  }

  return subtitles
}
