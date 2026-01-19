import { SubtitleType } from "@/types/subtitles"

function isASS(content: string): boolean {
  return content.includes('[Script Info]')
}

function isSRT(content: string): boolean {
  const lines = content.split('\n', 2)
  const firstLine = lines[0]
  const secondLine = lines[1]
  return !isNaN(Number(firstLine)) && secondLine?.includes(' --> ')
}

function isVTT(content: string): boolean {
  return content.toLowerCase().startsWith('webvtt')
}

export function isSubtitle(content: string, type: SubtitleType): boolean {
  const trimmed = content.trim()
  if (!trimmed) return false

  if (type === 'ass') return isASS(trimmed)
  if (type === 'srt') return isSRT(trimmed)
  if (type === 'vtt') return isVTT(trimmed)

  return false
}
