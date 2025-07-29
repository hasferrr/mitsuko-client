import { SubtitleType } from "@/types/subtitles"
import { parseSubtitle } from "../parse-subtitle"
import { mergeSubtitle } from "../merge-subtitle"


export function convertSubtitle(
  content: string,
  fromType: SubtitleType,
  toType: SubtitleType,
): string {
  if (fromType === toType) {
    return content
  }

  const parseResult = parseSubtitle({ content, type: fromType })

  const convertedParsed = {
    ...parseResult.parsed,
    type: toType
  }

  return mergeSubtitle({
    subtitles: parseResult.subtitles,
    parsed: convertedParsed
  })
}
