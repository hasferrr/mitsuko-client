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
  return subtitles.map((subtitle) => {
    const original = subtitle[field]
    const result: string[] = []

    let l = 0
    let r = 0
    let skipCount = 0

    while (l < original.length) {
      if (r >= original.length) {
        result.push(original[l])
        l++
        continue
      }

      if (skipCount > 0) {
        if (original.slice(r, r + customStart.length) === customStart) {
          skipCount += 1
          r += customStart.length
          continue
        }
        if (original.slice(r, r + customEnd.length) === customEnd) {
          skipCount -= 1
          r += customEnd.length
          if (r < original.length) {
            l = r
          }
          continue
        }
        r++
        continue
      }

      if (original.slice(l, l + customStart.length) === customStart) {
        skipCount += 1
        r += customStart.length
        continue
      }

      result.push(original[l])
      l++
      r++
    }

    return {
      ...subtitle,
      [field]: result.join("").replace(/\s+/g, " ").trim()
    }
  })
}
