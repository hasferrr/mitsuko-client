import { useProjectStore } from '@/stores/use-project-store'
import { createContext, PropsWithChildren, useEffect } from 'react'

const ProjectStoreContext = createContext(undefined)

export default function ProjectStoreProvider({ children }: PropsWithChildren) {
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)

  useEffect(() => {
    const init = async () => {
      await loadProjects()
      setCurrentProject(useProjectStore.getState().projects[0] ?? null)
    }
    init()
  }, [])

  return (
    <ProjectStoreContext.Provider value={undefined}>
      {children}
    </ProjectStoreContext.Provider>
  )
}
