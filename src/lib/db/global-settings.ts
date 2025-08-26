import { db } from './db'
import { BasicSettings, AdvancedSettings } from '@/types/project'
import { DEFAULT_ADVANCED_SETTINGS, DEFAULT_BASIC_SETTINGS } from '@/constants/default'
import { getBasicSettings, getAdvancedSettings } from './settings'
import { GLOBAL_ADVANCED_SETTINGS_ID, GLOBAL_BASIC_SETTINGS_ID } from '@/constants/global-settings'

export const upsertBasicSettingsWithId = async (
  id: string,
  settings: Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<BasicSettings> => {
  const now = new Date()
  const existing = await db.basicSettings.get(id)
  const record: BasicSettings = existing
    ? { ...existing, ...settings, id, updatedAt: now }
    : { ...settings, id, createdAt: now, updatedAt: now }
  await db.basicSettings.put(record)
  return record
}

export const upsertAdvancedSettingsWithId = async (
  id: string,
  settings: Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<AdvancedSettings> => {
  const now = new Date()
  const existing = await db.advancedSettings.get(id)
  const record: AdvancedSettings = existing
    ? { ...existing, ...settings, id, updatedAt: now }
    : { ...settings, id, createdAt: now, updatedAt: now }
  await db.advancedSettings.put(record)
  return record
}

export const getGlobalBasicSettings = async (): Promise<BasicSettings | undefined> => {
  return getBasicSettings(GLOBAL_BASIC_SETTINGS_ID)
}

export const getGlobalAdvancedSettings = async (): Promise<AdvancedSettings | undefined> => {
  return getAdvancedSettings(GLOBAL_ADVANCED_SETTINGS_ID)
}

export const getOrCreateGlobalBasicSettings = async (): Promise<BasicSettings> => {
  const existing = await getGlobalBasicSettings()
  if (existing) return existing
  return upsertBasicSettingsWithId(GLOBAL_BASIC_SETTINGS_ID, { ...DEFAULT_BASIC_SETTINGS })
}

export const getOrCreateGlobalAdvancedSettings = async (): Promise<AdvancedSettings> => {
  const existing = await getGlobalAdvancedSettings()
  if (existing) return existing
  return upsertAdvancedSettingsWithId(GLOBAL_ADVANCED_SETTINGS_ID, { ...DEFAULT_ADVANCED_SETTINGS })
}

export const ensureGlobalDefaultsExist = async (): Promise<void> => {
  await Promise.all([
    getOrCreateGlobalBasicSettings(),
    getOrCreateGlobalAdvancedSettings(),
  ])
}
