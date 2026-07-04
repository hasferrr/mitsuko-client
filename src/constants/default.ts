import { FREE_MODELS } from "./model-collection"
import { AdvancedSettings, BasicSettings, Translation, Transcription } from "@/types/project"

const getDefaultModel = (modelName: string) => {
  const freeModels = FREE_MODELS["Free Models"].models
  return freeModels.find((model) => model.name === modelName) || freeModels[0] || null
}

const createBasicSettings = (modelName: string): Omit<BasicSettings, "id" | "createdAt" | "updatedAt"> => ({
  sourceLanguage: "Japanese",
  targetLanguage: "Indonesian",
  modelDetail: getDefaultModel(modelName),
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

export const DEFAULT_BASIC_SETTINGS = createBasicSettings("Gemini 3 Flash")
export const DEFAULT_EXTRACTION_BASIC_SETTINGS = createBasicSettings("GLM 5.2")

export const DEFAULT_ADVANCED_SETTINGS: Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt"> = {
  temperature: 1,
  startIndex: 1,
  endIndex: 100000,
  splitSize: 100,
  maxCompletionTokens: 64000,
  isUseStructuredOutput: true,
  isUseFullContextMemory: false,
  isBetterContextCaching: true, // true means it is NOT using Minimal Context Mode
  isMaxCompletionTokensAuto: true,
}

export const DEFAULT_TRANSLATION_SETTINGS: Omit<Translation, "id" | "createdAt" | "updatedAt" | "projectId" | "basicSettingsId" | "advancedSettingsId"> = {
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
  selectedMode: "sentence",
  customInstructions: "",
  models: "mitsuko-premium",
  language: "auto",
  words: [],
  segments: [],
  selectedUploadId: null,
}
