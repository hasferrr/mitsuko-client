import { Batch } from "@/types/project"
import { db } from "./db"
import { createBasicSettings, createAdvancedSettings } from "./settings"
import { DEFAULT_BASIC_SETTINGS, DEFAULT_ADVANCED_SETTINGS } from "@/constants/default"

export const getAllBatches = async () => {
  return await db.batches.toArray()
}

export const createBatch = async (name: string) => {
  return db.transaction('rw', [db.batches, db.basicSettings, db.advancedSettings], async () => {
    // Create the basic and advanced settings
    const basicSettings = await createBasicSettings(DEFAULT_BASIC_SETTINGS)
    const advancedSettings = await createAdvancedSettings(DEFAULT_ADVANCED_SETTINGS)

    const newBatch: Batch = {
      id: crypto.randomUUID(),
      name,
      translations: [],
      defaultBasicSettingsId: basicSettings.id,
      defaultAdvancedSettingsId: advancedSettings.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.batches.add(newBatch)
    return newBatch
  })
}

export const renameBatch = async (id: string, { name }: { name: string }) => {
  await db.batches.update(id, { name, updatedAt: new Date() })
  const updatedBatch = await db.batches.get(id)
  return updatedBatch as Batch
}

export const updateBatch = async (id: string, update: Partial<Omit<Batch, "id" | "createdAt" | "updatedAt">>) => {
  await db.batches.update(id, { ...update, updatedAt: new Date() })
  const updatedBatch = await db.batches.get(id)
  return updatedBatch as Batch
}

export const updateBatchItems = async (id: string, items: string[]) => {
  await db.batches.update(id, { translations: items, updatedAt: new Date() })
  const updatedBatch = await db.batches.get(id)
  return updatedBatch as Batch
}

export const deleteBatch = async (id: string) => {
  const batch = await db.batches.get(id)
  if (!batch) return

  return db.transaction('rw', [db.batches, db.basicSettings, db.advancedSettings], async () => {
    // Delete associated settings
    await db.basicSettings.delete(batch.defaultBasicSettingsId)
    await db.advancedSettings.delete(batch.defaultAdvancedSettingsId)

    // Delete the batch
    await db.batches.delete(id)
  })
}
