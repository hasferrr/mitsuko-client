import {
  DEFAULT_ADVANCED_SETTINGS,
  DEFAULT_BASIC_SETTINGS,
  DEFAULT_EXTRACTION_BASIC_SETTINGS,
  DEFAULT_EXTRACTION_SETTINGS,
  DEFAULT_SETTINGS,
  DEFAULT_TRANSCRIPTION_SETTINGS,
  DEFAULT_TRANSLATION_SETTINGS,
} from '@/constants/default'
import {
  BasicSettings,
  Extraction,
  Project,
  ProjectOrder,
  Settings,
  Transcription,
  Translation,
} from '@/types/project'
import { LegacyAdvancedSettings, LegacyExtraction, LegacyProject, LegacyTranslation } from '@/types/legacy-project'
import { AUTO_CONTEXT_EXTRACTION_TITLE_PREFIX, normalizeExtractionStatus, stripExtractionDoneTag } from '@/lib/extraction/status'

const uuidv4 = () => crypto.randomUUID()

export interface DatabaseExport {
  formatVersion: 2
  projects: Project[]
  translations: Translation[]
  transcriptions: Transcription[]
  extractions: Extraction[]
  projectOrders: ProjectOrder[]
  settings: Settings[]
}

export interface LegacyDatabaseExport {
  projects: LegacyProject[]
  translations: LegacyTranslation[]
  transcriptions: Transcription[]
  extractions: LegacyExtraction[]
  projectOrders: ProjectOrder[]
  basicSettings: BasicSettings[]
  advancedSettings: LegacyAdvancedSettings[]
}

export function databaseExportConstructor(data: Partial<DatabaseExport>): DatabaseExport {
  const projects = convertDates(data.projects?.map(projectConstructor) ?? [])
  const translations = convertDates(data.translations?.map(translationConstructor) ?? [])
  const extractionInputs = data.extractions ?? []
  const settingsOwnership = buildSettingsOwnership(projects, translations, extractionInputs)
  const projectIsBatch = new Map(projects.map(project => [project.id, project.isBatch]))
  const linkedOwner = new Map<string, string>()
  for (const translation of translations) {
    if (translation.autoContextExtractionId && !linkedOwner.has(translation.autoContextExtractionId)) {
      linkedOwner.set(translation.autoContextExtractionId, translation.id)
    }
  }
  return {
    formatVersion: 2,
    projects,
    translations,
    transcriptions: convertDates(data.transcriptions?.map(transcriptionConstructor) ?? []),
    extractions: convertDates(data.extractions?.map(extraction => extractionConstructor(
      extraction,
      projectIsBatch.get(extraction.projectId ?? '') ?? false,
      linkedOwner.get(extraction.id ?? ''),
    )) ?? []),
    projectOrders: convertDates(data.projectOrders?.map(projectOrderConstructor) ?? []),
    settings: convertDates(data.settings?.map(settings => settingsConstructor(
      settings,
      settingsOwnership.get(settings.id ?? ''),
    )) ?? []),
  }
}

