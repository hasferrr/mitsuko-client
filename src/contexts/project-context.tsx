import { useProjectStore } from '@/stores/data/use-project-store'
import { createContext, PropsWithChildren, useEffect } from 'react'

const ProjectStoreContext = createContext(undefined)

export default function ProjectStoreProvider({ children }: PropsWithChildren) {
  const loadProjects = useProjectStore((state) => state.loadProjects)

  useEffect(() => {
    loadProjects()
  }, [])

  return (
    <ProjectStoreContext.Provider value={undefined}>
      {children}
    </ProjectStoreContext.Provider>
  )
}
