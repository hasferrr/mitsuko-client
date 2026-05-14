import { BasicSettings, Extraction, AdvancedSettings } from "@/types/project"
import { db } from "./db"
import { DEFAULT_EXTRACTION_BASIC_SETTINGS, DEFAULT_ADVANCED_SETTINGS } from "@/constants/default"
import { createBasicSettings, createAdvancedSettings } from "./settings"
import { inferLegacyExtractionStatus, stripExtractionDoneTag } from "@/lib/extraction/status"

export type ExtractionCreateInput = Pick<Extraction, "title" | "episodeNumber" | "subtitleContent" | "previousContext" | "contextResult">
  & Partial<Pick<Extraction, "status" | "origin" | "ownerTranslationId" | "completedAt">>

// Extraction CRUD functions
export const createExtraction = async (
  projectId: string,
  data: ExtractionCreateInput,
  basicSettingsData: Partial<Omit<BasicSettings, "id" | "createdAt" | "updatedAt">>,
  advancedSettingsData: Partial<Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt">>,
): Promise<Extraction> => {
  return db.transaction('rw', db.projects, db.extractions, db.basicSettings, db.advancedSettings, async () => {
    const id = crypto.randomUUID()

    const basicSettings = await createBasicSettings({
      ...DEFAULT_EXTRACTION_BASIC_SETTINGS,
      ...basicSettingsData,
    })
    const advancedSettings = await createAdvancedSettings({
      ...DEFAULT_ADVANCED_SETTINGS,
      ...advancedSettingsData,
    })

    const contextResult = stripExtractionDoneTag(data.contextResult)
    const status = data.status ?? inferLegacyExtractionStatus(data.contextResult, data.origin === "batch")
    const extraction: Extraction = {
      id,
      projectId,
      ...data,
      contextResult,
      status,
      origin: data.origin ?? "manual",
      ownerTranslationId: data.ownerTranslationId ?? null,
      completedAt: data.completedAt ?? (status === "completed" ? new Date() : null),
      basicSettingsId: basicSettings.id,
      advancedSettingsId: advancedSettings.id,
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
  return db.transaction('rw', db.projects, db.extractions, db.basicSettings, db.advancedSettings, async () => {
    const extraction = await db.extractions.get(extractionId)
    if (!extraction) return

    await db.basicSettings.delete(extraction.basicSettingsId)
    await db.advancedSettings.delete(extraction.advancedSettingsId)
    await db.extractions.delete(extractionId)

    await db.projects.update(projectId, project => {
      if (!project) return
      project.extractions = project.extractions.filter(id => id !== extractionId)
      project.updatedAt = new Date()
    })
  })
}