export function convertLegacyDatabaseExport(data: Partial<LegacyDatabaseExport>): DatabaseExport {
  const basicSettings = new Map((data.basicSettings ?? []).map(item => [item.id, item]))
  const advancedSettings = new Map((data.advancedSettings ?? []).map(item => [item.id, item]))
  const settings: Settings[] = []
  const pairIds = new Map<string, string>()

  const mergePair = (basicId: string, advancedId: string, feature: 'translation' | 'extraction') => {
    const basic = basicSettings.get(basicId)
    const advanced = advancedSettings.get(advancedId)
    const key = JSON.stringify([basicId || null, advancedId || null, basic ? null : feature])
    const shouldReuse = Boolean(basicId || advancedId)
    const existing = shouldReuse ? pairIds.get(key) : undefined
    if (existing) return existing
    const now = new Date()
    const timestamps = mergeSettingsTimestamps(basic, advanced, now)
    const id = uuidv4()
    settings.push(settingsConstructor({
      ...(feature === 'extraction' ? DEFAULT_EXTRACTION_BASIC_SETTINGS : DEFAULT_BASIC_SETTINGS),
      ...basic,
      ...advanced,
      id,
      ...timestamps,
    }))
    if (shouldReuse) pairIds.set(key, id)
    return id
  }

  const translations = (data.translations ?? []).map(item => {
    const { basicSettingsId, advancedSettingsId, ...translation } = item
    return translationConstructor({
      ...translation,
      settingsId: mergePair(basicSettingsId, advancedSettingsId, 'translation'),
    })
  })
  const projectIsBatch = new Map((data.projects ?? []).map(project => [project.id, project.isBatch ?? false]))
  const extractions = (data.extractions ?? []).map(item => {
    const { basicSettingsId, advancedSettingsId, ...extraction } = item
    return extractionConstructor({
      ...extraction,
      settingsId: mergePair(basicSettingsId, advancedSettingsId, 'extraction'),
    }, projectIsBatch.get(extraction.projectId) ?? false)
  })
  const projects = (data.projects ?? []).map(item => {
    const {
      defaultTranslationBasicSettingsId,
      defaultTranslationAdvancedSettingsId,
      defaultExtractionBasicSettingsId,
      defaultExtractionAdvancedSettingsId,
      ...project
    } = item
    return projectConstructor({
      ...project,
      defaultTranslationSettingsId: mergePair(
        defaultTranslationBasicSettingsId,
        defaultTranslationAdvancedSettingsId,
        'translation',
      ),
      defaultExtractionSettingsId: mergePair(
        defaultExtractionBasicSettingsId,
        defaultExtractionAdvancedSettingsId,
        'extraction',
      ),
    })
  })

  return databaseExportConstructor({
    formatVersion: 2,
    projects,
    translations,
    transcriptions: data.transcriptions ?? [],
    extractions,
    projectOrders: data.projectOrders ?? [],
    settings,
  })
}

export function normalizeDatabaseExport(
  data: Partial<DatabaseExport> & Partial<LegacyDatabaseExport>,
): DatabaseExport {
  return data.formatVersion === 2 || Array.isArray(data.settings)
    ? databaseExportConstructor(data)
    : convertLegacyDatabaseExport(data)
}

