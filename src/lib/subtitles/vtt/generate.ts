import type { Subtitle, Timestamp } from "../../../types/subtitles"

function formatTimestamp(timestamp: Timestamp): string {
  const { h, m, s, ms } = timestamp
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

export function _generateVTT(subtitles: Subtitle[]): string {
  let vttContent = 'WEBVTT\n\n'

  for (const subtitle of subtitles) {
    const { index, timestamp, content } = subtitle
    const startTime = formatTimestamp(timestamp.start)
    const endTime = formatTimestamp(timestamp.end)

    vttContent += `${index}\n`
    vttContent += `${startTime} --> ${endTime}\n`
    vttContent += `${content}\n\n`
  }

  return vttContent.trim()
}