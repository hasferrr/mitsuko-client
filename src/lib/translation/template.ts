import { Translation } from '@/types/project'
import { normalizeAutoContextDefault } from '@/lib/translation/auto-context-defaults'

export function buildTranslationTemplate({
  id,
  projectId,
  basicSettingsId,
  advancedSettingsId,
  autoContextMode = 'disabled',
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
    title: '',
    subtitles: [],
    parsed: { type: 'srt', data: null },
    basicSettingsId,
    advancedSettingsId,
    autoContextMode: normalizeAutoContextDefault(autoContextMode),
    autoContextExtractionId: null,
    autoContextPreviousMode: 'latest',
    autoContextPreviousExtractionId: null,
    response: { response: '', jsonResponse: [] },
    createdAt: now,
    updatedAt: now,
  }
}
