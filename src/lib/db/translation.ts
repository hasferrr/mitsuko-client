import { AdvancedSettings, BasicSettings, Translation } from "@/types/project"
import { db } from "./db"
import {
  DEFAULT_BASIC_SETTINGS,
  DEFAULT_ADVANCED_SETTINGS,
} from "@/constants/default"
import { createBasicSettings, createAdvancedSettings } from "./settings"

// Translation CRUD
export const createTranslation = async (
  projectId: string,
  data: Pick<Translation, "title" | "subtitles" | "parsed">,
  basicSettingsData: Partial<Omit<BasicSettings, "id" | "createdAt" | "updatedAt">>,
  advancedSettingsData: Partial<Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt">>,
): Promise<Translation> => {
  return db.transaction('rw', db.projects, db.translations, db.basicSettings, db.advancedSettings, async () => {
    const id = crypto.randomUUID()

    const basicSettings = await createBasicSettings({
      ...DEFAULT_BASIC_SETTINGS,
      ...basicSettingsData,
    })
    const advancedSettings = await createAdvancedSettings({
      ...DEFAULT_ADVANCED_SETTINGS,
      ...advancedSettingsData,
    })

    const translation: Translation = {
      id,
      projectId,
      ...data,
      basicSettingsId: basicSettings.id,
      advancedSettingsId: advancedSettings.id,
      response: {
        response: "",
        jsonResponse: [],
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.translations.add(translation)
    await db.projects.update(projectId, project => {
      if (!project) return
      project.translations.push(id)
      project.updatedAt = new Date()
    })

    return translation
  })
}

export const getTranslation = async (translationId: string): Promise<Translation | undefined> => {
  return db.translations.get(translationId)
}

export const updateTranslation = async (
  translationId: string,
  changes: Partial<Pick<Translation, "title" | "subtitles" | "parsed">>
): Promise<Translation> => {
  await db.translations.update(translationId, {
    ...changes,
    updatedAt: new Date()
  })

  const updated = await db.translations.get(translationId)
  if (!updated) throw new Error('Translation not found')
  return updated
}

export const deleteTranslation = async (projectId: string, translationId: string): Promise<void> => {
  return db.transaction('rw', db.projects, db.translations, db.basicSettings, db.advancedSettings, async () => {
    const translation = await db.translations.get(translationId)
    if (!translation) return

    await db.basicSettings.delete(translation.basicSettingsId)
    await db.advancedSettings.delete(translation.advancedSettingsId)
    await db.translations.delete(translationId)

    await db.projects.update(projectId, project => {
      if (!project) return
      project.translations = project.translations.filter(tId => tId !== translationId)
      project.updatedAt = new Date()
    })
  })
}
