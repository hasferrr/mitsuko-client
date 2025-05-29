import { CombinedFormat, SubtitleType } from "@/types/subtitles"
import { removeStringContentBetween } from "../content"

/**
 * Combines original and translated subtitle content with different formatting options
 */
export function combineSubtitleContent(
  original: string,
  translated: string,
  format: CombinedFormat,
  type: SubtitleType
): string {
  let cleanOriginal = original
  let cleanTranslated = translated

  // Remove new lines and clean up content
  if (format !== "{o}-t") {
    cleanOriginal = type === "ass"
      ? original.replaceAll("\\N", " ").replaceAll("  ", " ").trim()
      : original.replaceAll("\n", " ").replaceAll("  ", " ").trim()

    cleanTranslated = type === "ass"
      ? translated.replaceAll("\\N", " ").replaceAll("  ", " ").trim()
      : translated.replaceAll("\n", " ").replaceAll("  ", " ").trim()
  }

  if (format === "{o}-t") {
    cleanOriginal = removeStringContentBetween(cleanOriginal, "{", "}")
  }

  // Format based on option
  switch (format) {
    case "(o)-t":
      return `(${cleanOriginal}) ${cleanTranslated}`
    case "(t)-o":
      return `(${cleanTranslated}) ${cleanOriginal}`
    case "o-n-t":
      return type === "ass"
        ? `${cleanOriginal}\\N${cleanTranslated}`
        : `${cleanOriginal}\n${cleanTranslated}`
    case "t-n-o":
      return type === "ass"
        ? `${cleanTranslated}\\N${cleanOriginal}`
        : `${cleanTranslated}\n${cleanOriginal}`
    case "{o}-t":
      return `{${cleanOriginal}}${cleanTranslated}`
    default:
      console.error("Invalid CombinedFormat")
      return ""
  }
}
