import { Translation } from '@/types/project'
import { normalizeAutoContextDefault } from '@/lib/translation/auto-context-defaults'
import { DEFAULT_TRANSLATION_SETTINGS } from '@/constants/default'

export function buildTranslationTemplate({
  id,
  projectId,
  basicSettingsId,
  advancedSettingsId,
  autoContextMode = DEFAULT_TRANSLATION_SETTINGS.autoContextMode,
  now = new Date(),
}: {
  id: string
  projectId: string
  basicSettingsId: string
  advancedSettingsId: string
  autoContextMode?: unknown
  now?: Date
}): Translation {
  return {
    id,
    projectId,
    ...DEFAULT_TRANSLATION_SETTINGS,
    subtitles: [...DEFAULT_TRANSLATION_SETTINGS.subtitles],
    parsed: { ...DEFAULT_TRANSLATION_SETTINGS.parsed },
    basicSettingsId,
    advancedSettingsId,
    autoContextMode: normalizeAutoContextDefault(autoContextMode),
    response: {
      ...DEFAULT_TRANSLATION_SETTINGS.response,
      jsonResponse: [...DEFAULT_TRANSLATION_SETTINGS.response.jsonResponse],
    },
    createdAt: now,
    updatedAt: now,
  }
}
