import { db } from './db'
import { DatabaseExport, databaseExportConstructor, generateNewIds } from './db-constructor'
import { Project, BasicSettings, AdvancedSettings, Transcription } from '@/types/project'
import { DEFAULT_BASIC_SETTINGS, DEFAULT_ADVANCED_SETTINGS, DEFAULT_TRANSCTIPTION_SETTINGS } from '@/constants/default'
import { GLOBAL_ADVANCED_SETTINGS_ID, GLOBAL_BASIC_SETTINGS_ID } from '@/constants/global-settings'

export async function exportDatabase(): Promise<string> {
  const exportData: DatabaseExport = {
    projects: await db.projects.toArray(),
    translations: await db.translations.toArray(),
    transcriptions: await db.transcriptions.toArray(),
    extractions: await db.extractions.toArray(),
    projectOrders: await db.projectOrders.toArray(),
    basicSettings: (await db.basicSettings.toArray()).filter(s => s.id !== GLOBAL_BASIC_SETTINGS_ID),
    advancedSettings: (await db.advancedSettings.toArray()).filter(s => s.id !== GLOBAL_ADVANCED_SETTINGS_ID),
  }

  if (process.env.NODE_ENV === 'development') {
    return JSON.stringify(databaseExportConstructor(exportData), null, 2)
  }

  return JSON.stringify(databaseExportConstructor(exportData))
}

