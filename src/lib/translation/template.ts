import { LegacyTranslation } from '@/types/legacy-project'
import { Translation } from '@/types/project'
import { normalizeAutoContextDefault } from '@/lib/translation/auto-context-defaults'
import { DEFAULT_TRANSLATION_SETTINGS } from '@/constants/default'

interface TemplateBase {
  id: string
  projectId: string
  autoContextMode?: unknown
  now?: Date
}

type UnifiedTemplateInput = TemplateBase & { settingsId: string }
type LegacyTemplateInput = TemplateBase & { basicSettingsId: string; advancedSettingsId: string }

export function buildTranslationTemplate(input: UnifiedTemplateInput): Translation
export function buildTranslationTemplate(input: LegacyTemplateInput): LegacyTranslation
export function buildTranslationTemplate(input: UnifiedTemplateInput | LegacyTemplateInput): Translation | LegacyTranslation {
  const now = input.now ?? new Date()
  const common = {
    id: input.id,
    projectId: input.projectId,
    ...DEFAULT_TRANSLATION_SETTINGS,
    subtitles: [...DEFAULT_TRANSLATION_SETTINGS.subtitles],
    parsed: { ...DEFAULT_TRANSLATION_SETTINGS.parsed },
    autoContextMode: normalizeAutoContextDefault(input.autoContextMode ?? DEFAULT_TRANSLATION_SETTINGS.autoContextMode),
    response: {
      ...DEFAULT_TRANSLATION_SETTINGS.response,
      jsonResponse: [...DEFAULT_TRANSLATION_SETTINGS.response.jsonResponse],
    },
    createdAt: now,
    updatedAt: now,
  }
  return 'settingsId' in input
    ? { ...common, settingsId: input.settingsId }
    : { ...common, basicSettingsId: input.basicSettingsId, advancedSettingsId: input.advancedSettingsId }
}
