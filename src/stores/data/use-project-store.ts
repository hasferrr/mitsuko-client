import { create } from "zustand"
import { Project, ProjectType } from "@/types/project"
import {
  getAllProjects as getAllProjectsDB,
  createProject as createProjectDB,
  deleteProject as deleteProjectDB,
  renameProject as renameProjectDB,
  updateProjectOrder as updateProjectOrderDB,
  updateProjectItems as updateProjectItemsDB,
  updateProject as updateProjectDB,
} from "@/lib/db/project"
import { useTranscriptionDataStore } from "./use-transcription-data-store"
import { useTranslationDataStore } from "./use-translation-data-store"
import { useExtractionDataStore } from "./use-extraction-data-store"

interface ProjectStore {
  currentProject: Project | null
  projects: Project[]
  loading: boolean
  error: string | null
  setCurrentProject: (project: Project | string | null) => void
  loadProjects: () => Promise<void>
  createProject: (name: string) => Promise<Project>
  renameProject: (id: string, name: string) => Promise<void>
  updateProject: (id: string, update: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>) => Promise<Project | null>
  updateProjectItems: (id: string, items: string[], type: 'translations' | 'transcriptions' | 'extractions' | ProjectType) => Promise<Project | null>
  deleteProject: (id: string) => Promise<void>
  reorderProjects: (newOrder: string[]) => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentProject: null,
  projects: [],
  loading: false,
  error: null,

  setCurrentProject: (project: Project | string | null) => {
    if (typeof project === 'string') {
      const foundProject = get().projects.find((p) => p.id === project)
      if (foundProject) {
        set({ currentProject: foundProject })
      }
    } else {
      set({ currentProject: project })
    }
  },

  loadProjects: async () => {
    set({ loading: true, error: null })
    try {
      const projects = await getAllProjectsDB()
      set((state) => ({
        projects,
        currentProject: (() => {
          const curr = state.currentProject
          return curr ? projects.find((pr) => pr.id === curr.id) : null
        })(),
        loading: false,
      }))
    } catch (error) {
      console.error('Failed to load projects', error)
      set({ error: 'Failed to load projects', loading: false })
    }
  },

  createProject: async (name) => {
    set({ loading: true })
    try {
      const newProject = await createProjectDB(name)
      set((state) => ({
        projects: [newProject, ...state.projects],
        loading: false
      }))
      return newProject
    } catch (error) {
      set({ error: 'Failed to create project', loading: false })
      throw error
    }
  },

  renameProject: async (id, name) => {
    set({ loading: true })
    try {
      const updatedProject = await renameProjectDB(id, { name })
      set((state) => ({
        projects: state.projects.map(p =>
          p.id === id ? updatedProject : p
        ),
        currentProject: state.currentProject?.id === id
          ? updatedProject
          : state.currentProject,
        loading: false
      }))
    } catch (error) {
      console.error('Failed to update project', error)
      set({ error: 'Failed to update project', loading: false })
    }
  },

  updateProject: async (id, update) => {
    set({ loading: true })
    try {
      const updatedProject = await updateProjectDB(id, update)
      set((state) => ({
        projects: state.projects.map(p =>
          p.id === id ? updatedProject : p
        ),
        loading: false
      }))
      return updatedProject
    } catch (error) {
      console.error('Failed to update project', error)
      set({ error: 'Failed to update project', loading: false })
      return null
    }
  },

  updateProjectItems: async (id, items, type) => {
    set({ loading: true })
    if (type === 'translation') type = 'translations'
    if (type === 'transcription') type = 'transcriptions'
    if (type === 'extraction') type = 'extractions'
    try {
      const updatedProject = await updateProjectItemsDB(id, items, type)
      if (!updatedProject) return null
      set((state) => ({
        projects: state.projects.map(p =>
          p.id === id ? updatedProject : p
        ),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
        loading: false
      }))
      return updatedProject
    } catch (error) {
      console.error('Failed to update project items', error)
      set({ error: 'Failed to update project items', loading: false })
      return null
    }
  },

  deleteProject: async (id) => {
    set({ loading: true })
    try {
      await deleteProjectDB(id)

      const transcriptionStore = useTranscriptionDataStore.getState()
      const extractionStore = useExtractionDataStore.getState()
      const translationStore = useTranslationDataStore.getState()

      // Remove data for deleted project from all stores
      const deletedProject = get().projects.find((p: { id: string }) => p.id === id)
      if (deletedProject) {
        deletedProject.transcriptions.forEach((transcriptionId: string) => {
          transcriptionStore.removeData(transcriptionId)
        })
        deletedProject.extractions.forEach((extractionId: string) => {
          extractionStore.removeData(extractionId)
        })
        deletedProject.translations.forEach((translationId: string) => {
          translationStore.removeData(translationId)
        })
      }

      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id
          ? null
          : state.currentProject,
        loading: false
      }))

      if (get().currentProject?.id === id) {
        set({ currentProject: null })
      }
    } catch (error) {
      console.error('Failed to delete project', error)
      set({ error: 'Failed to delete project', loading: false })
    }
  },

  reorderProjects: async (newOrder) => {
    const previousProjects = get().projects
    const reordered = newOrder
      .map(id => previousProjects.find(p => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
    set({ projects: reordered })

    try {
      await updateProjectOrderDB(newOrder)
    } catch (error) {
      console.error('Failed to reorder projects', error)
      set({ projects: previousProjects, error: 'Failed to reorder projects' })
    }
  }
}))
