import { create } from "zustand"
import type { SubtitleEvent, SubtitleType, DownloadOption, CombinedFormat, Parsed, Subtitle } from "@/types/subtitles"

interface ToolsStore {
  subtitleEvents: SubtitleEvent[]
  subtitles: Subtitle[]
  ignoreWhitespace: boolean
  ignorePunctuation: boolean
  enableHighlight: boolean
  fileName: string
  toType: SubtitleType
  downloadOption: DownloadOption
  combinedFormat: CombinedFormat
  parsedData: Parsed | null
  rawContent: string
  setSubtitleEvents: (events: SubtitleEvent[]) => void
  setSubtitles: (subs: Subtitle[]) => void
  setIgnoreWhitespace: (value: boolean) => void
  setIgnorePunctuation: (value: boolean) => void
  setEnableHighlight: (value: boolean) => void
  setFileName: (name: string) => void
  setToType: (type: SubtitleType) => void
  setDownloadOption: (option: DownloadOption) => void
  setCombinedFormat: (format: CombinedFormat) => void
  setParsedData: (data: Parsed | null) => void
  setRawContent: (content: string) => void
  reset: () => void
}

const initialState = {
  subtitleEvents: [] as SubtitleEvent[],
  subtitles: [] as Subtitle[],
  ignoreWhitespace: true,
  ignorePunctuation: true,
  enableHighlight: true,
  fileName: "",
  toType: "srt" as SubtitleType,
  downloadOption: "original" as DownloadOption,
  combinedFormat: "o-n-t" as CombinedFormat,
  parsedData: null as Parsed | null,
  rawContent: "",
}

export const useToolsStore = create<ToolsStore>()((set) => ({
  ...initialState,
  setSubtitleEvents: (events) => set({ subtitleEvents: events }),
  setSubtitles: (subs) => set({ subtitles: subs }),
  setIgnoreWhitespace: (value) => set({ ignoreWhitespace: value }),
  setIgnorePunctuation: (value) => set({ ignorePunctuation: value }),
  setEnableHighlight: (value) => set({ enableHighlight: value }),
  setFileName: (name) => set({ fileName: name }),
  setToType: (type) => set({ toType: type }),
  setDownloadOption: (option) => set({ downloadOption: option }),
  setCombinedFormat: (format) => set({ combinedFormat: format }),
  setParsedData: (data) => set({ parsedData: data }),
  setRawContent: (content) => set({ rawContent: content }),
  reset: () => set({ ...initialState }),
}))
