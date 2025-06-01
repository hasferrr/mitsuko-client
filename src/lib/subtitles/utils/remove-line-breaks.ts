import { SubtitleTranslated } from "@/types/subtitles"

export function removeLineBreaks(
  subtitles: SubtitleTranslated[],
  field: "content" | "translated",
  isAss: boolean
): SubtitleTranslated[] {
  return subtitles.map((subtitle) => {
    const updatedContent = isAss
      ? subtitle[field].replaceAll("\\N", " ").replaceAll("\n", " ").replaceAll("  ", " ")
      : subtitle[field].replaceAll("\n", " ").replaceAll("  ", " ")
    return { ...subtitle, [field]: updatedContent }
  })
}
