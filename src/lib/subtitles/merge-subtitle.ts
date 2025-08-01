import { Parsed, Subtitle } from "@/types/subtitles";
import { _mergeASSback } from "./ass/merge"
import { _generateSRT } from "./srt/generate"
import { _generateVTT } from "./vtt/generate"

interface MergeSubtitleOptions {
  subtitles: Subtitle[]
  parsed: Parsed
}

export const mergeSubtitle = ({
  subtitles,
  parsed,
}: MergeSubtitleOptions): string => {
  if (parsed.type === "ass") {
    return _mergeASSback(subtitles, parsed.data)
  }

  if (parsed.type === "srt") {
    return _generateSRT(subtitles)
  }

  if (parsed.type === "vtt") {
    return _generateVTT(subtitles)
  }

  throw new Error("Invalid subtitle type")
}
