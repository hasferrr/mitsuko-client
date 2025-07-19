import type { Subtitle, Timestamp } from "../../../types/subtitles"

function parseTimestamp(timestamp: string): Timestamp {
  const cleaned = timestamp.trim().replace(',', '.')
  const [hms, msStr] = cleaned.split('.')
  const [hStr, mStr, sStr] = hms.split(':')

  const h = sStr ? Number(hStr) : 0
  const m = sStr ? Number(mStr) : Number(hStr)
  const s = sStr ? Number(sStr) : Number(mStr)
  const ms = Number(msStr)

  return { h, m, s, ms }
}

export function _parseVTT(fileContent: string): Subtitle[] {
  const lines = fileContent.trim().split('\n').map(l => l.trim())
  const subtitles: Subtitle[] = []

  let i = 0
  // Skip WEBVTT header
  if (lines[i]?.toLowerCase().startsWith('webvtt')) {
    i++
  }
  // Skip metadata or blank lines until first timestamp
  while (i < lines.length && !lines[i].includes('-->')) {
    i++
  }

  let currentIndex = 1
  while (i < lines.length) {
    // Possible cue identifier before timestamp line
    if (!lines[i].includes('-->')) {
      i++
      continue
    }

    const [startRaw, endPart] = lines[i].split('-->')
    const start = parseTimestamp(startRaw.trim())
    const endStr = endPart.trim().split(' ')[0]
    const end = parseTimestamp(endStr)
    i++

    const contentLines: string[] = []
    while (i < lines.length && lines[i] !== '' && !lines[i].includes('-->')) {
      contentLines.push(lines[i])
      i++
    }

    // Skip blank line between cues
    while (i < lines.length && lines[i] === '') {
      i++
    }

    subtitles.push({
      index: currentIndex,
      timestamp: { start, end },
      actor: "",
      content: contentLines.join('\n').trim(),
    })

    currentIndex++
  }

  return subtitles
}