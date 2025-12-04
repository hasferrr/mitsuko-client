import { SubtitleTranslated } from "@/types/subtitles"
import { FREE_MODELS } from "./model-collection"
import { AdvancedSettings, BasicSettings, Transcription } from "@/types/project"
import { _extractionResult, _transcriptionResult, _translationResult } from "./default-result"
import { parseTranscription, parseTranslationJson } from "@/lib/parser/parser"

export const DEFAULT_BASIC_SETTINGS: Omit<BasicSettings, "id" | "createdAt" | "updatedAt"> = {
  sourceLanguage: "Japanese",
  targetLanguage: "Indonesian",
  modelDetail: FREE_MODELS["Premium Trial"].models[0] || null,
  isUseCustomModel: false,
  contextDocument: "",
  customInstructions: "",
  fewShot: {
    isEnabled: false,
    value: "",
    linkedId: "",
    type: 'linked',
    fewShotStartIndex: undefined,
    fewShotEndIndex: undefined,
  },
}

export const DEFAULT_ADVANCED_SETTINGS: Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt"> = {
  temperature: 0.6,
  startIndex: 1,
  endIndex: 100000,
  splitSize: 100,
  maxCompletionTokens: 64000,
  isUseStructuredOutput: false,
  isUseFullContextMemory: false,
  isBetterContextCaching: true, // true means it is NOT using Minimal Context Mode
  isMaxCompletionTokensAuto: false,
}

export const DEFAULT_TRANSCTIPTION_SETTINGS: Pick<Transcription, "selectedMode" | "customInstructions" | "models"> = {
  selectedMode: "sentence",
  customInstructions: "",
  models: "premium",
}

export const DEFAULT_TITLE = "Blue.Box.S01E16 (example)"
export const DEFAULT_SUBTITLES: SubtitleTranslated[] = [
  {
    "index": 1,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 16, "ms": 50 },
      "end": { "h": 0, "m": 0, "s": 16, "ms": 930 }
    },
    "actor": "千夏(ちなつ)",
    "content": "おはよう",
    "translated": "Pagi"
  },
  {
    "index": 2,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 17, "ms": 550 },
      "end": { "h": 0, "m": 0, "s": 19, "ms": 260 }
    },
    "actor": "大喜(たいき)",
    "content": "おはようございます",
    "translated": "Selamat pagi"
  },
  {
    "index": 3,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 19, "ms": 350 },
      "end": { "h": 0, "m": 0, "s": 21, "ms": 350 }
    },
    "actor": "千夏",
    "content": "相変わらず早起きだね",
    "translated": "Kamu masih bangun pagi seperti biasa ya?"
  },
  {
    "index": 4,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 21, "ms": 850 },
      "end": { "h": 0, "m": 0, "s": 23, "ms": 310 }
    },
    "actor": "",
    "content": "今日から新学期ですし",
    "translated": "Lagipula, hari ini mulai semester baru"
  },
  {
    "index": 5,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 23, "ms": 390 },
      "end": { "h": 0, "m": 0, "s": 25, "ms": 480 }
    },
    "actor": "",
    "content": "すごい寝ぐせ",
    "translated": "Rambutmu acak-acakan banget"
  },
  {
    "index": 6,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 25, "ms": 560 },
      "end": { "h": 0, "m": 0, "s": 26, "ms": 440 }
    },
    "actor": "",
    "content": "ここら辺",
    "translated": "Di sekitar sini"
  },
  {
    "index": 7,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 26, "ms": 520 },
      "end": { "h": 0, "m": 0, "s": 27, "ms": 520 }
    },
    "actor": "",
    "content": "えっ！",
    "translated": "Hah?!"
  },
  {
    "index": 8,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 28, "ms": 190 },
      "end": { "h": 0, "m": 0, "s": 28, "ms": 820 }
    },
    "actor": "",
    "content": "あ…",
    "translated": "Ah..."
  },
  {
    "index": 9,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 29, "ms": 980 },
      "end": { "h": 0, "m": 0, "s": 31, "ms": 400 }
    },
    "actor": "",
    "content": "マヌケポーズ！",
    "translated": "Pose konyol!"
  },
  {
    "index": 10,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 34, "ms": 360 },
      "end": { "h": 0, "m": 0, "s": 35, "ms": 450 }
    },
    "actor": "大喜",
    "content": "海に行ってから",
    "translated": "Sejak pergi ke pantai"
  },
  {
    "index": 11,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 36, "ms": 30 },
      "end": { "h": 0, "m": 0, "s": 39, "ms": 330 }
    },
    "actor": "",
    "content": "千夏先輩との間にあった\nわだかまりみたいなものが",
    "translated": "rasa canggung yang dulu ada antara aku dan Senior Chinatsu"
  },
  {
    "index": 12,
    "timestamp": {
      "start": { "h": 0, "m": 0, "s": 39, "ms": 410 },
      "end": { "h": 0, "m": 0, "s": 40, "ms": 950 }
    },
    "actor": "",
    "content": "なくなった気がする",
    "translated": "sepertinya sudah hilang"
  },
]
export const DEFAULT_RESPONSE = {
  response: _translationResult,
  jsonResponse: parseTranslationJson(_translationResult),
}

export const DEFAULT_EXTRACTION_TITLE = "KHRS S01E01 (example)"
export const DEFAULT_EXTRACTION_RESULT = _extractionResult

export const DEFAULT_TRANSCRIPTION_TITLE = "01. カゲロウノ調.flac (example)"
export const DEFAULT_TRANSCRIPTION_RESULT = _transcriptionResult
export const DEFAULT_TRANSCRIPTION_JSON = parseTranscription(_transcriptionResult)
