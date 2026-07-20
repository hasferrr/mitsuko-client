import { db } from './db'
import { BasicSettings, AdvancedSettings, Transcription, Translation } from '@/types/project'
import { DEFAULT_ADVANCED_SETTINGS, DEFAULT_BASIC_SETTINGS, DEFAULT_EXTRACTION_BASIC_SETTINGS } from '@/constants/default'
import { getBasicSettings, getAdvancedSettings } from './settings'
import { GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID, GLOBAL_EXTRACTION_BASIC_SETTINGS_ID, GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID, GLOBAL_TRANSLATION_BASIC_SETTINGS_ID, GLOBAL_TRANSLATION_SETTINGS_ID, GLOBAL_TRANSCRIPTION_SETTINGS_ID } from '@/constants/global-settings'
import { buildTranslationTemplate } from '@/lib/translation/template'
import { buildTranscriptionTemplate } from '@/lib/transcription/template'

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

export const getOrCreateGlobalTranslationBasicSettings = async (): Promise<BasicSettings> => {
  const existing = await getBasicSettings(GLOBAL_TRANSLATION_BASIC_SETTINGS_ID)
  if (existing) return existing

  return upsertBasicSettingsWithId(GLOBAL_TRANSLATION_BASIC_SETTINGS_ID, { ...DEFAULT_BASIC_SETTINGS })
}

export const getOrCreateGlobalTranslationAdvancedSettings = async (): Promise<AdvancedSettings> => {
  const existing = await getAdvancedSettings(GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID)
  if (existing) return existing

  return upsertAdvancedSettingsWithId(GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID, { ...DEFAULT_ADVANCED_SETTINGS })
}

export const getOrCreateGlobalExtractionBasicSettings = async (): Promise<BasicSettings> => {
  const existing = await getBasicSettings(GLOBAL_EXTRACTION_BASIC_SETTINGS_ID)
  if (existing) return existing
  return upsertBasicSettingsWithId(GLOBAL_EXTRACTION_BASIC_SETTINGS_ID, { ...DEFAULT_EXTRACTION_BASIC_SETTINGS })
}

export const getOrCreateGlobalExtractionAdvancedSettings = async (): Promise<AdvancedSettings> => {
  const existing = await getAdvancedSettings(GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID)
  if (existing) return existing
  return upsertAdvancedSettingsWithId(GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID, { ...DEFAULT_ADVANCED_SETTINGS })
}

export const getOrCreateGlobalTranscriptionSettings = async (): Promise<Transcription> => {
  const existing = await db.transcriptions.get(GLOBAL_TRANSCRIPTION_SETTINGS_ID)
  if (existing) return existing

  const now = new Date()
  const defaultTranscription = buildTranscriptionTemplate({
    id: GLOBAL_TRANSCRIPTION_SETTINGS_ID,
    projectId: 'global',
    title: 'Global Transcription Settings',
    now,
  })
  await db.transcriptions.put(defaultTranscription)
  return defaultTranscription
}

export const getOrCreateGlobalTranslationSettings = async (): Promise<Translation> => {
  const existing = await db.translations.get(GLOBAL_TRANSLATION_SETTINGS_ID)
  if (existing) return existing

  const translation = buildTranslationTemplate({
    id: GLOBAL_TRANSLATION_SETTINGS_ID,
    projectId: 'global',
    basicSettingsId: GLOBAL_TRANSLATION_BASIC_SETTINGS_ID,
    advancedSettingsId: GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID,
  })
  await db.translations.put(translation)
  return translation
}

export const ensureGlobalDefaultsExist = async (): Promise<void> => {
  await Promise.all([
    getOrCreateGlobalTranslationBasicSettings(),
    getOrCreateGlobalTranslationAdvancedSettings(),
    getOrCreateGlobalTranslationSettings(),
    getOrCreateGlobalExtractionBasicSettings(),
    getOrCreateGlobalExtractionAdvancedSettings(),
    getOrCreateGlobalTranscriptionSettings(),
  ])
}
