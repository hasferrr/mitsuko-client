import { SubtitleType } from "@/types/subtitles"

export const SUBTITLE_NAME_MAP = new Map<SubtitleType, string>([
  ["srt", "SRT"],
  ["ass", "SSA"],
  ["vtt", "VTT"],
])

export const ACCEPTED_FORMATS = Array.from(SUBTITLE_NAME_MAP.keys()).map(key => `.${key}`)
