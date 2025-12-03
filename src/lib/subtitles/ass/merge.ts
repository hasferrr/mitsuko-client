import type { Subtitle, ASSParseOutput } from "../../../types/subtitles"
import { convertSubtitlesToSubtitleEvents, mergeSubtitles, reconstructAssSubtitle } from "./helper"

const defaultHeader = `[Script Info]
Title: Default
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1920
PlayResY: 1080
YCbCr Matrix: None

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,60,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,3.45,1.5,2,36,36,65,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`.trimEnd()

export function _mergeASSback(subtitles: Subtitle[], _parsed: ASSParseOutput | null): string {
  const parsed: ASSParseOutput = _parsed ? { ..._parsed } : {
    header: defaultHeader,
    events: convertSubtitlesToSubtitleEvents(subtitles),
    footer: "",
  }

  const newEvents = mergeSubtitles(parsed.events, subtitles)
  const merged = reconstructAssSubtitle(parsed.header, parsed.footer, newEvents)
  return merged
}
