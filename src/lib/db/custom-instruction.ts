import { CustomInstruction } from '@/types/custom-instruction'
import { db } from './db'

export const createCustomInstruction = async (data: Pick<CustomInstruction, 'name' | 'content'>): Promise<CustomInstruction> => {
  const newInstruction: CustomInstruction = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  await db.customInstructions.add(newInstruction)
  return newInstruction
}

export const getAllCustomInstructions = async (): Promise<CustomInstruction[]> => {
  return db.customInstructions.toArray()
}

export const getCustomInstruction = async (id: string): Promise<CustomInstruction | undefined> => {
  return db.customInstructions.get(id)
}

export const updateCustomInstruction = async (id: string, changes: Partial<Pick<CustomInstruction, 'name' | 'content'>>): Promise<CustomInstruction> => {
  await db.customInstructions.update(id, {
    ...changes,
    updatedAt: new Date()
  })
  const updated = await db.customInstructions.get(id)
  if (!updated) throw new Error('CustomInstruction not found')
  return updated
}

export const deleteCustomInstruction = async (id: string): Promise<void> => {
  await db.customInstructions.delete(id)
}