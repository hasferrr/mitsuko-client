import { SubtitleNoTime, SubtitleNoTimeNoActorTranslated } from "./subtitles"

interface CompletionUser {
  role: "user"
  content: string | {
    subtitles: SubtitleNoTime[]
  }
}

interface CompletionAssistant {
  role: "assistant"
  content: string | {
    subtitles: SubtitleNoTimeNoActorTranslated[]
  }
}

export type ContextCompletion = CompletionUser | CompletionAssistant
