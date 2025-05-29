import { SubtitleTranslated } from "@/types/subtitles"

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

export function removeStringContentBetween(
  text: string,
  customStart: string,
  customEnd: string
): string {
  const result: string[] = []

  let l = 0
  let r = 0
  let skipCount = 0

  while (l < text.length) {
    if (r >= text.length) {
      result.push(text[l])
      l++
      continue
    }

    if (skipCount > 0) {
      if (text.slice(r, r + customStart.length) === customStart) {
        skipCount += 1
        r += customStart.length
        continue
      }
      if (text.slice(r, r + customEnd.length) === customEnd) {
        skipCount -= 1
        r += customEnd.length
        if (r < text.length) {
          l = r
        }
        continue
      }
      r++
      continue
    }

    if (text.slice(l, l + customStart.length) === customStart) {
      skipCount += 1
      r += customStart.length
      continue
    }

    result.push(text[l])
    l++
    r++
  }

  return result.join("").replace(/\s+/g, " ").trim()
}

export function removeContentBetween(
  subtitles: SubtitleTranslated[],
  field: "content" | "translated",
  customStart: string,
  customEnd: string
): SubtitleTranslated[] {
  return subtitles.map((subtitle) => {
    const original = subtitle[field]
    const processed = removeStringContentBetween(original, customStart, customEnd)

    return {
      ...subtitle,
      [field]: processed
    }
  })
}
