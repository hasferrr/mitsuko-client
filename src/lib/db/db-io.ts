import { db } from '@/lib/db/db'
import {
  DatabaseExport,
  LegacyDatabaseExport,
  databaseExportConstructor,
  generateNewIds,
  normalizeDatabaseExport,
} from '@/lib/db/db-constructor'
import { databaseExportSchema } from '@/lib/db/db-schema'
import { Project, Settings } from '@/types/project'
import { DEFAULT_EXTRACTION_SETTINGS, DEFAULT_SETTINGS, DEFAULT_TRANSLATION_SETTINGS } from '@/constants/default'
import {
  GLOBAL_EXTRACTION_SETTINGS_ID,
  GLOBAL_TRANSLATION_SETTINGS_ID,
  GLOBAL_TRANSCRIPTION_SETTINGS_ID,
} from '@/constants/global-settings'
import { buildTranslationTemplate } from '@/lib/translation/template'
import { buildTranscriptionTemplate } from '@/lib/transcription/template'
import { normalizeAutoContextDefault } from '@/lib/translation/auto-context-defaults'
import { ensureGlobalDefaultsExist } from '@/lib/db/global-settings'

const GLOBAL_SETTINGS_IDS = [GLOBAL_TRANSLATION_SETTINGS_ID, GLOBAL_EXTRACTION_SETTINGS_ID]

const stringifyExport = (data: DatabaseExport) => JSON.stringify(
  sanitizeExport(databaseExportConstructor(data)),
  null,
  process.env.NODE_ENV === 'development' ? 2 : undefined,
)

export async function exportDatabase(): Promise<string> {
  return stringifyExport({
    formatVersion: 2,
    projects: await db.projects.toArray(),
    translations: (await db.translations.toArray()).filter(item => item.id !== GLOBAL_TRANSLATION_SETTINGS_ID),
    transcriptions: (await db.transcriptions.toArray()).filter(item => item.id !== GLOBAL_TRANSCRIPTION_SETTINGS_ID),
    extractions: await db.extractions.toArray(),
    projectOrders: await db.projectOrders.toArray(),
    settings: (await db.settings.toArray()).filter(item => !GLOBAL_SETTINGS_IDS.includes(item.id)),
  })
}

async function getProjectExport(projectIds: string[]): Promise<DatabaseExport | null> {
  const projects = (await db.projects.bulkGet(projectIds)).filter((project): project is Project => !!project)
  if (projects.length === 0) return null
  const projectIdSet = new Set(projects.map(project => project.id))
  const selectedProjectIds = [...projectIdSet]
  const [translations, transcriptions, extractions] = await Promise.all([
    db.translations.where('projectId').anyOf(selectedProjectIds).toArray(),
    db.transcriptions.where('projectId').anyOf(selectedProjectIds).toArray(),
    db.extractions.where('projectId').anyOf(selectedProjectIds).toArray(),
  ])
  const settingsIds = new Set<string>()
  for (const project of projects) {
    settingsIds.add(project.defaultTranslationSettingsId)
    settingsIds.add(project.defaultExtractionSettingsId)
  }
  for (const item of [...translations, ...extractions]) settingsIds.add(item.settingsId)
  const settings = (await db.settings.bulkGet([...settingsIds])).filter(
    (item): item is Settings => !!item && !GLOBAL_SETTINGS_IDS.includes(item.id),
  )
  const currentOrder = await db.projectOrders.get('main')
  return {
    formatVersion: 2,
    projects,
    translations,
    transcriptions: transcriptions.filter(item => item.id !== GLOBAL_TRANSCRIPTION_SETTINGS_ID),
    extractions,
    projectOrders: [{
      id: currentOrder?.id ?? 'main',
      order: currentOrder?.order.filter(id => projectIdSet.has(id)) ?? projects.map(project => project.id),
      createdAt: currentOrder?.createdAt ?? new Date(),
      updatedAt: currentOrder?.updatedAt ?? new Date(),
    }],
    settings,
  }
}

export async function exportProject(projectId: string): Promise<{ name: string; content: string } | null> {
  const data = await getProjectExport([projectId])
  if (!data) return null
  return { name: data.projects[0].name, content: stringifyExport(data) }
}

export async function exportProjects(projectIds: string[]): Promise<{ content: string } | null> {
  const data = await getProjectExport(projectIds)
  return data ? { content: stringifyExport(data) } : null
}

