import { FREE_MODELS, PAID_MODELS } from "./model-collection"
import { AdvancedSettings, BasicSettings, Settings, Translation, Transcription } from "@/types/project"

const getDefaultModel = (modelName: string, isPaid = false) => {
  const collection = isPaid ? PAID_MODELS : FREE_MODELS
  const models = Object.values(collection).flatMap(group => group.models)
  return models.find((model) => model.name === modelName) || models[0] || null
}

const createBasicSettings = (modelName: string, isPaid = false): Omit<BasicSettings, "id" | "createdAt" | "updatedAt"> => ({
  sourceLanguage: "Japanese",
  targetLanguage: "Indonesian",
  modelDetail: getDefaultModel(modelName, isPaid),
  isUseCustomModel: false,
  contextDocument: "",
  customInstructions: "",
  fewShot: {
    isEnabled: false,
    value: "",
    linkedId: "",
    type: "linked",
    fewShotStartIndex: undefined,
    fewShotEndIndex: undefined,
  },
})

export const DEFAULT_BASIC_SETTINGS = createBasicSettings("Gemini 3.7 Flash")
export const DEFAULT_EXTRACTION_BASIC_SETTINGS = createBasicSettings("Gemini 3.7 Flash", true)

export const DEFAULT_ADVANCED_SETTINGS: Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt"> = {
  temperature: 1,
  startIndex: 1,
  endIndex: 100000,
  splitSize: 100,
  maxCompletionTokens: 64000,
  isUseStructuredOutput: true,
  isUseFullContextMemory: false,
  isMinimalContextMode: false,
  isMaxCompletionTokensAuto: true,
}

export const DEFAULT_SETTINGS: Omit<Settings, "id" | "createdAt" | "updatedAt"> = {
  ...DEFAULT_BASIC_SETTINGS,
  ...DEFAULT_ADVANCED_SETTINGS,
}

export const DEFAULT_EXTRACTION_SETTINGS: Omit<Settings, "id" | "createdAt" | "updatedAt"> = {
  ...DEFAULT_EXTRACTION_BASIC_SETTINGS,
  ...DEFAULT_ADVANCED_SETTINGS,
}

export const DEFAULT_TRANSLATION_SETTINGS: Omit<Translation, "id" | "createdAt" | "updatedAt" | "projectId" | "settingsId"> = {
  title: "",
  subtitles: [],
  parsed: { type: "srt", data: null },
  autoContextMode: "disabled",
  autoContextExtractionId: null,
  autoContextPreviousMode: "latest",
  autoContextPreviousExtractionId: null,
  response: { response: "", jsonResponse: [] },
}

export const DEFAULT_TRANSCRIPTION_SETTINGS: Omit<Transcription, "id" | "createdAt" | "updatedAt" | "projectId"> = {
  title: "",
  transcriptionText: "",
  transcriptSubtitles: [],
  selectedMode: "clause",
  customInstructions: "",
  models: "mitsuko-premium",
  language: "auto",
  words: [],
  segments: [],
  selectedUploadId: null,
}
