import type { Extraction, Project, Translation } from "./project"

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
