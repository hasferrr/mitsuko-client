import { CombinedFormat } from "@/types/subtitles"

/**
 * Combines original and translated subtitle content with different formatting options
 */
export function combineSubtitleContent(
  original: string,
  translated: string,
  format: CombinedFormat,
  isAss: boolean
): string {
  // Remove new lines and clean up content
  const cleanOriginal = isAss
    ? original.replaceAll("\\N", " ").replaceAll("  ", " ").trim()
    : original.replaceAll("\n", " ").replaceAll("  ", " ").trim()

  const cleanTranslated = isAss
    ? translated.replaceAll("\\N", " ").replaceAll("  ", " ").trim()
    : translated.replaceAll("\n", " ").replaceAll("  ", " ").trim()

  // Format based on option
  switch (format) {
    case "(o)-t":
      return `(${cleanOriginal}) ${cleanTranslated}`
    case "(t)-o":
      return `(${cleanTranslated}) ${cleanOriginal}`
    case "o-n-t":
      return isAss
        ? `${cleanOriginal}\\N${cleanTranslated}`
        : `${cleanOriginal}\n${cleanTranslated}`
    case "t-n-o":
      return isAss
        ? `${cleanTranslated}\\N${cleanOriginal}`
        : `${cleanTranslated}\n${cleanOriginal}`
    default:
      console.error("Invalid CombinedFormat")
      return ""
  }
}
