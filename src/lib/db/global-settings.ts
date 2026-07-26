import { db } from '@/lib/db/db'
import { Settings, Transcription, Translation } from '@/types/project'
import { DEFAULT_EXTRACTION_SETTINGS, DEFAULT_SETTINGS } from '@/constants/default'
import { getSettings } from '@/lib/db/settings'
import {
  GLOBAL_EXTRACTION_SETTINGS_ID,
  GLOBAL_TRANSLATION_SETTINGS_ID,
  GLOBAL_TRANSCRIPTION_SETTINGS_ID,
} from '@/constants/global-settings'
import { buildTranslationTemplate } from '@/lib/translation/template'
import { buildTranscriptionTemplate } from '@/lib/transcription/template'

export const upsertSettingsWithId = async (
  id: string,
  settings: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Settings> => {
  const now = new Date()
  const existing = await db.settings.get(id)
  const record: Settings = existing
    ? { ...existing, ...settings, id, updatedAt: now }
    : { ...settings, id, createdAt: now, updatedAt: now }
  await db.settings.put(record)
  return record
}

export const getOrCreateGlobalTranslationSettingsRecord = async (): Promise<Settings> => {
  const existing = await getSettings(GLOBAL_TRANSLATION_SETTINGS_ID)
  if (existing) return existing
  return upsertSettingsWithId(GLOBAL_TRANSLATION_SETTINGS_ID, { ...DEFAULT_SETTINGS })
}

export const getOrCreateGlobalExtractionSettings = async (): Promise<Settings> => {
  const existing = await getSettings(GLOBAL_EXTRACTION_SETTINGS_ID)
  if (existing) return existing
  return upsertSettingsWithId(GLOBAL_EXTRACTION_SETTINGS_ID, { ...DEFAULT_EXTRACTION_SETTINGS })
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
    settingsId: GLOBAL_TRANSLATION_SETTINGS_ID,
  })
  await db.translations.put(translation)
  return translation
}

export const ensureGlobalDefaultsExist = async (): Promise<void> => {
  await Promise.all([
    getOrCreateGlobalTranslationSettingsRecord(),
    getOrCreateGlobalTranslationSettings(),
    getOrCreateGlobalExtractionSettings(),
    getOrCreateGlobalTranscriptionSettings(),
  ])
}
