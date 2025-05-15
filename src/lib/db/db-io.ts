import { db } from './db'
import { DatabaseExport, databaseExportConstructor, generateNewIds } from './db-constructor'
import { Project, BasicSettings, AdvancedSettings } from '@/types/project'
import { DEFAULT_BASIC_SETTINGS, DEFAULT_ADVANCED_SETTINGS } from '@/constants/default'

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

export async function importDatabase(jsonString: string, clearExisting: boolean): Promise<void> {
  try {
    const importData = JSON.parse(jsonString)
    const convertedData = databaseExportConstructor(importData)

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

        // TODO: Move this to db-constructor.ts
        // Ensure projects have default settings
        convertedData.projects.forEach((project: Project) => {
          if (!project.defaultBasicSettingsId) {
            const basicSettingsId = crypto.randomUUID()
            const newBasicSettings: BasicSettings = {
              id: basicSettingsId,
              ...DEFAULT_BASIC_SETTINGS,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            convertedData.basicSettings.push(newBasicSettings)
            project.defaultBasicSettingsId = basicSettingsId
          }
          if (!project.defaultAdvancedSettingsId) {
            const advancedSettingsId = crypto.randomUUID()
            const newAdvancedSettings: AdvancedSettings = {
              id: advancedSettingsId,
              ...DEFAULT_ADVANCED_SETTINGS,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            convertedData.advancedSettings.push(newAdvancedSettings)
            project.defaultAdvancedSettingsId = advancedSettingsId
          }
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
