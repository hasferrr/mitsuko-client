import { Project } from "@/types/project"
import { db } from "@/lib/db/db"
import { createSettings } from "@/lib/db/settings"
import { getOrCreateGlobalExtractionSettings, getOrCreateGlobalTranscriptionSettings, getOrCreateGlobalTranslationSettings, getOrCreateGlobalTranslationSettingsRecord } from "@/lib/db/global-settings"
import { normalizeAutoContextDefault } from "@/lib/translation/auto-context-defaults"
import { buildTranslationTemplate } from "@/lib/translation/template"
import { buildTranscriptionTemplate } from "@/lib/transcription/template"
import { deleteSettingsIfUnreferenced } from "@/lib/db/settings-references"

const stripMeta = <T extends { id: string; createdAt: Date; updatedAt: Date }>(obj: T) => {
  const { id, createdAt, updatedAt, ...rest } = obj
  void id; void createdAt; void updatedAt
  return rest as Omit<T, 'id' | 'createdAt' | 'updatedAt'>
}

// Project CRUD functions
export const createProject = async (name: string, isBatch = false, isAutoEnableProjectSettings = false): Promise<Project> => {
  return db.transaction('rw', [db.projects, db.projectOrders, db.settings, db.transcriptions, db.translations], async () => {
    const id = crypto.randomUUID()

    // Batch projects always have default settings enabled
    const enableFlags = isBatch ? true : isAutoEnableProjectSettings

    const globalTranslationSettings = await getOrCreateGlobalTranslationSettingsRecord()
    const translationSettings = await createSettings(stripMeta(globalTranslationSettings))

    const globalExtractionSettings = await getOrCreateGlobalExtractionSettings()
    const extractionSettings = await createSettings(stripMeta(globalExtractionSettings))

    // Create default transcription for batch settings
    const globalTranscriptionSettings = await getOrCreateGlobalTranscriptionSettings()
    const defaultTranscriptionId = crypto.randomUUID()
    const defaultTranscription = buildTranscriptionTemplate({
      id: defaultTranscriptionId,
      projectId: id,
      settings: {
        models: globalTranscriptionSettings.models,
        language: globalTranscriptionSettings.language,
        selectedMode: globalTranscriptionSettings.selectedMode,
        customInstructions: globalTranscriptionSettings.customInstructions,
        selectedUploadId: globalTranscriptionSettings.selectedUploadId,
      },
    })
    await db.transcriptions.add(defaultTranscription)

    const globalTranslationTemplate = await getOrCreateGlobalTranslationSettings()
    const defaultTranslationId = crypto.randomUUID()
    const defaultTranslation = buildTranslationTemplate({
      id: defaultTranslationId,
      projectId: id,
      settingsId: translationSettings.id,
      autoContextMode: isBatch ? 'disabled' : normalizeAutoContextDefault(globalTranslationTemplate.autoContextMode),
    })
    await db.translations.add(defaultTranslation)

    const project: Project = {
      id,
      name,
      translations: [],
      transcriptions: [],
      extractions: [],
      defaultTranslationSettingsId: translationSettings.id,
      defaultTranslationId,
      defaultExtractionSettingsId: extractionSettings.id,
      defaultTranscriptionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isBatch,
      lastBatchOperationMode: 'translation',
      isDefaultTranslationEnabled: enableFlags,
      isDefaultExtractionEnabled: enableFlags,
      isDefaultTranscriptionEnabled: enableFlags,
      isBatchAutoContextEnabled: false,
      batchAutoContextStartingExtractionId: null,
      isArchived: false,
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
  return db.transaction('rw', [db.projects, db.translations, db.transcriptions, db.extractions, db.projectOrders, db.settings], async () => {
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

    const settingsIds = [
      ...translations.filter(t => t).map(t => t!.settingsId),
      ...extractions.filter(e => e).map(e => e!.settingsId),
      project.defaultTranslationSettingsId,
      project.defaultExtractionSettingsId,
    ]

    // Collect transcription IDs to delete (includes defaultTranscriptionId)
    const transcriptionIds = [...project.transcriptions]
    if (project.defaultTranscriptionId) {
      transcriptionIds.push(project.defaultTranscriptionId)
    }

    // Delete all related entities in single operations
    await Promise.all([
      db.translations.bulkDelete([...project.translations, project.defaultTranslationId].filter(Boolean)),
      db.transcriptions.bulkDelete(transcriptionIds),
      db.extractions.bulkDelete(project.extractions),
      filterOrders(),
    ])

    await db.projects.delete(id)
    await deleteSettingsIfUnreferenced(settingsIds)
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
