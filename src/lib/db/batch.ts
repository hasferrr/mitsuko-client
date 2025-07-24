import { Batch } from "@/types/project"
import { db } from "./db"

export const getAllBatches = async () => {
  return await db.batches.toArray()
}

export const createBatch = async (name: string) => {
  const newBatch: Batch = {
    id: crypto.randomUUID(),
    name,
    translations: [],
    defaultBasicSettingsId: crypto.randomUUID(),
    defaultAdvancedSettingsId: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  await db.batches.add(newBatch)
  return newBatch
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
  await db.batches.delete(id)
}
