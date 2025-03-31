import { SubtitleTranslated } from "@/types/types"

export function removeAllLineBreaks(
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

export function removeContentBetween(
  subtitles: SubtitleTranslated[],
  field: "content" | "translated",
  customStart: string,
  customEnd: string
): SubtitleTranslated[] {
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const regex = new RegExp(`${escapeRegExp(customStart)}(.*?)${escapeRegExp(customEnd)}`, "g")
  return subtitles.map((subtitle) => ({
    ...subtitle,
    [field]: subtitle[field].replace(regex, "").trim()
  }))
}