export async function exportProject(
  projectId: string
): Promise<{ name: string; content: string } | null> {
  const project = await db.projects.get(projectId)
  if (!project) {
    return null
  }

  const translations = await db.translations
    .where("projectId")
    .equals(projectId)
    .toArray()
  const transcriptions = await db.transcriptions
    .where("projectId")
    .equals(projectId)
    .toArray()
  const extractions = await db.extractions
    .where("projectId")
    .equals(projectId)
    .toArray()

  const basicSettingsIds = new Set<string>()
  const advancedSettingsIds = new Set<string>()

  if (project.defaultBasicSettingsId) {
    basicSettingsIds.add(project.defaultBasicSettingsId)
  }
  if (project.defaultAdvancedSettingsId) {
    advancedSettingsIds.add(project.defaultAdvancedSettingsId)
  }
  if (project.defaultTranslationBasicSettingsId) {
    basicSettingsIds.add(project.defaultTranslationBasicSettingsId)
  }
  if (project.defaultTranslationAdvancedSettingsId) {
    advancedSettingsIds.add(project.defaultTranslationAdvancedSettingsId)
  }
  if (project.defaultExtractionBasicSettingsId) {
    basicSettingsIds.add(project.defaultExtractionBasicSettingsId)
  }
  if (project.defaultExtractionAdvancedSettingsId) {
    advancedSettingsIds.add(project.defaultExtractionAdvancedSettingsId)
  }

  translations.forEach((t) => {
    basicSettingsIds.add(t.basicSettingsId)
    advancedSettingsIds.add(t.advancedSettingsId)
  })

  extractions.forEach((e) => {
    basicSettingsIds.add(e.basicSettingsId)
    advancedSettingsIds.add(e.advancedSettingsId)
  })

  const basicSettings = (
    await db.basicSettings.bulkGet(Array.from(basicSettingsIds))
  ).filter((s): s is BasicSettings => s !== undefined && s.id !== GLOBAL_BASIC_SETTINGS_ID)
  const advancedSettings = (
    await db.advancedSettings.bulkGet(Array.from(advancedSettingsIds))
  ).filter((s): s is AdvancedSettings => s !== undefined && s.id !== GLOBAL_ADVANCED_SETTINGS_ID)

  const projectOrders = await db.projectOrders.limit(1).toArray()
  const projectOrder =
    projectOrders.length > 0
      ? projectOrders[0]
      : {
          id: crypto.randomUUID(),
          order: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

  const exportData: DatabaseExport = {
    projects: [project],
    translations,
    transcriptions,
    extractions,
    projectOrders: [{ ...projectOrder, order: [project.id] }],
    basicSettings,
    advancedSettings,
  }

  const content =
    process.env.NODE_ENV === "development"
      ? JSON.stringify(databaseExportConstructor(exportData), null, 2)
      : JSON.stringify(databaseExportConstructor(exportData))

  return {
    name: project.name,
    content,
  }
}

export async function importDatabase(jsonString: string, clearExisting: boolean): Promise<void> {
  try {
    const importData = JSON.parse(jsonString)
    const convertedData = databaseExportConstructor(importData)

    const ensureProjectDefaultSettings = (project: Project) => {
      const now = new Date()

      const getBasicSettingsById = (id: string) => convertedData.basicSettings.find(s => s.id === id)
      const getAdvancedSettingsById = (id: string) => convertedData.advancedSettings.find(s => s.id === id)

      if (!project.defaultBasicSettingsId || !getBasicSettingsById(project.defaultBasicSettingsId)) {
        const basicSettingsId = crypto.randomUUID()
        const newBasicSettings: BasicSettings = {
          id: basicSettingsId,
          ...DEFAULT_BASIC_SETTINGS,
          createdAt: now,
          updatedAt: now,
        }
        convertedData.basicSettings.push(newBasicSettings)
        project.defaultBasicSettingsId = basicSettingsId
      }

      if (!project.defaultAdvancedSettingsId || !getAdvancedSettingsById(project.defaultAdvancedSettingsId)) {
        const advancedSettingsId = crypto.randomUUID()
        const newAdvancedSettings: AdvancedSettings = {
          id: advancedSettingsId,
          ...DEFAULT_ADVANCED_SETTINGS,
          createdAt: now,
          updatedAt: now,
        }
        convertedData.advancedSettings.push(newAdvancedSettings)
        project.defaultAdvancedSettingsId = advancedSettingsId
      }

      const baseBasicSettings = getBasicSettingsById(project.defaultBasicSettingsId) ?? null
      const baseAdvancedSettings = getAdvancedSettingsById(project.defaultAdvancedSettingsId) ?? null

      if (!project.defaultTranslationBasicSettingsId || !getBasicSettingsById(project.defaultTranslationBasicSettingsId)) {
        const basicSettingsId = crypto.randomUUID()
        const newBasicSettings: BasicSettings = {
          ...(baseBasicSettings ? { ...baseBasicSettings } : { ...DEFAULT_BASIC_SETTINGS }),
          id: basicSettingsId,
          createdAt: now,
          updatedAt: now,
        }
        convertedData.basicSettings.push(newBasicSettings)
        project.defaultTranslationBasicSettingsId = basicSettingsId
      }

      if (!project.defaultTranslationAdvancedSettingsId || !getAdvancedSettingsById(project.defaultTranslationAdvancedSettingsId)) {
        const advancedSettingsId = crypto.randomUUID()
        const newAdvancedSettings: AdvancedSettings = {
          ...(baseAdvancedSettings ? { ...baseAdvancedSettings } : { ...DEFAULT_ADVANCED_SETTINGS }),
          id: advancedSettingsId,
          createdAt: now,
          updatedAt: now,
        }
        convertedData.advancedSettings.push(newAdvancedSettings)
        project.defaultTranslationAdvancedSettingsId = advancedSettingsId
      }

      if (!project.defaultExtractionBasicSettingsId || !getBasicSettingsById(project.defaultExtractionBasicSettingsId)) {
        const basicSettingsId = crypto.randomUUID()
        const newBasicSettings: BasicSettings = {
          ...(baseBasicSettings ? { ...baseBasicSettings } : { ...DEFAULT_BASIC_SETTINGS }),
          id: basicSettingsId,
          createdAt: now,
          updatedAt: now,
        }
        convertedData.basicSettings.push(newBasicSettings)
        project.defaultExtractionBasicSettingsId = basicSettingsId
      }

      if (!project.defaultExtractionAdvancedSettingsId || !getAdvancedSettingsById(project.defaultExtractionAdvancedSettingsId)) {
        const advancedSettingsId = crypto.randomUUID()
        const newAdvancedSettings: AdvancedSettings = {
          ...(baseAdvancedSettings ? { ...baseAdvancedSettings } : { ...DEFAULT_ADVANCED_SETTINGS }),
          id: advancedSettingsId,
          createdAt: now,
          updatedAt: now,
        }
        convertedData.advancedSettings.push(newAdvancedSettings)
        project.defaultExtractionAdvancedSettingsId = advancedSettingsId
      }

      // Check if defaultTranscriptionId exists and the transcription exists in import data
      const getTranscriptionById = (id: string) => convertedData.transcriptions.find(t => t.id === id)
      if (!project.defaultTranscriptionId || !getTranscriptionById(project.defaultTranscriptionId)) {
        const transcriptionId = crypto.randomUUID()
        const newDefaultTranscription: Transcription = {
          id: transcriptionId,
          projectId: project.id,
          title: '',
          ...DEFAULT_TRANSCTIPTION_SETTINGS,
          transcriptionText: '',
          transcriptSubtitles: [],
          words: [],
          segments: [],
          createdAt: now,
          updatedAt: now,
        }
        convertedData.transcriptions.push(newDefaultTranscription)
        project.defaultTranscriptionId = transcriptionId
      }
    }

    // Start a transaction to ensure atomic import
    await db.transaction('rw', [
      db.projects,
      db.translations,
      db.transcriptions,
      db.extractions,
      db.projectOrders,
      db.basicSettings,
      db.advancedSettings
    ], async () => {
      if (clearExisting) {
        // Clear all tables (except global settings)
        await Promise.all([
          db.projects.clear(),
          db.translations.clear(),
          db.transcriptions.clear(),
          db.extractions.clear(),
          db.projectOrders.clear(),
          db.basicSettings
            .filter(s => s.id !== GLOBAL_BASIC_SETTINGS_ID)
            .delete(),
          db.advancedSettings
            .filter(s => s.id !== GLOBAL_ADVANCED_SETTINGS_ID)
            .delete()
        ])

        // TODO: Move this to db-constructor.ts
        // Ensure projects have default settings
        convertedData.projects.forEach((project: Project) => {
          ensureProjectDefaultSettings(project)
        })

        // Add new items
        await Promise.all([
          db.projects.bulkAdd(convertedData.projects),
          db.translations.bulkAdd(convertedData.translations),
          db.transcriptions.bulkAdd(convertedData.transcriptions),
          db.extractions.bulkAdd(convertedData.extractions),
          db.projectOrders.bulkAdd(convertedData.projectOrders),
          db.basicSettings.bulkAdd(convertedData.basicSettings),
          db.advancedSettings.bulkAdd(convertedData.advancedSettings)
        ])
      } else {
        // Generate new IDs for all items
        const dataWithNewIds = generateNewIds(convertedData)
        convertedData.projects = dataWithNewIds.projects
        convertedData.translations = dataWithNewIds.translations
        convertedData.transcriptions = dataWithNewIds.transcriptions
        convertedData.extractions = dataWithNewIds.extractions
        convertedData.projectOrders = dataWithNewIds.projectOrders
        convertedData.basicSettings = dataWithNewIds.basicSettings
        convertedData.advancedSettings = dataWithNewIds.advancedSettings

        // TODO: Move this to db-constructor.ts
        // Ensure projects have default settings
        convertedData.projects.forEach((project: Project) => {
          ensureProjectDefaultSettings(project)
        })

        // Upadate current project order
        let currentProjectOrder = await db.projectOrders.get(convertedData.projectOrders.at(0)?.id ?? "")
        if (currentProjectOrder) {
          currentProjectOrder.order = [...convertedData.projects.map(project => project.id), ...currentProjectOrder.order]
        } else {
          currentProjectOrder = dataWithNewIds.projectOrders.at(0)
        }
        if (currentProjectOrder) {
          await db.projectOrders.put(currentProjectOrder)
        }

        // Import data into each table
        await Promise.all([
          db.projects.bulkAdd(convertedData.projects),
          db.translations.bulkAdd(convertedData.translations),
          db.transcriptions.bulkAdd(convertedData.transcriptions),
          db.extractions.bulkAdd(convertedData.extractions),
          db.basicSettings.bulkAdd(convertedData.basicSettings),
          db.advancedSettings.bulkAdd(convertedData.advancedSettings),
        ])
      }
    })
  } catch (error) {
    console.error('Error importing database:', error)
    throw error
  }
}
