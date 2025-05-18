import { SubtitleTranslated } from "@/types/subtitles"

interface CountUntranslatedLinesResult {
  untranslated: [number, number][]
  missingOriginal: [number, number][]
}

export const countUntranslatedLines = (subtitles: SubtitleTranslated[]): CountUntranslatedLinesResult => {
  const untranslatedIndices: number[] = []
  const missingOriginalIndices: number[] = []

  // Single pass to collect indices for untranslated and missing original lines
  subtitles.forEach((sub, index) => {
    if (sub.translated.trim() === "") {
      untranslatedIndices.push(index + 1) // +1 to convert to 1-based index
    }

    if (sub.content.trim() === "") {
      missingOriginalIndices.push(index + 1) // +1 to convert to 1-based index
    }
  })

  // Calculate untranslated intervals as [start, end][]
  const untranslatedResult: [number, number][] = []
  if (untranslatedIndices.length > 0) {
    let start = untranslatedIndices[0]
    let end = untranslatedIndices[0]

    for (let i = 1; i < untranslatedIndices.length; i++) {
      if (untranslatedIndices[i] === end + 1) {
        end = untranslatedIndices[i]
      } else {
        untranslatedResult.push([start, end])
        start = untranslatedIndices[i]
        end = untranslatedIndices[i]
      }
    }
    untranslatedResult.push([start, end]) // Add the last interval
  }

  // Calculate missing original intervals as [start, end][]
  const missingOriginalResult: [number, number][] = []
  if (missingOriginalIndices.length > 0) {
    let start = missingOriginalIndices[0]
    let end = missingOriginalIndices[0]

    for (let i = 1; i < missingOriginalIndices.length; i++) {
      if (missingOriginalIndices[i] === end + 1) {
        end = missingOriginalIndices[i]
      } else {
        missingOriginalResult.push([start, end])
        start = missingOriginalIndices[i]
        end = missingOriginalIndices[i]
      }
    }
    missingOriginalResult.push([start, end]) // Add the last interval
  }

  return {
    untranslated: untranslatedResult,
    missingOriginal: missingOriginalResult,
  }
}
