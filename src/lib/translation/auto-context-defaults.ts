import { AutoContextMode } from '@/types/project'

export type AutoContextDefaultMode = Extract<AutoContextMode, 'disabled' | 'create-new'>

export function normalizeAutoContextDefault(mode: unknown): AutoContextDefaultMode {
  return mode === 'create-new' ? 'create-new' : 'disabled'
}

export function resolveNewTranslationAutoContextMode({
  explicitMode,
  isBatch,
  templateMode,
}: {
  explicitMode?: AutoContextMode
  isBatch: boolean
  templateMode: unknown
}): AutoContextMode {
  if (isBatch) return 'disabled'
  if (explicitMode !== undefined) return explicitMode
  return normalizeAutoContextDefault(templateMode)
}
