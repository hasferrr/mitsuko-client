import {
  DEFAULT_ADVANCED_SETTINGS,
  DEFAULT_BASIC_SETTINGS,
  DEFAULT_EXTRACTION_BASIC_SETTINGS,
} from '@/constants/default'
import { LegacyProject as Project, LegacyTranslation as Translation, LegacyExtraction as Extraction } from '@/types/legacy-project'
import { Transcription, ProjectOrder, BasicSettings, AdvancedSettings } from '@/types/project'
import type { LegacyAdvancedSettings } from '@/types/legacy-project'
import { Project as CurrentProject, Translation as CurrentTranslation, Extraction as CurrentExtraction, Settings } from '@/types/project'
import { CustomInstruction, CustomInstructionOrder } from '@/types/custom-instruction'
import Dexie, { Table } from 'dexie'
import {
  AUTO_CONTEXT_EXTRACTION_TITLE_PREFIX,
  normalizeExtractionStatus,
  stripExtractionDoneTag,
} from '@/lib/extraction/status'
import {
  LEGACY_GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID,
  LEGACY_GLOBAL_TRANSLATION_BASIC_SETTINGS_ID,
  GLOBAL_TRANSCRIPTION_SETTINGS_ID,
  GLOBAL_TRANSLATION_SETTINGS_ID,
} from '@/constants/global-settings'
import {
  LEGACY_GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID,
  LEGACY_GLOBAL_EXTRACTION_BASIC_SETTINGS_ID,
  GLOBAL_EXTRACTION_SETTINGS_ID,
} from '@/constants/global-settings'
import { buildTranslationTemplate } from '@/lib/translation/template'
import { buildTranscriptionTemplate } from '@/lib/transcription/template'
import { getOrphanedLegacySettingsIds, LegacyProjectSettingsReferences } from './legacy-settings'

type LegacyProject = Project & LegacyProjectSettingsReferences

export class MyDatabase extends Dexie {
  projects!: Table<CurrentProject, string>
  translations!: Table<CurrentTranslation, string>
  transcriptions!: Table<Transcription, string>
  extractions!: Table<CurrentExtraction, string>
  projectOrders!: Table<ProjectOrder, string>
  settings!: Table<Settings, string>
  customInstructions!: Table<CustomInstruction, string>
  customInstructionOrders!: Table<CustomInstructionOrder, string>

