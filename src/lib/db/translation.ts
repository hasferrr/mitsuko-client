import { Translation } from "@/types/project"
import { db } from "./db"
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
  DEFAULT_TEMPERATURE,
  DEFAULT_SPLIT_SIZE,
  DEFAULT_MAX_COMPLETION_TOKENS,
} from "@/constants/default"
import { FREE_MODELS } from "@/constants/model"

// Translation CRUD
export const createTranslation = async (
  projectId: string,
  data: Pick<Translation, "title" | "subtitles" | "parsed">
): Promise<Translation> => {
  const models = Object.values(FREE_MODELS)[0]
  const firstModel = models && models.length > 0 ? models[0] : null

  return db.transaction('rw', db.projects, db.translations, async () => {
    const id = crypto.randomUUID()
    const translation: Translation = {
      id,
      projectId,
      ...data,
      // TODO: refactor this to use default values from constants
      basicSettings: {
        sourceLanguage: DEFAULT_SOURCE_LANGUAGE,
        targetLanguage: DEFAULT_TARGET_LANGUAGE,
        modelDetail: firstModel,
        isUseCustomModel: false,
        contextDocument: "",
      },
      advancedSettings: {
        temperature: DEFAULT_TEMPERATURE,
        startIndex: 1,
        endIndex: 100000,
        splitSize: DEFAULT_SPLIT_SIZE,
        maxCompletionTokens: DEFAULT_MAX_COMPLETION_TOKENS,
        isUseStructuredOutput: true,
        isUseFullContextMemory: false,
        isBetterContextCaching: true,
        isMaxCompletionTokensAuto: true,
      },
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

export const getTranslation = async (projectId: string, translationId: string): Promise<Translation | undefined> => {
  return db.translations
    .where('id').equals(translationId)
    .and(t => t.projectId === projectId)
    .first()
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
  return db.transaction('rw', db.projects, db.translations, async () => {
    await db.translations.delete(translationId)
    await db.projects.update(projectId, project => {
      if (!project) return
      project.translations = project.translations.filter(tId => tId !== translationId)
      project.updatedAt = new Date()
    })
  })
}
