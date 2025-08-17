import { db } from './db'
import { BasicSettings, AdvancedSettings } from '@/types/project'

export const createBasicSettings = async (settings: Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<BasicSettings> => {
  const now = new Date()
  const newSettings: BasicSettings = {
    ...settings,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  await db.basicSettings.add(newSettings)
  return newSettings
}

export const updateBasicSettings = async (id: string, settings: Partial<Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BasicSettings | undefined> => {
  const now = new Date()
  const updatedSettings: Partial<BasicSettings> = {
    ...settings,
    updatedAt: now,
  }
  await db.basicSettings.update(id, updatedSettings)
  return db.basicSettings.get(id)
}

export const getBasicSettings = async (id: string): Promise<BasicSettings | undefined> => {
  return db.basicSettings.get(id)
}

export const createAdvancedSettings = async (settings: Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdvancedSettings> => {
  const now = new Date()
  const newSettings: AdvancedSettings = {
    ...settings,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  await db.advancedSettings.add(newSettings)
  return newSettings
}

export const updateAdvancedSettings = async (id: string, settings: Partial<Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AdvancedSettings | undefined> => {
  const now = new Date()
  const updatedSettings: Partial<AdvancedSettings> = {
    ...settings,
    updatedAt: now,
  }
  await db.advancedSettings.update(id, updatedSettings)
  return db.advancedSettings.get(id)
}

export const getAdvancedSettings = async (id: string): Promise<AdvancedSettings | undefined> => {
  return db.advancedSettings.get(id)
}

export const getAllBasicSettings = async (): Promise<BasicSettings[]> => {
  return db.basicSettings.toArray()
}

export const getAllAdvancedSettings = async (): Promise<AdvancedSettings[]> => {
  return db.advancedSettings.toArray()
}