export function generateNewIds(data: DatabaseExport): DatabaseExport {
  const settingsMap = new Map(data.settings.map(settings => [settings.id, { ...settings, id: uuidv4() }]))
  const translationsMap = new Map(data.translations.map(translation => [translation.id, {
    ...translation,
    id: uuidv4(),
    projectId: '',
    settingsId: settingsMap.get(translation.settingsId)?.id ?? translation.settingsId,
  }]))
  const extractionsMap = new Map(data.extractions.map(extraction => [extraction.id, {
    ...extraction,
    id: uuidv4(),
    projectId: '',
    settingsId: settingsMap.get(extraction.settingsId)?.id ?? extraction.settingsId,
    ownerTranslationId: extraction.ownerTranslationId
      ? translationsMap.get(extraction.ownerTranslationId)?.id ?? extraction.ownerTranslationId
      : null,
  }]))
  const transcriptionsMap = new Map(data.transcriptions.map(transcription => [transcription.id, {
    ...transcription,
    id: uuidv4(),
    projectId: '',
  }]))
  const projectIdMap = new Map<string, string>()

  for (const setting of settingsMap.values()) {
    if (setting.fewShot.type === 'linked' && setting.fewShot.linkedId) {
      setting.fewShot = {
        ...setting.fewShot,
        linkedId: translationsMap.get(setting.fewShot.linkedId)?.id ?? setting.fewShot.linkedId,
      }
    }
  }
  for (const translation of data.translations) {
    const remapped = translationsMap.get(translation.id)
    if (!remapped) continue
    remapped.autoContextExtractionId = translation.autoContextExtractionId
      ? extractionsMap.get(translation.autoContextExtractionId)?.id ?? translation.autoContextExtractionId
      : null
    remapped.autoContextPreviousExtractionId = translation.autoContextPreviousExtractionId
      ? extractionsMap.get(translation.autoContextPreviousExtractionId)?.id ?? translation.autoContextPreviousExtractionId
      : null
  }

  const projects = data.projects.map(project => {
    const id = uuidv4()
    projectIdMap.set(project.id, id)
    const translations = project.translations.map(oldId => {
      const item = translationsMap.get(oldId)
      if (item) item.projectId = id
      return item?.id ?? oldId
    })
    const extractions = project.extractions.map(oldId => {
      const item = extractionsMap.get(oldId)
      if (item) item.projectId = id
      return item?.id ?? oldId
    })
    const transcriptions = project.transcriptions.map(oldId => {
      const item = transcriptionsMap.get(oldId)
      if (item) item.projectId = id
      return item?.id ?? oldId
    })
    const defaultTranslation = translationsMap.get(project.defaultTranslationId)
    if (defaultTranslation) defaultTranslation.projectId = id
    const defaultTranscription = transcriptionsMap.get(project.defaultTranscriptionId)
    if (defaultTranscription) defaultTranscription.projectId = id
    return {
      ...project,
      id,
      translations,
      extractions,
      transcriptions,
      defaultTranslationSettingsId: settingsMap.get(project.defaultTranslationSettingsId)?.id ?? project.defaultTranslationSettingsId,
      defaultExtractionSettingsId: settingsMap.get(project.defaultExtractionSettingsId)?.id ?? project.defaultExtractionSettingsId,
      defaultTranslationId: defaultTranslation?.id ?? project.defaultTranslationId,
      defaultTranscriptionId: defaultTranscription?.id ?? project.defaultTranscriptionId,
      batchAutoContextStartingExtractionId: project.batchAutoContextStartingExtractionId
        ? extractionsMap.get(project.batchAutoContextStartingExtractionId)?.id
          ?? project.batchAutoContextStartingExtractionId
        : null,
    }
  })
  const projectOrder = data.projectOrders.at(0)
  const projectOrders = projectOrder ? [{
    ...projectOrder,
    order: projectOrder.order.map(id => projectIdMap.get(id)).filter((id): id is string => !!id),
  }] : []

  return {
    formatVersion: 2,
    projects,
    translations: [...translationsMap.values()],
    transcriptions: [...transcriptionsMap.values()],
    extractions: [...extractionsMap.values()],
    projectOrders,
    settings: [...settingsMap.values()],
  }
}

function convertDates<T extends { createdAt?: string | Date; updatedAt?: string | Date }>(items: T[]): T[] {
  return items.map(item => ({
    ...item,
    createdAt: typeof item.createdAt === 'string' ? new Date(item.createdAt) : item.createdAt ?? new Date(),
    updatedAt: typeof item.updatedAt === 'string' ? new Date(item.updatedAt) : item.updatedAt ?? new Date(),
  }))
}

function projectConstructor(project: Partial<Project>): Project {
  return {
    id: project.id ?? uuidv4(),
    name: project.name ?? 'Project X',
    translations: project.translations ?? [],
    transcriptions: project.transcriptions ?? [],
    extractions: project.extractions ?? [],
    defaultTranslationSettingsId: project.defaultTranslationSettingsId ?? '',
    defaultTranslationId: project.defaultTranslationId ?? '',
    defaultExtractionSettingsId: project.defaultExtractionSettingsId ?? '',
    defaultTranscriptionId: project.defaultTranscriptionId ?? '',
    createdAt: project.createdAt ?? new Date(),
    updatedAt: project.updatedAt ?? new Date(),
    isBatch: project.isBatch ?? false,
    lastBatchOperationMode: project.lastBatchOperationMode ?? 'translation',
    isDefaultTranslationEnabled: project.isDefaultTranslationEnabled ?? false,
    isDefaultExtractionEnabled: project.isDefaultExtractionEnabled ?? false,
    isDefaultTranscriptionEnabled: project.isDefaultTranscriptionEnabled ?? false,
    isBatchAutoContextEnabled: project.isBatchAutoContextEnabled ?? false,
    batchAutoContextStartingExtractionId: project.batchAutoContextStartingExtractionId ?? null,
    isArchived: project.isArchived ?? false,
  }
}

