import { Translation } from "@/types/project"
import { db } from "./db"

// Translation CRUD
export const createTranslation = async (
  projectId: string,
  data: Pick<Translation, "title" | "subtitles" | "parsed">
): Promise<Translation> => {
  return db.transaction('rw', db.projects, db.translations, async () => {
    const id = crypto.randomUUID()
    const translation: Translation = {
      id,
      projectId,
      ...data,
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
