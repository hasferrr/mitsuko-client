export interface Timestamp {
  h: number
  m: number
  s: number
  ms: number
}

export interface Subtitle {
  index: number
  timestamp: {
    start: Timestamp
    end: Timestamp
  }
  actor: string
  content: string
}

export type SubtitleNoTime = Omit<Subtitle, 'timestamp'>

export type SubtitleTranslated = Subtitle & {
  translated: string
}

export type SubtitleNoTimeTranslated = Omit<SubtitleTranslated, 'timestamp'>

export type SubtitleNoTimeNoActorTranslated = Omit<SubtitleNoTimeTranslated, 'actor'>

export interface SubOnlyTranslated {
  index: number
  translated: string
}

export interface ASSParseOutput {
  subtitles: Subtitle[]
  header: string
  events: SubtitleEvent[]
  footer: string
}

export interface SubtitleEvent {
  format: 'Dialogue' | 'Comment'
  layer: number
  start: string
  end: string
  style: string
  name: string
  marginL: string
  marginR: string
  marginV: string
  effect: string
  text: string
}

export type UpdateSubtitle = (
  index: number,
  field: keyof SubtitleTranslated,
  value: SubtitleTranslated[keyof SubtitleTranslated],
) => void

interface CompletionUser {
  role: "user"
  content: SubtitleNoTime[]
}

interface CompletionAssistant {
  role: "assistant"
  content: SubtitleNoTimeNoActorTranslated[]
}

export type ContextCompletion = CompletionUser | CompletionAssistant

export interface Parsed {
  type: "srt" | "ass"
  data: ASSParseOutput | null
}
