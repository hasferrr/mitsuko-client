"use client"

import { useProjectStore } from '@/stores/data/use-project-store'
import { createContext, PropsWithChildren, useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings/use-settings-store'
import { useAdvancedSettingsStore } from '@/stores/settings/use-advanced-settings-store'
import { ensureGlobalDefaultsExist } from '@/lib/db/global-settings'

const ProjectStoreContext = createContext(undefined)

export default function ProjectStoreProvider({ children }: PropsWithChildren) {
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const loadSettings = useSettingsStore((state) => state.loadSettings)
  const loadAdvancedSettings = useAdvancedSettingsStore((state) => state.loadSettings)

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
      ])
    }
    init()
  }, [loadProjects, loadSettings, loadAdvancedSettings])

  return (
    <ProjectStoreContext.Provider value={undefined}>
      {children}
    </ProjectStoreContext.Provider>
  )
}
