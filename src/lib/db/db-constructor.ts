import { DEFAULT_BASIC_SETTINGS, DEFAULT_ADVANCED_SETTINGS, DEFAULT_TRANSCRIPTION_SETTINGS } from '@/constants/default'
import {
  Project,
  Translation,
  Transcription,
  Extraction,
  ProjectOrder,
  BasicSettings,
  AdvancedSettings,
} from '@/types/project'

const uuidv4 = () => crypto.randomUUID()

export interface DatabaseExport {
  projects: Project[]
  translations: Translation[]
  transcriptions: Transcription[]
  extractions: Extraction[]
  projectOrders: ProjectOrder[] // Only contains one item or empty array
  basicSettings: BasicSettings[]
  advancedSettings: AdvancedSettings[]
}


// TODO: Importing database: Check for every field in the database and make sure it's not null,
// and if it is, add the default value and also related tables
// by implementing this approach, we can make sure it is scalable and easy to maintain

export function databaseExportConstructor(data: Partial<DatabaseExport>): DatabaseExport {
  return {
    projects: convertDates(data.projects?.map(projectConstructor) ?? []),
    translations: convertDates(data.translations?.map(translationConstructor) ?? []),
    transcriptions: convertDates(data.transcriptions?.map(transcriptionConstructor) ?? []),
    extractions: convertDates(data.extractions?.map(extractionConstructor) ?? []),
    projectOrders: convertDates(data.projectOrders?.map(projectOrderConstructor) ?? []),
    basicSettings: convertDates(data.basicSettings?.map(basicSettingsConstructor) ?? []),
    advancedSettings: convertDates(data.advancedSettings?.map(advancedSettingsConstructor) ?? []),
  }
}

