import { DEFAULT_ADVANCED_SETTINGS, DEFAULT_BASIC_SETTINGS } from '@/constants/default'
import { Project, Translation, Transcription, Extraction, ProjectOrder, BasicSettings, AdvancedSettings } from '@/types/project'
import { CustomInstruction } from '@/types/custom-instruction'
import Dexie, { Table } from 'dexie'

class MyDatabase extends Dexie {
  projects!: Table<Project, string>
  translations!: Table<Translation, string>
  transcriptions!: Table<Transcription, string>
  extractions!: Table<Extraction, string>
  projectOrders!: Table<ProjectOrder, string>
  basicSettings!: Table<BasicSettings, string>
  advancedSettings!: Table<AdvancedSettings, string>
  customInstructions!: Table<CustomInstruction, string>

  constructor() {
    super('myDatabase')
    this.version(6).stores({
      projects: 'id, name, createdAt, updatedAt',
      translations: 'id, projectId, title, createdAt, updatedAt',
      transcriptions: 'id, projectId, title, createdAt, updatedAt',
      extractions: 'id, projectId, episodeNumber, createdAt, updatedAt',
      projectOrders: 'id',
      basicSettings: 'id, createdAt, updatedAt',
      advancedSettings: 'id, createdAt, updatedAt',
    })
    this.version(7).stores({
      // No schema changes needed for basicSettings regarding indexing modelDetail.isPaid,
      // as Dexie doesn't directly support indexing nested properties easily in the stores() definition.
      // The structure itself allows storing the nested object.
    }).upgrade(async tx => {
      // Migrate basicSettings: add isPaid: false to modelDetail if it exists
      await tx.table('basicSettings').toCollection().modify(setting => {
        if (setting.modelDetail && typeof setting.modelDetail === 'object') {
          // Ensure isPaid is set to false, even if modelDetail already existed
          setting.modelDetail.isPaid = false
        }
      })
    })
    this.version(8).stores({
      // No schema changes needed in stores() for adding 'customInstructions'
      // as it's not indexed. Dexie handles adding new unindexed properties automatically.
    }).upgrade(async tx => {
      // Migrate basicSettings: add customInstructions: ''
      await tx.table('basicSettings').toCollection().modify(setting => {
        // Add the customInstructions field with a default empty string value
        // if it doesn't already exist.
        if (typeof setting.customInstructions === 'undefined') {
          setting.customInstructions = ''
        }
      })
    })
    this.version(9).stores({
      // No schema changes needed in stores() for adding 'selectedMode' and 'customInstructions'
      // to the 'transcriptions' table as they are not indexed.
    }).upgrade(async tx => {
      // Migrate transcriptions: add selectedMode, customInstructions, models
      await tx.table('transcriptions').toCollection().modify(transcription => {
        // Add selectedMode with default 'sentence' if it doesn't exist
        if (typeof transcription.selectedMode === 'undefined') {
          transcription.selectedMode = 'sentence'
        }
        // Add customInstructions with default '' if it doesn't exist
        if (typeof transcription.customInstructions === 'undefined') {
          transcription.customInstructions = ''
        }
        // Add models with default 'free' if it doesn't exist
        if (typeof transcription.models === 'undefined') {
          transcription.models = 'free'
        }
      })
    })
    this.version(10).stores({}).upgrade(async tx => {
      // Migrate basicSettings: add fewShot object
      await tx.table('basicSettings').toCollection().modify(setting => {
        if (typeof setting.fewShot === 'undefined') {
          setting.fewShot = {
            ...DEFAULT_BASIC_SETTINGS.fewShot
          }
        }
      })
    })
    this.version(11).stores({}).upgrade(async tx => {
      // Migrate projects: add defaultBasicSettingsId, defaultAdvancedSettingsId
      const newBasicSettingsList: BasicSettings[] = []
      const newAdvancedSettingsList: AdvancedSettings[] = []

      await tx.table('projects').toCollection().modify(async (project: Project) => {
        if (typeof project.defaultBasicSettingsId === 'undefined') {
          const basicSettingsId = crypto.randomUUID()
          const newBasicSettings: BasicSettings = {
            id: basicSettingsId,
            ...DEFAULT_BASIC_SETTINGS,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          newBasicSettingsList.push(newBasicSettings)
          project.defaultBasicSettingsId = basicSettingsId
        }

        if (typeof project.defaultAdvancedSettingsId === 'undefined') {
          const advancedSettingsId = crypto.randomUUID()
          const newAdvancedSettings: AdvancedSettings = {
            id: advancedSettingsId,
            ...DEFAULT_ADVANCED_SETTINGS,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          newAdvancedSettingsList.push(newAdvancedSettings)
          project.defaultAdvancedSettingsId = advancedSettingsId
        }
      })

      if (newBasicSettingsList.length > 0) {
        await tx.table('basicSettings').bulkAdd(newBasicSettingsList)
      }
      if (newAdvancedSettingsList.length > 0) {
        await tx.table('advancedSettings').bulkAdd(newAdvancedSettingsList)
      }
    })
    this.version(12).stores({})
    this.version(13).stores({
      customInstructions: 'id, name'
    })
    this.version(14).stores({
      // adding isBatch flag to projects (non-indexed)
    }).upgrade(async tx => {
      await tx.table('projects').toCollection().modify(project => {
        if (typeof project.isBatch === 'undefined') {
          project.isBatch = false
        }
      })
    })
    this.version(15).stores({}).upgrade(async tx => {
      // Cleanup: remove deprecated isAdvancedReasoningEnabled field
      await tx.table('advancedSettings').toCollection().modify(setting => {
        delete (setting as Record<string, unknown>).isAdvancedReasoningEnabled
      })
    })
    this.version(16).stores({}).upgrade(async tx => {
      await tx.table('transcriptions').toCollection().modify(transcription => {
        delete (transcription as Record<string, unknown>).isOverOneHour
      })
    })
    this.version(17).stores({}).upgrade(async tx => {
      await tx.table('extractions').toCollection().modify(extraction => {
        if (typeof extraction.title === 'undefined') {
          extraction.title = ''
        }
      })
    })
    this.version(18).stores({}).upgrade(async tx => {
      await tx.table('transcriptions').toCollection().modify(transcription => {
        if (typeof transcription.language === 'undefined') {
          transcription.language = 'auto'
        }
      })
    })
    this.version(19).stores({}).upgrade(async tx => {
      await tx.table('transcriptions').toCollection().modify(transcription => {
        if (transcription.models === 'premium') {
          transcription.models = 'mitsuko-premium'
        } else if (transcription.models === 'free') {
          transcription.models = 'mitsuko-free'
        }
      })
    })
    this.version(20).stores({}).upgrade(async tx => {
      await tx.table('transcriptions').toCollection().modify(transcription => {
        if (typeof transcription.words === 'undefined') {
          transcription.words = []
        }
        if (typeof transcription.segments === 'undefined') {
          transcription.segments = []
        }
      })
    })
    this.version(21).stores({}).upgrade(async tx => {
      const projectsTable = tx.table('projects')
      const basicSettingsTable = tx.table('basicSettings')
      const advancedSettingsTable = tx.table('advancedSettings')

      const projects = await projectsTable.toArray() as Project[]
      const newBasicSettingsList: BasicSettings[] = []
      const newAdvancedSettingsList: AdvancedSettings[] = []
      const projectUpdates: { id: string; changes: Partial<Project> }[] = []

      for (const project of projects) {
        const changes: Partial<Project> = {}

        if (
          !project.defaultTranslationBasicSettingsId
          || !project.defaultTranslationAdvancedSettingsId
          || !project.defaultExtractionBasicSettingsId
          || !project.defaultExtractionAdvancedSettingsId
        ) {
          const existingBasicSettings = await basicSettingsTable.get(project.defaultBasicSettingsId) as BasicSettings | undefined
          const existingAdvancedSettings = await advancedSettingsTable.get(project.defaultAdvancedSettingsId) as AdvancedSettings | undefined

          const baseBasicSettings = existingBasicSettings ?? { ...DEFAULT_BASIC_SETTINGS }
          const baseAdvancedSettings = existingAdvancedSettings ?? { ...DEFAULT_ADVANCED_SETTINGS }

          if (!project.defaultTranslationBasicSettingsId) {
            const basicSettingsId = crypto.randomUUID()
            const newBasicSettings: BasicSettings = {
              ...baseBasicSettings,
              id: basicSettingsId,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            newBasicSettingsList.push(newBasicSettings)
            changes.defaultTranslationBasicSettingsId = basicSettingsId
          }

          if (!project.defaultTranslationAdvancedSettingsId) {
            const advancedSettingsId = crypto.randomUUID()
            const newAdvancedSettings: AdvancedSettings = {
              ...baseAdvancedSettings,
              id: advancedSettingsId,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            newAdvancedSettingsList.push(newAdvancedSettings)
            changes.defaultTranslationAdvancedSettingsId = advancedSettingsId
          }

          if (!project.defaultExtractionBasicSettingsId) {
            const basicSettingsId = crypto.randomUUID()
            const newBasicSettings: BasicSettings = {
              ...baseBasicSettings,
              id: basicSettingsId,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            newBasicSettingsList.push(newBasicSettings)
            changes.defaultExtractionBasicSettingsId = basicSettingsId
          }

          if (!project.defaultExtractionAdvancedSettingsId) {
            const advancedSettingsId = crypto.randomUUID()
            const newAdvancedSettings: AdvancedSettings = {
              ...baseAdvancedSettings,
              id: advancedSettingsId,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            newAdvancedSettingsList.push(newAdvancedSettings)
            changes.defaultExtractionAdvancedSettingsId = advancedSettingsId
          }

          if (Object.keys(changes).length > 0) {
            projectUpdates.push({ id: project.id, changes })
          }
        }
      }

      if (newBasicSettingsList.length > 0) {
        await basicSettingsTable.bulkAdd(newBasicSettingsList)
      }
      if (newAdvancedSettingsList.length > 0) {
        await advancedSettingsTable.bulkAdd(newAdvancedSettingsList)
      }

      for (const update of projectUpdates) {
        await projectsTable.update(update.id, update.changes)
      }
    })
  }
}

export const db = new MyDatabase()
