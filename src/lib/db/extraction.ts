import { Extraction } from "@/types/project"
import { db } from "./db"

// Extraction CRUD functions
export const createExtraction = async (
  projectId: string,
  data: Pick<Extraction, "episodeNumber" | "subtitleContent" | "previousContext">
): Promise<Extraction> => {
  return db.transaction('rw', db.projects, db.extractions, async () => {
    const id = crypto.randomUUID()
    const extraction: Extraction = {
      id,
      projectId,
      ...data,
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

export const getExtraction = async (projectId: string, extractionId: string): Promise<Extraction | undefined> => {
  return db.extractions
    .where('id').equals(extractionId)
    .and(e => e.projectId === projectId)
    .first()
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
  return db.transaction('rw', db.projects, db.extractions, async () => {
    await db.extractions.delete(extractionId)

    await db.projects.update(projectId, project => {
      if (!project) return
      project.extractions = project.extractions.filter(id => id !== extractionId)
      project.updatedAt = new Date()
    })
  })
}