function translationConstructor(translation: Partial<Translation>): Translation {
  return {
    id: translation.id ?? uuidv4(),
    title: translation.title ?? DEFAULT_TRANSLATION_SETTINGS.title,
    subtitles: translation.subtitles ?? [],
    parsed: sanitizeParsed(translation.parsed),
    projectId: translation.projectId ?? '',
    settingsId: translation.settingsId ?? '',
    autoContextMode: translation.autoContextMode ?? DEFAULT_TRANSLATION_SETTINGS.autoContextMode,
    autoContextExtractionId: translation.autoContextExtractionId ?? null,
    autoContextPreviousMode: translation.autoContextPreviousMode ?? DEFAULT_TRANSLATION_SETTINGS.autoContextPreviousMode,
    autoContextPreviousExtractionId: translation.autoContextPreviousExtractionId ?? null,
    response: translation.response ?? { response: '', jsonResponse: [] },
    createdAt: translation.createdAt ?? new Date(),
    updatedAt: translation.updatedAt ?? new Date(),
  }
}

function sanitizeParsed(parsed: Translation['parsed'] | undefined): Translation['parsed'] {
  const safe = parsed ?? { ...DEFAULT_TRANSLATION_SETTINGS.parsed }
  if (safe.type === 'ass' && safe.data) {
    const data = { ...safe.data } as typeof safe.data & { subtitles?: unknown }
    delete data.subtitles
    return { ...safe, data }
  }
  return safe
}

function transcriptionConstructor(transcription: Partial<Transcription>): Transcription {
  const legacyModel = transcription.models as string | null | undefined
  return {
    id: transcription.id ?? uuidv4(),
    title: transcription.title ?? DEFAULT_TRANSCRIPTION_SETTINGS.title,
    transcriptionText: transcription.transcriptionText ?? '',
    transcriptSubtitles: transcription.transcriptSubtitles ?? [],
    language: transcription.language ?? DEFAULT_TRANSCRIPTION_SETTINGS.language,
    selectedMode: transcription.selectedMode ?? DEFAULT_TRANSCRIPTION_SETTINGS.selectedMode,
    customInstructions: transcription.customInstructions ?? '',
    models: legacyModel === 'free' || legacyModel === 'mitsuko-free' || legacyModel === 'premium'
      ? 'mitsuko-premium'
      : transcription.models ?? DEFAULT_TRANSCRIPTION_SETTINGS.models,
    projectId: transcription.projectId ?? '',
    words: transcription.words ?? [],
    segments: transcription.segments ?? [],
    selectedUploadId: transcription.selectedUploadId ?? null,
    createdAt: transcription.createdAt ?? new Date(),
    updatedAt: transcription.updatedAt ?? new Date(),
  }
}

