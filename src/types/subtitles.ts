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

export type SubtitleNoTimeNoIndex = Omit<SubtitleNoTime, 'index'>

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

export interface Parsed {
  type: SubtitleType
  data: ASSParseOutput | null
}

export type SubtitleType = "srt" | "ass" | "vtt"

export type DownloadOption = "original" | "translated" | "combined"
export type CombinedFormat = "(o)-t" | "(t)-o" | "o-n-t" | "t-n-o" | "{o}-t"
