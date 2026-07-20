import { Extraction, Project, Translation } from "@/types/project"

export interface LegacyProjectSettingsReferences {
  defaultBasicSettingsId?: string
  defaultAdvancedSettingsId?: string
}

interface LegacySettingsReferenceData {
  legacyProjects: LegacyProjectSettingsReferences[]
  projects: Project[]
  translations: Translation[]
  extractions: Extraction[]
}

export const getOrphanedLegacySettingsIds = ({
  legacyProjects,
  projects,
  translations,
  extractions,
}: LegacySettingsReferenceData): { basic: Set<string>; advanced: Set<string> } => {
  const legacyBasicIds = new Set(legacyProjects.map(project => project.defaultBasicSettingsId).filter((id): id is string => !!id))
  const legacyAdvancedIds = new Set(legacyProjects.map(project => project.defaultAdvancedSettingsId).filter((id): id is string => !!id))
  const activeBasicIds = new Set<string>()
  const activeAdvancedIds = new Set<string>()

  for (const project of projects) {
    activeBasicIds.add(project.defaultTranslationBasicSettingsId)
    activeBasicIds.add(project.defaultExtractionBasicSettingsId)
    activeAdvancedIds.add(project.defaultTranslationAdvancedSettingsId)
    activeAdvancedIds.add(project.defaultExtractionAdvancedSettingsId)
  }
  for (const entity of [...translations, ...extractions]) {
    activeBasicIds.add(entity.basicSettingsId)
    activeAdvancedIds.add(entity.advancedSettingsId)
  }

  return {
    basic: new Set([...legacyBasicIds].filter(id => !activeBasicIds.has(id))),
    advanced: new Set([...legacyAdvancedIds].filter(id => !activeAdvancedIds.has(id))),
  }
}
