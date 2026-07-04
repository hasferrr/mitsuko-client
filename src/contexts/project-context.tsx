"use client"

import { useProjectStore } from '@/stores/data/use-project-store'
import { createContext, PropsWithChildren, useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings/use-settings-store'
import { useAdvancedSettingsStore } from '@/stores/settings/use-advanced-settings-store'
import { useTranscriptionDataStore } from '@/stores/data/use-transcription-data-store'
import { ensureGlobalDefaultsExist } from '@/lib/db/global-settings'
import { useTranslationDataStore } from '@/stores/data/use-translation-data-store'

const ProjectStoreContext = createContext(undefined)

export default function ProjectStoreProvider({ children }: PropsWithChildren) {
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const loadSettings = useSettingsStore((state) => state.loadSettings)
  const loadAdvancedSettings = useAdvancedSettingsStore((state) => state.loadSettings)
  const loadGlobalTranscription = useTranscriptionDataStore((state) => state.loadGlobalTranscription)
  const loadGlobalTranslation = useTranslationDataStore((state) => state.loadGlobalTranslation)

  useEffect(() => {
    const init = async () => {
      try {
        await ensureGlobalDefaultsExist()
      } catch (e) {
        console.error('Failed to ensure global defaults exist', e)
      }
      await Promise.all([
        loadProjects(),
        loadSettings(),
        loadAdvancedSettings(),
        loadGlobalTranslation(),
        loadGlobalTranscription(),
      ])
    }
    init()
  }, [loadProjects, loadSettings, loadAdvancedSettings, loadGlobalTranslation, loadGlobalTranscription])

  return (
    <ProjectStoreContext.Provider value={undefined}>
      {children}
    </ProjectStoreContext.Provider>
  )
}
