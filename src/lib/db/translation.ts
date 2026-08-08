import { Settings, Translation } from "@/types/project"
import { db } from "@/lib/db/db"
import {
  DEFAULT_SETTINGS,
  DEFAULT_TRANSLATION_SETTINGS,
} from "@/constants/default"
import { createSettings } from "@/lib/db/settings"
import { deleteSettingsIfUnreferenced } from "@/lib/db/settings-references"

type SettingsData = Omit<Settings, "id" | "createdAt" | "updatedAt">

export interface BatchAutoContextLinkUpdates {
  translations: Array<{
    id: string
    changes: Pick<
      Translation,
      | "autoContextMode"
      | "autoContextExtractionId"
      | "autoContextPreviousMode"
      | "autoContextPreviousExtractionId"
    >
  }>
}

export interface BatchAutoContextLinkUpdateResult {
  translations: Translation[]
}

export const createTranslation = async (
  projectId: string,
  data: Pick<Translation, "title" | "subtitles" | "parsed"> & Partial<Pick<Translation, "response" | "autoContextMode" | "autoContextExtractionId" | "autoContextPreviousMode" | "autoContextPreviousExtractionId">>,
  settingsData: Partial<SettingsData> = {},
): Promise<Translation> => {
  return db.transaction('rw', db.projects, db.translations, db.settings, async () => {
    const id = crypto.randomUUID()
    const settings = await createSettings({
      ...DEFAULT_SETTINGS,
      ...settingsData,
    })

    const translation: Translation = {
      id,
      projectId,
      ...data,
      settingsId: settings.id,
      autoContextMode: data.autoContextMode ?? DEFAULT_TRANSLATION_SETTINGS.autoContextMode,
      autoContextExtractionId: data.autoContextExtractionId ?? DEFAULT_TRANSLATION_SETTINGS.autoContextExtractionId,
      autoContextPreviousMode: data.autoContextPreviousMode ?? DEFAULT_TRANSLATION_SETTINGS.autoContextPreviousMode,
      autoContextPreviousExtractionId: data.autoContextPreviousExtractionId ?? DEFAULT_TRANSLATION_SETTINGS.autoContextPreviousExtractionId,
      response: data.response ?? {
        ...DEFAULT_TRANSLATION_SETTINGS.response,
        jsonResponse: [...DEFAULT_TRANSLATION_SETTINGS.response.jsonResponse],
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

export const getTranslations = async (translationIds: string[]): Promise<Translation[]> => {
  const items = await db.translations.bulkGet(translationIds)
  return items.filter((t): t is Translation => t !== undefined)
}

export const updateTranslation = async (
  translationId: string,
  changes: Partial<Translation>
): Promise<Translation> => {
  await db.translations.update(translationId, {
    ...changes,
    updatedAt: new Date()
  })

  const updated = await db.translations.get(translationId)
  if (!updated) throw new Error('Translation not found')
  return updated
}

export const updateBatchAutoContextLinks = async ({
  translations,
}: BatchAutoContextLinkUpdates): Promise<BatchAutoContextLinkUpdateResult> => {
  return db.transaction('rw', db.translations, async () => {
    const updatedAt = new Date()

    for (const translation of translations) {
      const updated = await db.translations.update(translation.id, {
        ...translation.changes,
        updatedAt,
      })
      if (!updated) throw new Error(`Translation ${translation.id} was not found`)
    }

    const updatedTranslations = await db.translations.bulkGet(
      translations.map(translation => translation.id),
    )

    return {
      translations: updatedTranslations.filter((translation): translation is Translation => !!translation),
    }
  })
}

export const moveTranslation = async (
  sourceProjectId: string,
  targetProjectId: string,
  translationId: string,
): Promise<Translation> => {
  return db.transaction('rw', db.projects, db.translations, async () => {
    const updatedAt = new Date()

    await db.translations.update(translationId, {
      projectId: targetProjectId,
      autoContextMode: 'disabled',
      autoContextExtractionId: null,
      autoContextPreviousMode: 'none',
      autoContextPreviousExtractionId: null,
      updatedAt,
    })

    await db.projects.update(sourceProjectId, project => {
      if (!project) return
      project.translations = project.translations.filter(id => id !== translationId)
      project.updatedAt = updatedAt
    })

    await db.projects.update(targetProjectId, project => {
      if (!project) return
      if (!project.translations.includes(translationId)) project.translations.push(translationId)
      project.updatedAt = updatedAt
    })

    const updated = await db.translations.get(translationId)
    if (!updated) throw new Error('Translation not found')
    return updated
  })
}

export const deleteTranslation = async (projectId: string, translationId: string): Promise<void> => {
  return db.transaction('rw', db.projects, db.translations, db.extractions, db.settings, async () => {
    const translation = await db.translations.get(translationId)
    if (!translation) return
    const updatedAt = new Date()

    await db.translations.delete(translationId)
    await db.projects.update(projectId, project => {
      if (!project) return
      project.translations = project.translations.filter(tId => tId !== translationId)
      project.updatedAt = updatedAt
    })
    await deleteSettingsIfUnreferenced([translation.settingsId])
  })
}