function createDefaultSettings(
  defaults: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>,
  now: Date,
): Settings {
  return { ...defaults, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
}

function normalizeSettingsReferences(source: DatabaseExport): DatabaseExport {
  const data = structuredClone(source)
  const settingsById = new Map(data.settings.map(settings => [settings.id, settings]))
  const translationById = new Map(data.translations.map(item => [item.id, item]))
  const transcriptionById = new Map(data.transcriptions.map(item => [item.id, item]))
  const repaired = new Map<string, Settings>()
  const now = new Date()
  const globals = new Set(GLOBAL_SETTINGS_IDS)
  const repair = (
    currentId: string,
    feature: 'translation' | 'extraction',
  ) => {
    if (settingsById.has(currentId) || globals.has(currentId)) return currentId
    const key = currentId ? `${feature}:${currentId}` : ''
    const existing = key ? repaired.get(key) : undefined
    if (existing) return existing.id
    const settings = createDefaultSettings(
      feature === 'translation' ? DEFAULT_SETTINGS : DEFAULT_EXTRACTION_SETTINGS,
      now,
    )
    data.settings.push(settings)
    settingsById.set(settings.id, settings)
    if (key) repaired.set(key, settings)
    return settings.id
  }

  for (const project of data.projects) {
    project.defaultTranslationSettingsId = repair(project.defaultTranslationSettingsId, 'translation')
    project.defaultExtractionSettingsId = repair(project.defaultExtractionSettingsId, 'extraction')
    const template = translationById.get(project.defaultTranslationId)
    if (template) {
      template.projectId = project.id
      template.settingsId = project.defaultTranslationSettingsId
      template.autoContextMode = normalizeAutoContextDefault(template.autoContextMode)
      template.autoContextExtractionId = DEFAULT_TRANSLATION_SETTINGS.autoContextExtractionId
      template.autoContextPreviousMode = DEFAULT_TRANSLATION_SETTINGS.autoContextPreviousMode
      template.autoContextPreviousExtractionId = DEFAULT_TRANSLATION_SETTINGS.autoContextPreviousExtractionId
    } else {
      const item = buildTranslationTemplate({
        id: crypto.randomUUID(),
        projectId: project.id,
        settingsId: project.defaultTranslationSettingsId,
      })
      data.translations.push(item)
      translationById.set(item.id, item)
      project.defaultTranslationId = item.id
    }
    if (!transcriptionById.has(project.defaultTranscriptionId)) {
      const item = buildTranscriptionTemplate({ id: crypto.randomUUID(), projectId: project.id })
      data.transcriptions.push(item)
      transcriptionById.set(item.id, item)
      project.defaultTranscriptionId = item.id
    }
  }
  for (const translation of data.translations) {
    translation.settingsId = repair(translation.settingsId, 'translation')
  }
  for (const extraction of data.extractions) {
    extraction.settingsId = repair(extraction.settingsId, 'extraction')
  }
  return data
}

export function sanitizeExport(source: DatabaseExport): DatabaseExport {
  const data = structuredClone(source)
  const translationIds = new Set(data.translations.map(item => item.id))
  const extractionIds = new Set(data.extractions.map(item => item.id))
  for (const settings of data.settings) {
    if (settings.fewShot.type === 'linked' && !translationIds.has(settings.fewShot.linkedId)) {
      settings.fewShot = { ...settings.fewShot, isEnabled: false, linkedId: '' }
    }
  }
  for (const translation of data.translations) {
    if (translation.autoContextExtractionId !== null
      && !extractionIds.has(translation.autoContextExtractionId)) {
      translation.autoContextExtractionId = null
      if (translation.autoContextMode === 'use-existing') translation.autoContextMode = 'disabled'
    }
    if (translation.autoContextPreviousExtractionId !== null
      && !extractionIds.has(translation.autoContextPreviousExtractionId)) {
      translation.autoContextPreviousExtractionId = null
      if (translation.autoContextPreviousMode === 'selected') translation.autoContextPreviousMode = 'none'
    }
  }
  for (const extraction of data.extractions) {
    if (extraction.ownerTranslationId !== null && !translationIds.has(extraction.ownerTranslationId)) {
      extraction.ownerTranslationId = null
    }
  }
  return data
}

export async function importDatabase(jsonString: string, clearExisting: boolean): Promise<void> {
  const parsed = databaseExportSchema.parse(JSON.parse(jsonString))
  let normalized = normalizeDatabaseExport(parsed as unknown as Partial<DatabaseExport> & Partial<LegacyDatabaseExport>)
  normalized.translations = normalized.translations.filter(item => item.id !== GLOBAL_TRANSLATION_SETTINGS_ID)
  normalized.transcriptions = normalized.transcriptions.filter(item => item.id !== GLOBAL_TRANSCRIPTION_SETTINGS_ID)
  normalized.settings = normalized.settings.filter(item => !GLOBAL_SETTINGS_IDS.includes(item.id))
  normalized = normalizeSettingsReferences(normalized)
  const data = clearExisting ? normalized : generateNewIds(normalized)
  await ensureGlobalDefaultsExist()

  await db.transaction('rw', [
    db.projects,
    db.translations,
    db.transcriptions,
    db.extractions,
    db.projectOrders,
    db.settings,
  ], async () => {
    if (clearExisting) {
      await Promise.all([
        db.projects.clear(),
        db.translations.filter(item => item.id !== GLOBAL_TRANSLATION_SETTINGS_ID).delete(),
        db.transcriptions.filter(item => item.id !== GLOBAL_TRANSCRIPTION_SETTINGS_ID).delete(),
        db.extractions.clear(),
        db.projectOrders.clear(),
        db.settings.filter(item => !GLOBAL_SETTINGS_IDS.includes(item.id)).delete(),
      ])
    } else {
      const importedOrder = data.projectOrders.at(0)?.order ?? data.projects.map(project => project.id)
      const currentOrder = await db.projectOrders.get('main')
      data.projectOrders = [{
        id: 'main',
        order: [...importedOrder, ...(currentOrder?.order ?? [])],
        createdAt: currentOrder?.createdAt ?? new Date(),
        updatedAt: new Date(),
      }]
    }

    await Promise.all([
      db.projects.bulkAdd(data.projects),
      db.translations.bulkAdd(data.translations),
      db.transcriptions.bulkAdd(data.transcriptions),
      db.extractions.bulkAdd(data.extractions),
      db.settings.bulkAdd(data.settings),
      db.projectOrders.bulkPut(data.projectOrders),
    ])
  })
}