export function generateNewIds(data: DatabaseExport): DatabaseExport {
  // Create maps of old IDs to new Items
  const basicSettingsMap: Map<string, BasicSettings> = new Map()
  const advancedSettingsMap: Map<string, AdvancedSettings> = new Map()
  const translationsMap: Map<string, Translation> = new Map()
  const transcriptionsMap: Map<string, Transcription> = new Map()
  const extractionsMap: Map<string, Extraction> = new Map()

  for (const basicSetting of data.basicSettings) {
    basicSettingsMap.set(basicSetting.id, { ...basicSetting, id: uuidv4() })
  }
  for (const advancedSetting of data.advancedSettings) {
    advancedSettingsMap.set(advancedSetting.id, { ...advancedSetting, id: uuidv4() })
  }

  for (const translation of data.translations) {
    translationsMap.set(translation.id, {
      ...translation,
      id: uuidv4(),
      basicSettingsId: basicSettingsMap.get(translation.basicSettingsId)?.id ?? translation.basicSettingsId,
      advancedSettingsId: advancedSettingsMap.get(translation.advancedSettingsId)?.id ?? translation.advancedSettingsId,
      projectId: "",
    })
  }

  for (const basicSetting of data.basicSettings) {
    const newBasicSetting = basicSettingsMap.get(basicSetting.id)
    if (newBasicSetting && newBasicSetting.fewShot.type === 'linked' && newBasicSetting.fewShot.linkedId) {
      const newLinkedId = translationsMap.get(newBasicSetting.fewShot.linkedId)?.id
      if (newLinkedId) {
        newBasicSetting.fewShot = {
          ...newBasicSetting.fewShot,
          linkedId: newLinkedId,
        }
      }
    }
  }

  for (const extraction of data.extractions) {
    extractionsMap.set(extraction.id, {
      ...extraction,
      id: uuidv4(),
      basicSettingsId: basicSettingsMap.get(extraction.basicSettingsId)?.id ?? extraction.basicSettingsId,
      advancedSettingsId: advancedSettingsMap.get(extraction.advancedSettingsId)?.id ?? extraction.advancedSettingsId,
      projectId: "",
    })
  }

  for (const transcription of data.transcriptions) {
    transcriptionsMap.set(transcription.id, {
      ...transcription,
      id: uuidv4(),
      projectId: "",
    })
  }

  // Create new projects with new IDs
  const newProjects = data.projects.map(project => {
    const newId = uuidv4()

    const newTranslationsId = project.translations.map(translationId => {
      const newTranslation = translationsMap.get(translationId)
      if (newTranslation) {
        newTranslation.projectId = newId
        return newTranslation.id
      } else {
        return translationId
      }
    })
    const newExtractionsId = project.extractions.map(extractionId => {
      const newExtraction = extractionsMap.get(extractionId)
      if (newExtraction) {
        newExtraction.projectId = newId
        return newExtraction.id
      } else {
        return extractionId
      }
    })
    const newTranscriptionsId = project.transcriptions.map(transcriptionId => {
      const newTranscription = transcriptionsMap.get(transcriptionId)
      if (newTranscription) {
        newTranscription.projectId = newId
        return newTranscription.id
      } else {
        return transcriptionId
      }
    })

    const newDefaultBasicSettingsId = basicSettingsMap.get(project.defaultBasicSettingsId)?.id ?? project.defaultBasicSettingsId
    const newDefaultAdvancedSettingsId = advancedSettingsMap.get(project.defaultAdvancedSettingsId)?.id ?? project.defaultAdvancedSettingsId

    const newDefaultTranslationBasicSettingsId =
      basicSettingsMap.get(project.defaultTranslationBasicSettingsId)?.id ?? project.defaultTranslationBasicSettingsId
    const newDefaultTranslationAdvancedSettingsId =
      advancedSettingsMap.get(project.defaultTranslationAdvancedSettingsId)?.id ?? project.defaultTranslationAdvancedSettingsId
    const newDefaultExtractionBasicSettingsId =
      basicSettingsMap.get(project.defaultExtractionBasicSettingsId)?.id ?? project.defaultExtractionBasicSettingsId
    const newDefaultExtractionAdvancedSettingsId =
      advancedSettingsMap.get(project.defaultExtractionAdvancedSettingsId)?.id ?? project.defaultExtractionAdvancedSettingsId
    const newDefaultTranscriptionId =
      transcriptionsMap.get(project.defaultTranscriptionId)?.id ?? project.defaultTranscriptionId

    return {
      ...project,
      id: newId,
      translations: newTranslationsId,
      transcriptions: newTranscriptionsId,
      extractions: newExtractionsId,
      defaultBasicSettingsId: newDefaultBasicSettingsId,
      defaultAdvancedSettingsId: newDefaultAdvancedSettingsId,
      defaultTranslationBasicSettingsId: newDefaultTranslationBasicSettingsId,
      defaultTranslationAdvancedSettingsId: newDefaultTranslationAdvancedSettingsId,
      defaultExtractionBasicSettingsId: newDefaultExtractionBasicSettingsId,
      defaultExtractionAdvancedSettingsId: newDefaultExtractionAdvancedSettingsId,
      defaultTranscriptionId: newDefaultTranscriptionId,
      isBatch: project.isBatch ?? false,
      isDefaultTranslationEnabled: typeof project.isDefaultTranslationEnabled === 'boolean' ? project.isDefaultTranslationEnabled : false,
      isDefaultExtractionEnabled: typeof project.isDefaultExtractionEnabled === 'boolean' ? project.isDefaultExtractionEnabled : false,
      isDefaultTranscriptionEnabled: typeof project.isDefaultTranscriptionEnabled === 'boolean' ? project.isDefaultTranscriptionEnabled : false,
    }
  })

  const newTranslations = Array.from(translationsMap.values())
  const newTranscriptions = Array.from(transcriptionsMap.values())
  const newExtractions = Array.from(extractionsMap.values())
  const newBasicSettings = Array.from(basicSettingsMap.values())
  const newAdvancedSettings = Array.from(advancedSettingsMap.values())

  const newProjectOrders = data.projectOrders.at(0)
  if (newProjectOrders) {
    newProjectOrders.order = newProjects.map(project => project.id)
  }

  return {
    projects: newProjects,
    translations: newTranslations,
    transcriptions: newTranscriptions,
    extractions: newExtractions,
    projectOrders: newProjectOrders ? [newProjectOrders] : [],
    basicSettings: newBasicSettings,
    advancedSettings: newAdvancedSettings
  }
}