  constructor(name = 'myDatabase') {
    super(name)
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

      await tx.table('projects').toCollection().modify(async (project: LegacyProject) => {
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

      const projects = await projectsTable.toArray() as LegacyProject[]
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
              ...DEFAULT_EXTRACTION_BASIC_SETTINGS,
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
              ...DEFAULT_ADVANCED_SETTINGS,
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
    this.version(22).stores({}).upgrade(async tx => {
      await tx.table('transcriptions').toCollection().modify(transcription => {
        if (typeof transcription.selectedUploadId === 'undefined') {
          transcription.selectedUploadId = null
        }
      })
    })
    this.version(23).stores({}).upgrade(async tx => {
      const projectsTable = tx.table('projects')
      const transcriptionsTable = tx.table('transcriptions')

      const projects = await projectsTable.toArray() as Project[]
      const newTranscriptions: Transcription[] = []
      const projectUpdates: { id: string; changes: Partial<Project> }[] = []

      for (const project of projects) {
        if (!project.defaultTranscriptionId) {
          const transcriptionId = crypto.randomUUID()
          const newTranscription = buildTranscriptionTemplate({
            id: transcriptionId,
            projectId: project.id,
          })
          newTranscriptions.push(newTranscription)
          projectUpdates.push({ id: project.id, changes: { defaultTranscriptionId: transcriptionId } })
        }
      }

      if (newTranscriptions.length > 0) {
        await transcriptionsTable.bulkAdd(newTranscriptions)
      }

      for (const update of projectUpdates) {
        await projectsTable.update(update.id, update.changes)
      }
    })
    this.version(24).stores({}).upgrade(async tx => {
      await tx.table('projects').toCollection().modify(project => {
        if (typeof project.isDefaultTranslationEnabled === 'undefined') {
          project.isDefaultTranslationEnabled = false
        }
        if (typeof project.isDefaultExtractionEnabled === 'undefined') {
          project.isDefaultExtractionEnabled = false
        }
        if (typeof project.isDefaultTranscriptionEnabled === 'undefined') {
          project.isDefaultTranscriptionEnabled = false
        }
      })
    })
    this.version(25).stores({}).upgrade(async tx => {
      await tx.table('projects').toCollection().modify(project => {
        if (typeof project.isArchived === 'undefined') {
          project.isArchived = false
        }
      })
    })
    this.version(26).stores({}).upgrade(async tx => {
      await tx.table('translations').toCollection().modify(translation => {
        if (typeof translation.autoContextMode === 'undefined') {
          translation.autoContextMode = 'disabled'
        }
        if (typeof translation.autoContextExtractionId === 'undefined') {
          translation.autoContextExtractionId = null
        }
        if (typeof translation.autoContextPreviousMode === 'undefined') {
          translation.autoContextPreviousMode = 'latest'
        }
        if (typeof translation.autoContextPreviousExtractionId === 'undefined') {
          translation.autoContextPreviousExtractionId = null
        }
      })
    })
    this.version(27).stores({}).upgrade(async tx => {
      const projects = await tx.table('projects').toArray() as Project[]
      const translations = await tx.table('translations').toArray() as Translation[]
      const projectIsBatchMap = new Map(projects.map(project => [project.id, !!project.isBatch]))
      const linkedOwnerMap = new Map<string, string>()

      translations.forEach(translation => {
        if (translation.autoContextExtractionId && !linkedOwnerMap.has(translation.autoContextExtractionId)) {
          linkedOwnerMap.set(translation.autoContextExtractionId, translation.id)
        }
      })

      await tx.table('extractions').toCollection().modify(extraction => {
        const contextResult = typeof extraction.contextResult === 'string' ? extraction.contextResult : ''
        const projectIsBatch = projectIsBatchMap.get(extraction.projectId) ?? false
        const linkedOwnerId = linkedOwnerMap.get(extraction.id)
        const looksAutoCreated = !!linkedOwnerId
          && typeof extraction.title === 'string'
          && extraction.title.startsWith(AUTO_CONTEXT_EXTRACTION_TITLE_PREFIX)
        const status = normalizeExtractionStatus(extraction.status, contextResult, projectIsBatch)
        const completedAt = extraction.completedAt instanceof Date
          ? extraction.completedAt
          : extraction.completedAt ? new Date(extraction.completedAt) : null

        extraction.contextResult = stripExtractionDoneTag(contextResult)
        extraction.status = status
        extraction.ownerTranslationId = typeof extraction.ownerTranslationId === 'string'
          ? extraction.ownerTranslationId
          : looksAutoCreated ? linkedOwnerId ?? null : null
        extraction.completedAt = status === 'completed' ? completedAt ?? new Date() : null
      })
    })
    this.version(28).stores({}).upgrade(async tx => {
      const projects = await tx.table('projects').toArray() as Project[]
      const translationsTable = tx.table('translations')
      const now = new Date()
      const templates: Translation[] = []
      const updatedProjects: Project[] = []

      for (const project of projects) {
        const id = crypto.randomUUID()
        templates.push(buildTranslationTemplate({
          id,
          projectId: project.id,
          basicSettingsId: project.defaultTranslationBasicSettingsId,
          advancedSettingsId: project.defaultTranslationAdvancedSettingsId,
          now,
        }))
        updatedProjects.push({ ...project, defaultTranslationId: id })
      }

      templates.push(buildTranslationTemplate({
        id: GLOBAL_TRANSLATION_SETTINGS_ID,
        projectId: 'global',
        basicSettingsId: LEGACY_GLOBAL_TRANSLATION_BASIC_SETTINGS_ID,
        advancedSettingsId: LEGACY_GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID,
        now,
      }))
      await tx.table('projects').bulkPut(updatedProjects)
      await translationsTable.bulkPut(templates)
    })
    this.version(29).stores({
      customInstructionOrders: 'id',
    })
    this.version(30).stores({}).upgrade(async tx => {
      await tx.table('projects').toCollection().modify(project => {
        project.lastBatchOperationMode = 'translation'
      })
    })
    this.version(31).stores({}).upgrade(async tx => {
      const projectsTable = tx.table('projects')
      const basicSettingsTable = tx.table('basicSettings')
      const advancedSettingsTable = tx.table('advancedSettings')
      const legacyProjects = await projectsTable.toArray() as LegacyProject[]
      const translations = await tx.table('translations').toArray() as Translation[]
      const extractions = await tx.table('extractions').toArray() as Extraction[]
      const orphaned = getOrphanedLegacySettingsIds({
        legacyProjects,
        projects: legacyProjects,
        translations,
        extractions,
      })

      await projectsTable.toCollection().modify((project: LegacyProject) => {
        delete project.defaultBasicSettingsId
        delete project.defaultAdvancedSettingsId
      })
      await basicSettingsTable.delete('global-basic-settings')
      await advancedSettingsTable.delete('global-advanced-settings')
      await basicSettingsTable.bulkDelete([...orphaned.basic])
      await advancedSettingsTable.bulkDelete([...orphaned.advanced])
    })
    this.version(32).stores({
      projects: 'id, name, createdAt, updatedAt, defaultTranslationSettingsId, defaultExtractionSettingsId',
      translations: 'id, projectId, settingsId, title, createdAt, updatedAt',
      extractions: 'id, projectId, settingsId, episodeNumber, createdAt, updatedAt',
      settings: 'id, createdAt, updatedAt',
      basicSettings: null,
      advancedSettings: null,
    }).upgrade(async tx => {
      const projectsTable = tx.table('projects')
      const translationsTable = tx.table('translations')
      const extractionsTable = tx.table('extractions')
      const basicSettingsTable = tx.table('basicSettings')
      const advancedSettingsTable = tx.table('advancedSettings')
      const settingsTable = tx.table('settings')

      const projects = await projectsTable.toArray() as LegacyProject[]
      const translations = await translationsTable.toArray() as Translation[]
      const extractions = await extractionsTable.toArray() as Extraction[]
      const basicSettings = await basicSettingsTable.toArray() as BasicSettings[]
      const advancedSettings = await advancedSettingsTable.toArray() as LegacyAdvancedSettings[]
      const basicById = new Map(basicSettings.map(settings => [settings.id, settings]))
      const advancedById = new Map(advancedSettings.map(settings => [settings.id, settings]))
      const pairToSettingsId = new Map<string, string>()
      const unifiedSettings: Settings[] = []

      const mergePair = (
        basicSettingsId: string,
        advancedSettingsId: string,
        feature: 'translation' | 'extraction',
      ) => {
        const basic = basicById.get(basicSettingsId)
        const advanced = advancedById.get(advancedSettingsId)
        const pairKey = JSON.stringify([
          basicSettingsId || null,
          advancedSettingsId || null,
          basic ? null : feature,
        ])
        const shouldReuse = Boolean(basicSettingsId || advancedSettingsId)
        const existingId = shouldReuse ? pairToSettingsId.get(pairKey) : undefined
        if (existingId) return existingId

        const id = basicSettingsId === LEGACY_GLOBAL_TRANSLATION_BASIC_SETTINGS_ID
          && advancedSettingsId === LEGACY_GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID
          ? GLOBAL_TRANSLATION_SETTINGS_ID
          : basicSettingsId === LEGACY_GLOBAL_EXTRACTION_BASIC_SETTINGS_ID
            && advancedSettingsId === LEGACY_GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID
            ? GLOBAL_EXTRACTION_SETTINGS_ID
            : crypto.randomUUID()
        const now = new Date()
        const basicDefaults = feature === 'extraction'
          ? DEFAULT_EXTRACTION_BASIC_SETTINGS
          : DEFAULT_BASIC_SETTINGS
        const createdAt = basic?.createdAt && advanced?.createdAt
          ? new Date(Math.min(basic.createdAt.getTime(), advanced.createdAt.getTime()))
          : basic?.createdAt ?? advanced?.createdAt ?? now
        const updatedAt = basic?.updatedAt && advanced?.updatedAt
          ? new Date(Math.max(basic.updatedAt.getTime(), advanced.updatedAt.getTime()))
          : basic?.updatedAt ?? advanced?.updatedAt ?? now

        unifiedSettings.push({
          ...basicDefaults,
          ...DEFAULT_ADVANCED_SETTINGS,
          ...basic,
          ...advanced,
          id,
          createdAt,
          updatedAt,
        })
        if (shouldReuse) pairToSettingsId.set(pairKey, id)
        return id
      }

      mergePair(
        LEGACY_GLOBAL_TRANSLATION_BASIC_SETTINGS_ID,
        LEGACY_GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID,
        'translation',
      )
      mergePair(
        LEGACY_GLOBAL_EXTRACTION_BASIC_SETTINGS_ID,
        LEGACY_GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID,
        'extraction',
      )

      const migratedTranslations = translations.map(translation => {
        const settingsId = mergePair(
          translation.basicSettingsId,
          translation.advancedSettingsId,
          'translation',
        )
        const { basicSettingsId, advancedSettingsId, ...rest } = translation
        void basicSettingsId
        void advancedSettingsId
        return { ...rest, settingsId } as CurrentTranslation
      })
      const migratedExtractions = extractions.map(extraction => {
        const settingsId = mergePair(
          extraction.basicSettingsId,
          extraction.advancedSettingsId,
          'extraction',
        )
        const { basicSettingsId, advancedSettingsId, ...rest } = extraction
        void basicSettingsId
        void advancedSettingsId
        return { ...rest, settingsId } as CurrentExtraction
      })
      const migratedProjects = projects.map(project => {
        const defaultTranslationSettingsId = mergePair(
          project.defaultTranslationBasicSettingsId,
          project.defaultTranslationAdvancedSettingsId,
          'translation',
        )
        const defaultExtractionSettingsId = mergePair(
          project.defaultExtractionBasicSettingsId,
          project.defaultExtractionAdvancedSettingsId,
          'extraction',
        )
        const {
          defaultTranslationBasicSettingsId,
          defaultTranslationAdvancedSettingsId,
          defaultExtractionBasicSettingsId,
          defaultExtractionAdvancedSettingsId,
          ...rest
        } = project
        void defaultTranslationBasicSettingsId
        void defaultTranslationAdvancedSettingsId
        void defaultExtractionBasicSettingsId
        void defaultExtractionAdvancedSettingsId
        return {
          ...rest,
          defaultTranslationSettingsId,
          defaultExtractionSettingsId,
        } as CurrentProject
      })

      await settingsTable.bulkPut(unifiedSettings)
      await translationsTable.bulkPut(migratedTranslations)
      await extractionsTable.bulkPut(migratedExtractions)
      await projectsTable.bulkPut(migratedProjects)
    })
    this.version(33).stores({}).upgrade(async tx => {
      await tx.table('settings').toCollection().modify((settings: Record<string, unknown>) => {
        const isMinimalContextMode = typeof settings.isBetterContextCaching === 'boolean'
          ? !settings.isBetterContextCaching
          : typeof settings.isMinimalContextMode === 'boolean'
            ? settings.isMinimalContextMode
            : DEFAULT_ADVANCED_SETTINGS.isMinimalContextMode
        settings.isMinimalContextMode = isMinimalContextMode
        delete settings.isBetterContextCaching
      })
    })
    this.version(34).stores({}).upgrade(async tx => {
      const projects = await tx.table('projects').toArray() as CurrentProject[]
      const settingsIds = [
        GLOBAL_TRANSCRIPTION_SETTINGS_ID,
        ...projects.map(project => project.defaultTranscriptionId),
      ]

      await tx.table('transcriptions').where('id').anyOf(settingsIds).modify((transcription: Transcription) => {
        if (transcription.selectedMode === 'sentence') {
          transcription.selectedMode = 'clause'
        }
      })
    })
    this.version(35).stores({}).upgrade(async tx => {
      await tx.table('projects').toCollection().modify((project: Record<string, unknown>) => {
        project.isBatchAutoContextEnabled = false
        project.batchAutoContextStartingExtractionId = null
      })
      await tx.table('extractions').toCollection().modify((extraction: Record<string, unknown>) => {
        delete extraction.ownerTranslationId
      })
    })
  }
}

export const db = new MyDatabase()
