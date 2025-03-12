import { SubtitleNoTime, SubtitleNoTimeNoActorTranslated } from "@/types/types";

export const createContextMemory = (
  subtitles:
    Record<"subtitles", SubtitleNoTime[]>
    | Record<"subtitles", SubtitleNoTimeNoActorTranslated[]>
    | SubtitleNoTime[]
    | SubtitleNoTimeNoActorTranslated[]
): string => {
  if (Array.isArray(subtitles)) {
    return JSON.stringify({ subtitles })
  }
  return JSON.stringify(subtitles)
}
