import { ASSParseOutput, Subtitle } from "@/types/types";

import { mergeASSback } from "./ass/merge"
import { generateSRT } from "./srt/generate"

type SubtitleType = "srt" | "ass"

interface MergeSubtitleOptions {
  subtitles: Subtitle[]
  type: SubtitleType
  parsed: ASSParseOutput | null
}

export const mergeSubtitle = ({
  subtitles,
  type,
  parsed,
}: MergeSubtitleOptions): string => {
  if (type === "ass") {
    if (!parsed) {
      throw new Error("Parsed is required for ASS subtitles")
    }
    return mergeASSback(subtitles, parsed)
  } else {
    return generateSRT(subtitles)
  }
}