function extractionConstructor(extraction: Partial<Extraction>, isBatch = false, linkedOwnerId?: string): Extraction {
  const rawContextResult = extraction.contextResult ?? ''
  const status = normalizeExtractionStatus(extraction.status, rawContextResult, isBatch)
  const contextResult = stripExtractionDoneTag(rawContextResult)
  const looksAutoCreated = !!linkedOwnerId
    && typeof extraction.title === 'string'
    && extraction.title.startsWith(AUTO_CONTEXT_EXTRACTION_TITLE_PREFIX)
  const completedAt = extraction.completedAt instanceof Date
    ? extraction.completedAt
    : extraction.completedAt ? new Date(extraction.completedAt) : null
  return {
    id: extraction.id ?? uuidv4(),
    title: extraction.title ?? '',
    episodeNumber: extraction.episodeNumber ?? '',
    subtitleContent: extraction.subtitleContent ?? '',
    previousContext: extraction.previousContext ?? '',
    contextResult,
    status,
    ownerTranslationId: extraction.ownerTranslationId ?? (looksAutoCreated ? linkedOwnerId ?? null : null),
    completedAt: status === 'completed' ? completedAt ?? new Date() : null,
    projectId: extraction.projectId ?? '',
    settingsId: extraction.settingsId ?? '',
    createdAt: extraction.createdAt ?? new Date(),
    updatedAt: extraction.updatedAt ?? new Date(),
  }
}

type ImportedSettings = Partial<Settings> & { isBetterContextCaching?: boolean }

function settingsConstructor(
  settings: ImportedSettings,
  ownership?: Set<'translation' | 'extraction'>,
): Settings {
  const defaults = ownership?.has('translation') || !ownership?.has('extraction')
    ? DEFAULT_SETTINGS
    : DEFAULT_EXTRACTION_SETTINGS
  const { isBetterContextCaching, ...currentSettings } = settings
  const isMinimalContextMode = typeof settings.isMinimalContextMode === 'boolean'
    ? settings.isMinimalContextMode
    : typeof isBetterContextCaching === 'boolean'
      ? !isBetterContextCaching
      : DEFAULT_ADVANCED_SETTINGS.isMinimalContextMode
  return {
    ...defaults,
    ...currentSettings,
    isMinimalContextMode,
    fewShot: { ...defaults.fewShot, ...settings.fewShot },
    id: settings.id ?? uuidv4(),
    createdAt: settings.createdAt ?? new Date(),
    updatedAt: settings.updatedAt ?? new Date(),
  }
}

function buildSettingsOwnership(
  projects: Project[],
  translations: Translation[],
  extractions: Partial<Extraction>[],
): Map<string, Set<'translation' | 'extraction'>> {
  const ownership = new Map<string, Set<'translation' | 'extraction'>>()
  const add = (id: string | undefined, feature: 'translation' | 'extraction') => {
    if (!id) return
    const owners = ownership.get(id) ?? new Set()
    owners.add(feature)
    ownership.set(id, owners)
  }
  for (const project of projects) {
    add(project.defaultTranslationSettingsId, 'translation')
    add(project.defaultExtractionSettingsId, 'extraction')
  }
  for (const translation of translations) add(translation.settingsId, 'translation')
  for (const extraction of extractions) add(extraction.settingsId, 'extraction')
  return ownership
}

type Timestamped = { createdAt?: string | Date; updatedAt?: string | Date }

export function mergeSettingsTimestamps(
  basic: Timestamped | undefined,
  advanced: Timestamped | undefined,
  fallback: Date,
): { createdAt: Date; updatedAt: Date } {
  const dates = (values: (string | Date | undefined)[]) => values
    .filter((value): value is string | Date => value !== undefined)
    .map(value => value instanceof Date ? value : new Date(value))
  const created = dates([basic?.createdAt, advanced?.createdAt])
  const updated = dates([basic?.updatedAt, advanced?.updatedAt])
  return {
    createdAt: created.length ? new Date(Math.min(...created.map(date => date.getTime()))) : fallback,
    updatedAt: updated.length ? new Date(Math.max(...updated.map(date => date.getTime()))) : fallback,
  }
}

function projectOrderConstructor(order: Partial<ProjectOrder>): ProjectOrder {
  return {
    id: order.id ?? uuidv4(),
    order: order.order ?? [],
    createdAt: order.createdAt ?? new Date(),
    updatedAt: order.updatedAt ?? new Date(),
  }
}
