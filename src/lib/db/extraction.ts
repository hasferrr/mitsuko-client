import { Extraction, Settings } from "@/types/project"
import { db } from "@/lib/db/db"
import { DEFAULT_EXTRACTION_SETTINGS } from "@/constants/default"
import { createSettings } from "@/lib/db/settings"
import { inferLegacyExtractionStatus, stripExtractionDoneTag } from "@/lib/extraction/status"
import { deleteSettingsIfUnreferenced } from "@/lib/db/settings-references"

export type ExtractionCreateInput = Pick<Extraction, "title" | "episodeNumber" | "subtitleContent" | "previousContext" | "contextResult">
  & Partial<Pick<Extraction, "status" | "completedAt">>

type SettingsData = Omit<Settings, "id" | "createdAt" | "updatedAt">

export const createExtraction = async (
  projectId: string,
  data: ExtractionCreateInput,
  settingsData: Partial<SettingsData> = {},
): Promise<Extraction> => {
  return db.transaction('rw', db.projects, db.extractions, db.settings, async () => {
    const id = crypto.randomUUID()
    const settings = await createSettings({
      ...DEFAULT_EXTRACTION_SETTINGS,
      ...settingsData,
    })

    const contextResult = stripExtractionDoneTag(data.contextResult)
    const status = data.status ?? inferLegacyExtractionStatus(data.contextResult)
    const extraction: Extraction = {
      id,
      projectId,
      ...data,
      contextResult,
      status,
      completedAt: data.completedAt ?? (status === "completed" ? new Date() : null),
      settingsId: settings.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.extractions.add(extraction)
    await db.projects.update(projectId, project => {
      if (!project) return
      project.extractions.push(id)
      project.updatedAt = new Date()
    })

    return extraction
  })
}

export const getExtraction = async (extractionId: string): Promise<Extraction | undefined> => {
  return db.extractions.get(extractionId)
}

export const getExtractions = async (extractionIds: string[]): Promise<Extraction[]> => {
  const items = await db.extractions.bulkGet(extractionIds)
  return items.filter((e): e is Extraction => e !== undefined)
}

export const updateExtraction = async (
  extractionId: string,
  changes: Partial<Extraction>
): Promise<Extraction> => {
  await db.extractions.update(extractionId, {
    ...changes,
    updatedAt: new Date()
  })

  const updated = await db.extractions.get(extractionId)
  if (!updated) throw new Error('Extraction not found')
  return updated
}

export const moveExtraction = async (
  sourceProjectId: string,
  targetProjectId: string,
  extractionId: string,
): Promise<void> => {
  return db.transaction('rw', db.projects, db.extractions, async () => {
    await db.extractions.update(extractionId, { projectId: targetProjectId, updatedAt: new Date() })

    await db.projects.update(sourceProjectId, project => {
      if (!project) return
      project.extractions = project.extractions.filter(id => id !== extractionId)
      project.updatedAt = new Date()
    })

    await db.projects.update(targetProjectId, project => {
      if (!project) return
      project.extractions.push(extractionId)
      project.updatedAt = new Date()
    })
  })
}

export const deleteExtraction = async (projectId: string, extractionId: string): Promise<void> => {
  return db.transaction('rw', db.projects, db.translations, db.extractions, db.settings, async () => {
    const extraction = await db.extractions.get(extractionId)
    if (!extraction) return

    await db.extractions.delete(extractionId)
    await db.projects.update(projectId, project => {
      if (!project) return
      project.extractions = project.extractions.filter(id => id !== extractionId)
      project.updatedAt = new Date()
    })
    await deleteSettingsIfUnreferenced([extraction.settingsId])
  })
}
