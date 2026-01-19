import { Subtitle, Parsed, SubtitleType } from "@/types/subtitles"
import { isSubtitle } from "./is-subtitle"
import { _parseASS } from "./ass/parse"
import { _parseSRT } from "./srt/parse"
import { _parseVTT } from "./vtt/parse"

interface ParseSubtitleOptions {
  type?: SubtitleType
  content: string
}

interface ParseSubtitleResult {
  subtitles: Subtitle[]
  parsed: Parsed
}

export const parseSubtitle = ({ content, type }: ParseSubtitleOptions): ParseSubtitleResult => {
  if (type === "srt" || (!type && isSubtitle(content, "srt"))) {
    return {
      subtitles: _parseSRT(content),
      parsed: {
        type: "srt",
        data: null
      }
    }
  }

  if (type === "ass" || (!type && isSubtitle(content, "ass"))) {
    const parsed = _parseASS(content)
    return {
      subtitles: parsed.subtitles,
      parsed: {
        type: "ass",
        data: parsed.data
      }
    }
  }

  if (type === "vtt" || (!type && isSubtitle(content, "vtt"))) {
    return {
      subtitles: _parseVTT(content),
      parsed: {
        type: "vtt",
        data: null
      }
    }
  }

  throw new Error("Invalid subtitle type")
}
