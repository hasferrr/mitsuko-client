import type { AdvancedSettings, Extraction, Project, Translation } from "./project"

export type LegacyAdvancedSettings = Omit<AdvancedSettings, "isMinimalContextMode"> & {
  isMinimalContextMode?: boolean
  isBetterContextCaching?: boolean
}

export interface LegacyProject extends Omit<Project, "defaultTranslationSettingsId" | "defaultExtractionSettingsId"> {
  defaultTranslationBasicSettingsId: string
  defaultTranslationAdvancedSettingsId: string
  defaultExtractionBasicSettingsId: string
  defaultExtractionAdvancedSettingsId: string
}

export interface LegacyTranslation extends Omit<Translation, "settingsId"> {
  basicSettingsId: string
  advancedSettingsId: string
}

export interface LegacyExtraction extends Omit<Extraction, "settingsId"> {
  basicSettingsId: string
  advancedSettingsId: string
}
