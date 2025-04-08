import { db } from './db'
import { Project, Translation, Transcription, Extraction, ProjectOrder, BasicSettings, AdvancedSettings } from '@/types/project'

const uuidv4 = () => crypto.randomUUID()

export interface DatabaseExport {
  projects: Project[]
  translations: Translation[]
  transcriptions: Transcription[]
  extractions: Extraction[]
  projectOrders: ProjectOrder[]
  basicSettings: BasicSettings[]
  advancedSettings: AdvancedSettings[]
}

/**
 * Convert string dates to Date objects in an array of objects
 * @param items Array of objects that may contain date strings
 * @returns Array of objects with converted dates
 */
function convertDates<T extends { createdAt?: string | Date; updatedAt?: string | Date }>(items: T[]): T[] {
  return items.map(item => ({
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined
  }))
}

/**
 * Generate new IDs for all items and update references
 * @param data The data to process
 * @returns Processed data with new IDs
 */
function generateNewIds(data: DatabaseExport): DatabaseExport {

  // Create maps of old IDs to new Settings
  const basicSettings: Map<string, BasicSettings> = new Map()
  const advancedSettings: Map<string, AdvancedSettings> = new Map()

  // Create maps of old IDs to new Settings
  for (const basicSetting of data.basicSettings) {
    basicSettings.set(basicSetting.id, { ...basicSetting, id: uuidv4() })
  }
  for (const advancedSetting of data.advancedSettings) {
    advancedSettings.set(advancedSetting.id, { ...advancedSetting, id: uuidv4() })
  }

  // Create maps of old IDs to new Items
  const translations: Map<string, Translation> = new Map()
  const transcriptions: Map<string, Transcription> = new Map()
  const extractions: Map<string, Extraction> = new Map()

  // Create maps of old IDs to new Items
  for (const translation of data.translations) {
    translations.set(translation.id, {
      ...translation,
      id: uuidv4(),
      basicSettingsId: basicSettings.get(translation.basicSettingsId)?.id ?? translation.basicSettingsId,
      advancedSettingsId: advancedSettings.get(translation.advancedSettingsId)?.id ?? translation.advancedSettingsId,
      projectId: "",
    })
  }
  for (const extraction of data.extractions) {
    extractions.set(extraction.id, {
      ...extraction,
      id: uuidv4(),
      basicSettingsId: basicSettings.get(extraction.basicSettingsId)?.id ?? extraction.basicSettingsId,
      advancedSettingsId: advancedSettings.get(extraction.advancedSettingsId)?.id ?? extraction.advancedSettingsId,
      projectId: "",
    })
  }
  for (const transcription of data.transcriptions) {
    transcriptions.set(transcription.id, {
      ...transcription,
      id: uuidv4(),
      projectId: "",
    })
  }

  // Create new projects with new IDs
  const newProjects = data.projects.map(project => {
    const newId = uuidv4()

    const newTranslationsId = project.translations.map(translationId => {
      const newTranslation = translations.get(translationId)
      if (newTranslation) {
        newTranslation.projectId = newId
        return newTranslation.id
      } else {
        return translationId
      }
    })
    const newExtractionsId = project.extractions.map(extractionId => {
      const newExtraction = extractions.get(extractionId)
      if (newExtraction) {
        newExtraction.projectId = newId
        return newExtraction.id
      } else {
        return extractionId
      }
    })
    const newTranscriptionsId = project.transcriptions.map(transcriptionId => {
      const newTranscription = transcriptions.get(transcriptionId)
      if (newTranscription) {
        newTranscription.projectId = newId
        return newTranscription.id
      } else {
        return transcriptionId
      }
    })

    return {
      ...project,
      id: newId,
      translations: newTranslationsId,
      transcriptions: newTranscriptionsId,
      extractions: newExtractionsId
    }
  })

  const newTranslations = Array.from(translations.values())
  const newTranscriptions = Array.from(transcriptions.values())
  const newExtractions = Array.from(extractions.values())
  const newBasicSettings = Array.from(basicSettings.values())
  const newAdvancedSettings = Array.from(advancedSettings.values())

  const newProjectOrders = data.projectOrders[0]
  newProjectOrders.order = newProjects.map(project => project.id)

  return {
    projects: newProjects,
    translations: newTranslations,
    transcriptions: newTranscriptions,
    extractions: newExtractions,
    projectOrders: [newProjectOrders],
    basicSettings: newBasicSettings,
    advancedSettings: newAdvancedSettings
  }
}

/**
 * Export all data from IndexedDB to a JSON file
 * @returns Promise<string> - JSON string containing all database data
 */
export async function exportDatabase(): Promise<string> {
  const exportData: DatabaseExport = {
    projects: await db.projects.toArray(),
    translations: await db.translations.toArray(),
    transcriptions: await db.transcriptions.toArray(),
    extractions: await db.extractions.toArray(),
    projectOrders: await db.projectOrders.toArray(),
    basicSettings: await db.basicSettings.toArray(),
    advancedSettings: await db.advancedSettings.toArray(),
  }

  if (process.env.NODE_ENV === 'development') {
    return JSON.stringify(exportData, null, 2)
  }

  return JSON.stringify(exportData)
}

/**
 * Import data from a JSON file into IndexedDB
 * @param jsonString - JSON string containing database data
 * @param clearExisting - Whether to clear existing data before import
 * @returns Promise<void>
 */
export async function importDatabase(jsonString: string, clearExisting: boolean): Promise<void> {
  try {
    const importData = JSON.parse(jsonString)

    // Convert dates in all arrays
    const convertedData: DatabaseExport = {
      projects: convertDates(importData.projects),
      translations: convertDates(importData.translations),
      transcriptions: convertDates(importData.transcriptions),
      extractions: convertDates(importData.extractions),
      projectOrders: convertDates(importData.projectOrders),
      basicSettings: convertDates(importData.basicSettings),
      advancedSettings: convertDates(importData.advancedSettings)
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
        // Clear all tables
        await Promise.all([
          db.projects.clear(),
          db.translations.clear(),
          db.transcriptions.clear(),
          db.extractions.clear(),
          db.projectOrders.clear(),
          db.basicSettings.clear(),
          db.advancedSettings.clear()
        ])

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

        // Upadate current project order
        let currentProjectOrder = await db.projectOrders.get(convertedData.projectOrders[0].id)
        if (currentProjectOrder) {
          currentProjectOrder.order = [...convertedData.projects.map(project => project.id), ...currentProjectOrder.order]
        } else {
          currentProjectOrder = dataWithNewIds.projectOrders[0]
        }
        const projectOrderPromise = db.projectOrders.put(currentProjectOrder)

        // Import data into each table
        await Promise.all([
          db.projects.bulkAdd(convertedData.projects),
          db.translations.bulkAdd(convertedData.translations),
          db.transcriptions.bulkAdd(convertedData.transcriptions),
          db.extractions.bulkAdd(convertedData.extractions),
          projectOrderPromise,
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

/**
 * Clear all data from IndexedDB
 * @returns Promise<void>
 */
export async function clearDatabase(): Promise<void> {
  try {
    await db.transaction('rw', [
      db.projects,
      db.translations,
      db.transcriptions,
      db.extractions,
      db.projectOrders,
      db.basicSettings,
      db.advancedSettings
    ], async () => {
      await Promise.all([
        db.projects.clear(),
        db.translations.clear(),
        db.transcriptions.clear(),
        db.extractions.clear(),
        db.projectOrders.clear(),
        db.basicSettings.clear(),
        db.advancedSettings.clear()
      ])
    })
  } catch (error) {
    console.error('Error clearing database:', error)
    throw error
  }
}