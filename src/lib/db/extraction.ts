import { BasicSettings, Extraction, AdvancedSettings } from "@/types/project"
import { db } from "./db"
import { DEFAULT_BASIC_SETTINGS } from "@/constants/default"
import { DEFAULT_ADVANCED_SETTINGS } from "@/constants/default"
import { createBasicSettings, createAdvancedSettings } from "./settings"

// Extraction CRUD functions
export const createExtraction = async (
  projectId: string,
  data: Pick<Extraction, "episodeNumber" | "subtitleContent" | "previousContext" | "contextResult">,
  basicSettingsData: Partial<Omit<BasicSettings, "id" | "createdAt" | "updatedAt">>,
  advancedSettingsData: Partial<Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt">>,
): Promise<Extraction> => {
  return db.transaction('rw', db.projects, db.extractions, db.basicSettings, db.advancedSettings, async () => {
    const id = crypto.randomUUID()

    const basicSettings = await createBasicSettings({
      ...DEFAULT_BASIC_SETTINGS,
      ...basicSettingsData,
    })
    const advancedSettings = await createAdvancedSettings({
      ...DEFAULT_ADVANCED_SETTINGS,
      ...advancedSettingsData,
    })

    const extraction: Extraction = {
      id,
      projectId,
      ...data,
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
  changes: Partial<Pick<Extraction, "episodeNumber" | "subtitleContent" | "previousContext">>
): Promise<Extraction> => {
  await db.extractions.update(extractionId, {
    ...changes,
    updatedAt: new Date()
  })

  const updated = await db.extractions.get(extractionId)
  if (!updated) throw new Error('Extraction not found')
  return updated
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
