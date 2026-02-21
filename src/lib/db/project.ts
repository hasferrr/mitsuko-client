import { Project, Transcription } from "@/types/project"
import { db } from "./db"
import { createBasicSettings, createAdvancedSettings } from "./settings"
import { getOrCreateGlobalBasicSettings, getOrCreateGlobalAdvancedSettings } from "./global-settings"
import { DEFAULT_TRANSCTIPTION_SETTINGS } from "@/constants/default"

const stripMeta = <T extends { id: string; createdAt: Date; updatedAt: Date }>(obj: T) => {
  const { id, createdAt, updatedAt, ...rest } = obj
  void id; void createdAt; void updatedAt
  return rest as Omit<T, 'id' | 'createdAt' | 'updatedAt'>
}

// Project CRUD functions
export const createProject = async (name: string, isBatch = false): Promise<Project> => {
  return db.transaction('rw', [db.projects, db.projectOrders, db.basicSettings, db.advancedSettings, db.transcriptions], async () => {
    const id = crypto.randomUUID()

    const globalBasic = await getOrCreateGlobalBasicSettings()
    const basicTemplate = stripMeta(globalBasic)
    const basicSettings = await createBasicSettings(basicTemplate)
    const translationBasicSettings = await createBasicSettings(stripMeta(basicSettings))
    const extractionBasicSettings = await createBasicSettings(stripMeta(basicSettings))

    const globalAdvanced = await getOrCreateGlobalAdvancedSettings()
    const advancedTemplate = stripMeta(globalAdvanced)
    const advancedSettings = await createAdvancedSettings(advancedTemplate)
    const translationAdvancedSettings = await createAdvancedSettings(stripMeta(advancedSettings))
    const extractionAdvancedSettings = await createAdvancedSettings(stripMeta(advancedSettings))

    // Create default transcription for batch settings
    const defaultTranscriptionId = crypto.randomUUID()
    const defaultTranscription: Transcription = {
      id: defaultTranscriptionId,
      projectId: id,
      title: '',
      ...DEFAULT_TRANSCTIPTION_SETTINGS,
      transcriptionText: '',
      transcriptSubtitles: [],
      words: [],
      segments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.transcriptions.add(defaultTranscription)

    const project: Project = {
      id,
      name,
      translations: [],
      transcriptions: [],
      extractions: [],
      defaultBasicSettingsId: basicSettings.id,
      defaultAdvancedSettingsId: advancedSettings.id,
      defaultTranslationBasicSettingsId: translationBasicSettings.id,
      defaultTranslationAdvancedSettingsId: translationAdvancedSettings.id,
      defaultExtractionBasicSettingsId: extractionBasicSettings.id,
      defaultExtractionAdvancedSettingsId: extractionAdvancedSettings.id,
      defaultTranscriptionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isBatch,
    }

    await db.projects.add(project)

    // Handle project order
    const order = await db.projectOrders.get('main')
    if (!order) {
      await db.projectOrders.add({
        id: 'main',
        order: [id],
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } else {
      await db.projectOrders.update('main', order => {
        if (order) {
          order.order.unshift(id)
          order.updatedAt = new Date()
        }
      })
    }

    return project
  })
}

export const getProject = async (id: string): Promise<Project | undefined> => {
  return await db.projects.get(id)
}

export const getAllProjects = async (): Promise<Project[]> => {
  const order = await db.projectOrders.get('main')
  if (order?.order.length) {
    const projects = await db.projects.bulkGet(order.order)
    return projects.filter((p): p is Project => !!p)
  }
  return db.projects
    .orderBy('createdAt')
    .reverse()
    .toArray()
}

export const renameProject = async (id: string, update: Pick<Project, "name">): Promise<Project> => {
  const changes = {
    name: update.name,
    updatedAt: new Date()
  }

  await db.projects.update(id, changes)
  return (await db.projects.get(id)) as Project
}

export const updateProject = async (id: string, update: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>): Promise<Project> => {
  const changes = {
    ...update,
    updatedAt: new Date()
  }

  await db.projects.update(id, changes)
  return (await db.projects.get(id)) as Project
}

export const updateProjectItems = async (id: string, items: string[], type: 'translations' | 'transcriptions' | 'extractions'): Promise<Project | null> => {
  const project = await db.projects.get(id)
  if (!project) return null

  await db.projects.update(id, (projectToUpdate) => {
    projectToUpdate[type] = items
    projectToUpdate.updatedAt = new Date()
  })
  return (await db.projects.get(id)) as Project
}

export const deleteProject = async (id: string): Promise<void> => {
  return db.transaction('rw', [db.projects, db.translations, db.transcriptions, db.extractions, db.projectOrders, db.basicSettings, db.advancedSettings], async () => {
    const project = await db.projects.get(id)
    if (!project) return

    const projectOrders = await db.projectOrders.get('main')
    const filterOrders = async () => {
      if (!projectOrders) return
      await db.projectOrders.update('main', order => {
        if (order) {
          order.order = projectOrders.order.filter((orderId) => orderId !== id)
          order.updatedAt = new Date()
        }
      })
    }

    // Get all translations and extractions to access their settings IDs
    const translations = await db.translations.bulkGet(project.translations)
    const extractions = await db.extractions.bulkGet(project.extractions)

    // Collect all settings IDs to delete
    const basicSettingsIds = [
      ...translations.filter(t => t).map(t => t!.basicSettingsId),
      ...extractions.filter(e => e).map(e => e!.basicSettingsId)
    ]
    if (project.defaultBasicSettingsId) {
      basicSettingsIds.push(project.defaultBasicSettingsId)
    }
    const advancedSettingsIds = [
      ...translations.filter(t => t).map(t => t!.advancedSettingsId),
      ...extractions.filter(e => e).map(e => e!.advancedSettingsId)
    ]
    if (project.defaultAdvancedSettingsId) {
      advancedSettingsIds.push(project.defaultAdvancedSettingsId)
    }
    if (project.defaultTranslationBasicSettingsId) {
      basicSettingsIds.push(project.defaultTranslationBasicSettingsId)
    }
    if (project.defaultTranslationAdvancedSettingsId) {
      advancedSettingsIds.push(project.defaultTranslationAdvancedSettingsId)
    }
    if (project.defaultExtractionBasicSettingsId) {
      basicSettingsIds.push(project.defaultExtractionBasicSettingsId)
    }
    if (project.defaultExtractionAdvancedSettingsId) {
      advancedSettingsIds.push(project.defaultExtractionAdvancedSettingsId)
    }

    // Collect transcription IDs to delete (includes defaultTranscriptionId)
    const transcriptionIds = [...project.transcriptions]
    if (project.defaultTranscriptionId) {
      transcriptionIds.push(project.defaultTranscriptionId)
    }

    // Delete all related entities in single operations
    await Promise.all([
      db.translations.bulkDelete(project.translations),
      db.transcriptions.bulkDelete(transcriptionIds),
      db.extractions.bulkDelete(project.extractions),
      db.basicSettings.bulkDelete(basicSettingsIds),
      db.advancedSettings.bulkDelete(advancedSettingsIds),
      filterOrders(),
    ])

    await db.projects.delete(id)
  })
}

export const updateProjectOrder = async (newOrder: string[]): Promise<void> => {
  await db.projectOrders.update('main', order => {
    if (order) {
      order.order = newOrder
      order.updatedAt = new Date()
    }
  })
}
