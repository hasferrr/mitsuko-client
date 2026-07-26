import { db } from './db'
import { Settings } from '@/types/project'

type SettingsData = Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>

export const createSettings = async (settings: SettingsData): Promise<Settings> => {
  const now = new Date()
  const newSettings: Settings = {
    ...settings,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  await db.settings.add(newSettings)
  return newSettings
}

export const updateSettings = async (
  id: string,
  settings: Partial<SettingsData>,
): Promise<Settings | undefined> => {
  await db.settings.update(id, {
    ...settings,
    updatedAt: new Date(),
  })
  return db.settings.get(id)
}

export const getSettings = async (id: string): Promise<Settings | undefined> => {
  return db.settings.get(id)
}

export const getAllSettings = async (): Promise<Settings[]> => {
  return db.settings.toArray()
}
