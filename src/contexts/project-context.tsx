import { useProjectStore } from '@/stores/use-project-store'
import { createContext, PropsWithChildren, useEffect } from 'react'
import { createTranslation } from '@/lib/db/translation'
import { createTranscription } from '@/lib/db/transcription'
import { createExtraction } from '@/lib/db/extraction'
import { DEFAULT_TITLE, DEFAULT_SUBTITLES } from '@/constants/default'

const ProjectStoreContext = createContext(undefined)

export default function ProjectStoreProvider({ children }: PropsWithChildren) {
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const createProject = useProjectStore((state) => state.createProject)

  useEffect(() => {
    const init = async () => {
      await loadProjects()
      const currentProjects = useProjectStore.getState().projects

      if (currentProjects.length === 0) {
        const project = await createProject('Default')

        await createTranslation(project.id, {
          title: DEFAULT_TITLE,
          subtitles: DEFAULT_SUBTITLES,
          parsed: {
            type: "srt",
            data: null
          }
        })

        await createTranscription(project.id, {
          title: "Empty Transcription",
          transcriptionText: "",
          transcriptSubtitles: []
        })

        await createExtraction(project.id, {
          episodeNumber: "",
          subtitleContent: "",
          previousContext: "",
          contextResult: ""
        })

        await loadProjects()
      }
    }
    init()
  }, [])

  return (
    <ProjectStoreContext.Provider value={undefined}>
      {children}
    </ProjectStoreContext.Provider>
  )
}
