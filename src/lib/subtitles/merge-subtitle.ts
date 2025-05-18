import { Parsed, Subtitle } from "@/types/subtitles";
import { _mergeASSback } from "./ass/merge"
import { _generateSRT } from "./srt/generate"

interface MergeSubtitleOptions {
  subtitles: Subtitle[]
  parsed: Parsed
}

export const mergeSubtitle = ({
  subtitles,
  parsed,
}: MergeSubtitleOptions): string => {
  if (parsed.type === "ass") {
    if (!parsed.data) {
      throw new Error("Parsed is required for ASS subtitles")
    }
    return _mergeASSback(subtitles, parsed.data)
  }

  if (parsed.type === "srt") {
    return _generateSRT(subtitles)
  }

  throw new Error("Invalid subtitle type")
}
