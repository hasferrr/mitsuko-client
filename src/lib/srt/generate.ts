import type { Timestamp, Subtitle } from '../../types/types'

function formatTimestamp(timestamp: Timestamp): string {
  const { h, m, s, ms } = timestamp
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

export function generateSRT(subtitles: Subtitle[]): string {
  let srtContent = ''

  for (const subtitle of subtitles) {
    const { index, timestamp, content } = subtitle
    const startTime = formatTimestamp(timestamp.start)
    const endTime = formatTimestamp(timestamp.end)

    srtContent += `${index}\n`
    srtContent += `${startTime} --> ${endTime}\n`
    srtContent += `${content}\n\n`
  }

  return srtContent.trim()
}
