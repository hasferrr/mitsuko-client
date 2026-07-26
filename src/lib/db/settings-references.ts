import { db } from '@/lib/db/db'
import {
  GLOBAL_EXTRACTION_SETTINGS_ID,
  GLOBAL_TRANSLATION_SETTINGS_ID,
} from '@/constants/global-settings'

const RESERVED_SETTINGS_IDS = new Set([
  GLOBAL_TRANSLATION_SETTINGS_ID,
  GLOBAL_EXTRACTION_SETTINGS_ID,
])

export const deleteSettingsIfUnreferenced = async (settingsIds: Iterable<string>): Promise<void> => {
  const ids = [...new Set(settingsIds)].filter(id => id && !RESERVED_SETTINGS_IDS.has(id))
  if (ids.length === 0) return

  const [translations, extractions, projectTranslations, projectExtractions] = await Promise.all([
    db.translations.where('settingsId').anyOf(ids).toArray(),
    db.extractions.where('settingsId').anyOf(ids).toArray(),
    db.projects.where('defaultTranslationSettingsId').anyOf(ids).toArray(),
    db.projects.where('defaultExtractionSettingsId').anyOf(ids).toArray(),
  ])
  const referencedIds = new Set([
    ...translations.map(item => item.settingsId),
    ...extractions.map(item => item.settingsId),
    ...projectTranslations.map(item => item.defaultTranslationSettingsId),
    ...projectExtractions.map(item => item.defaultExtractionSettingsId),
  ])

  await db.settings.bulkDelete(ids.filter(id => !referencedIds.has(id)))
}
