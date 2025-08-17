"use client"

import { useProjectStore } from '@/stores/data/use-project-store'
import { createContext, PropsWithChildren, useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings/use-settings-store'
import { useAdvancedSettingsStore } from '@/stores/settings/use-advanced-settings-store'

const ProjectStoreContext = createContext(undefined)

export default function ProjectStoreProvider({ children }: PropsWithChildren) {
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const loadSettings = useSettingsStore((state) => state.loadSettings)
  const loadAdvancedSettings = useAdvancedSettingsStore((state) => state.loadSettings)

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([
        loadProjects(),
        loadSettings(),
        loadAdvancedSettings(),
      ])
    }
    loadAll()
  }, [loadProjects, loadSettings, loadAdvancedSettings])

  return (
    <ProjectStoreContext.Provider value={undefined}>
      {children}
    </ProjectStoreContext.Provider>
  )
}