function convertDates<T extends { createdAt?: string | Date; updatedAt?: string | Date }>(items: T[]): T[] {
  return items.map(item => ({
    ...item,
    createdAt: (typeof item.createdAt === 'string' ? new Date(item.createdAt) : item.createdAt) ?? new Date(),
    updatedAt: (typeof item.updatedAt === 'string' ? new Date(item.updatedAt) : item.updatedAt) ?? new Date(),
  }))
}

function projectConstructor(project: Partial<Project>): Project {
  return {
    id: project.id ?? uuidv4(),
    name: project.name ?? "Project X",
    createdAt: project.createdAt ?? new Date(),
    updatedAt: project.updatedAt ?? new Date(),
    translations: project.translations ?? [],
    transcriptions: project.transcriptions ?? [],
    extractions: project.extractions ?? [],
    defaultBasicSettingsId: project.defaultBasicSettingsId ?? "",
    defaultAdvancedSettingsId: project.defaultAdvancedSettingsId ?? "",
    defaultTranslationBasicSettingsId: project.defaultTranslationBasicSettingsId ?? "",
    defaultTranslationAdvancedSettingsId: project.defaultTranslationAdvancedSettingsId ?? "",
    defaultExtractionBasicSettingsId: project.defaultExtractionBasicSettingsId ?? "",
    defaultExtractionAdvancedSettingsId: project.defaultExtractionAdvancedSettingsId ?? "",
    defaultTranscriptionId: project.defaultTranscriptionId ?? "",
    isBatch: project.isBatch ?? false,
    isDefaultTranslationEnabled: typeof project.isDefaultTranslationEnabled === 'boolean' ? project.isDefaultTranslationEnabled : false,
    isDefaultExtractionEnabled: typeof project.isDefaultExtractionEnabled === 'boolean' ? project.isDefaultExtractionEnabled : false,
    isDefaultTranscriptionEnabled: typeof project.isDefaultTranscriptionEnabled === 'boolean' ? project.isDefaultTranscriptionEnabled : false,
  }
}

function translationConstructor(translation: Partial<Translation>): Translation {
  return {
    id: translation.id ?? uuidv4(),
    title: translation.title ?? "Translation X",
    subtitles: translation.subtitles ?? [],
    parsed: sanitizeParsed(translation.parsed),
    createdAt: translation.createdAt ?? new Date(),
    updatedAt: translation.updatedAt ?? new Date(),
    projectId: translation.projectId ?? "",
    basicSettingsId: translation.basicSettingsId ?? "",
    advancedSettingsId: translation.advancedSettingsId ?? "",
    response: translation.response ?? { response: "", jsonResponse: [] },
  }
}

function sanitizeParsed(parsed: Translation['parsed'] | undefined): Translation['parsed'] {
  const safeParsed = parsed ?? { type: "srt", data: null }
  if (safeParsed.type === "ass" && safeParsed.data) {
    const data = { ...safeParsed.data } as typeof safeParsed.data & { subtitles?: unknown }
    if ("subtitles" in data) {
      delete data.subtitles
      return {
        ...safeParsed,
        data,
      }
    }
  }
  return safeParsed
}

function transcriptionConstructor(transcription: Partial<Transcription>): Transcription {
  return {
    id: transcription.id ?? uuidv4(),
    title: transcription.title ?? "Transcription X",
    transcriptionText: transcription.transcriptionText ?? "",
    transcriptSubtitles: transcription.transcriptSubtitles ?? [],
    language: transcription.language ?? DEFAULT_TRANSCRIPTION_SETTINGS.language,
    selectedMode: transcription.selectedMode ?? DEFAULT_TRANSCRIPTION_SETTINGS.selectedMode,
    customInstructions: transcription.customInstructions ?? DEFAULT_TRANSCRIPTION_SETTINGS.customInstructions,
    models: migrateModelName(transcription.models) ?? DEFAULT_TRANSCRIPTION_SETTINGS.models,
    createdAt: transcription.createdAt ?? new Date(),
    updatedAt: transcription.updatedAt ?? new Date(),
    projectId: transcription.projectId ?? "",
    words: transcription.words ?? [],
    segments: transcription.segments ?? [],
    selectedUploadId: transcription.selectedUploadId ?? DEFAULT_TRANSCRIPTION_SETTINGS.selectedUploadId,
  }
}

function migrateModelName(model: string | null | undefined): Transcription['models'] | null | undefined {
  if (model === 'free') return 'mitsuko-free'
  if (model === 'premium') return 'mitsuko-premium'
  return model as Transcription['models'] | null | undefined
}

function extractionConstructor(extraction: Partial<Extraction>): Extraction {
  return {
    id: extraction.id ?? uuidv4(),
    title: extraction.title ?? "",
    episodeNumber: extraction.episodeNumber ?? "",
    subtitleContent: extraction.subtitleContent ?? "",
    previousContext: extraction.previousContext ?? "",
    contextResult: extraction.contextResult ?? "",
    createdAt: extraction.createdAt ?? new Date(),
    updatedAt: extraction.updatedAt ?? new Date(),
    projectId: extraction.projectId ?? "",
    basicSettingsId: extraction.basicSettingsId ?? "",
    advancedSettingsId: extraction.advancedSettingsId ?? "",
  }
}

function basicSettingsConstructor(basicSettings: Partial<BasicSettings>): BasicSettings {
  return {
    id: basicSettings.id ?? uuidv4(),
    sourceLanguage: basicSettings.sourceLanguage ?? DEFAULT_BASIC_SETTINGS.sourceLanguage,
    targetLanguage: basicSettings.targetLanguage ?? DEFAULT_BASIC_SETTINGS.targetLanguage,
    modelDetail: basicSettings.modelDetail ?? DEFAULT_BASIC_SETTINGS.modelDetail,
    isUseCustomModel: basicSettings.isUseCustomModel ?? DEFAULT_BASIC_SETTINGS.isUseCustomModel,
    contextDocument: basicSettings.contextDocument ?? DEFAULT_BASIC_SETTINGS.contextDocument,
    customInstructions: basicSettings.customInstructions ?? DEFAULT_BASIC_SETTINGS.customInstructions,
    fewShot: basicSettings.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot,
    createdAt: basicSettings.createdAt ?? new Date(),
    updatedAt: basicSettings.updatedAt ?? new Date(),
  }
}

function advancedSettingsConstructor(advancedSettings: Partial<AdvancedSettings>): AdvancedSettings {
  return {
    id: advancedSettings.id ?? uuidv4(),
    temperature: advancedSettings.temperature ?? DEFAULT_ADVANCED_SETTINGS.temperature,
    startIndex: advancedSettings.startIndex ?? DEFAULT_ADVANCED_SETTINGS.startIndex,
    endIndex: advancedSettings.endIndex ?? DEFAULT_ADVANCED_SETTINGS.endIndex,
    splitSize: advancedSettings.splitSize ?? DEFAULT_ADVANCED_SETTINGS.splitSize,
    maxCompletionTokens: advancedSettings.maxCompletionTokens ?? DEFAULT_ADVANCED_SETTINGS.maxCompletionTokens,
    isUseStructuredOutput: advancedSettings.isUseStructuredOutput ?? DEFAULT_ADVANCED_SETTINGS.isUseStructuredOutput,
    isUseFullContextMemory: advancedSettings.isUseFullContextMemory ?? DEFAULT_ADVANCED_SETTINGS.isUseFullContextMemory,
    isBetterContextCaching: advancedSettings.isBetterContextCaching ?? DEFAULT_ADVANCED_SETTINGS.isBetterContextCaching,
    isMaxCompletionTokensAuto: advancedSettings.isMaxCompletionTokensAuto ?? DEFAULT_ADVANCED_SETTINGS.isMaxCompletionTokensAuto,
    createdAt: advancedSettings.createdAt ?? new Date(),
    updatedAt: advancedSettings.updatedAt ?? new Date(),
  }
}

function projectOrderConstructor(projectOrder: Partial<ProjectOrder>): ProjectOrder {
  return {
    id: projectOrder.id ?? uuidv4(),
    order: projectOrder.order ?? [],
    createdAt: projectOrder.createdAt ?? new Date(),
    updatedAt: projectOrder.updatedAt ?? new Date(),
  }
}
