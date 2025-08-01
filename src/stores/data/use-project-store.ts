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
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import { SubtitleTranslated } from "@/types/subtitles"
import { createTranslation, deleteTranslation } from "@/lib/db/translation"
import { db } from "@/lib/db/db"

interface ProjectStore {
  currentProject: Project | null
  projects: Project[]
  loading: boolean
  error: string | null
  setCurrentProject: (project: Project | string | null) => void
  loadProjects: () => Promise<void>
  createProject: (name: string, isBatch?: boolean) => Promise<Project>
  renameProject: (id: string, name: string) => Promise<void>
  updateProject: (id: string, update: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>) => Promise<Project | null>
  updateProjectItems: (id: string, items: string[], type: 'translations' | 'transcriptions' | 'extractions' | ProjectType) => Promise<Project | null>
  deleteProject: (id: string) => Promise<void>
  reorderProjects: (newOrder: string[]) => Promise<void>

  createTranslationForBatch: (projectId: string, file: File, content: string) => Promise<string>
  removeTranslationFromBatch: (projectId: string, translationId: string) => Promise<void>
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

  createProject: async (name, isBatch = false) => {
    set({ loading: true })
    try {
      const newProject = await createProjectDB(name, isBatch)
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
    const previousProjects = get().projects
    const previousCurrentProject = get().currentProject
    const projectToDelete = previousProjects.find(p => p.id === id)
    if (!projectToDelete) return

    const transcriptionStore = useTranscriptionDataStore.getState()
    const extractionStore = useExtractionDataStore.getState()
    const translationStore = useTranslationDataStore.getState()

    projectToDelete.transcriptions.forEach((tid: string) => transcriptionStore.removeData(tid))
    projectToDelete.extractions.forEach((eid: string) => extractionStore.removeData(eid))
    projectToDelete.translations.forEach((tid: string) => translationStore.removeData(tid))

    set({
      projects: previousProjects.filter(p => p.id !== id),
      currentProject: previousCurrentProject?.id === id ? null : previousCurrentProject,
      loading: true,
      error: null,
    })

    try {
      await deleteProjectDB(id)
      set({ loading: false })
    } catch (error) {
      console.error('Failed to delete project', error)
      set({
        projects: previousProjects,
        currentProject: previousCurrentProject,
        error: 'Failed to delete project',
        loading: false,
      })
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
  },

  createTranslationForBatch: async (projectId, file, content) => {
    set({ loading: true })
    try {
      const currentProject = get().projects.find(p => p.id === projectId)
      if (!currentProject) throw new Error('Project not found')

      const parsedData = parseSubtitle({ content })

      const translatedSubtitles: SubtitleTranslated[] = parsedData.subtitles.map(sub => ({
        ...sub,
        translated: ''
      }))

      const translation = await createTranslation(
        projectId,
        {
          title: file.name,
          subtitles: translatedSubtitles,
          parsed: parsedData.parsed,
        },
        {},
        {}
      )

      const originalBasicSettingsId = translation.basicSettingsId
      const originalAdvancedSettingsId = translation.advancedSettingsId

      await db.translations.update(translation.id, {
        basicSettingsId: currentProject.defaultBasicSettingsId,
        advancedSettingsId: currentProject.defaultAdvancedSettingsId,
        updatedAt: new Date(),
      })

      const updatedTranslation = await db.translations.get(translation.id)
      if (updatedTranslation) {
        const translationStore = useTranslationDataStore.getState()
        translationStore.upsertData(updatedTranslation.id, updatedTranslation)
      }

      await db.transaction('rw', db.basicSettings, db.advancedSettings, async () => {
        await db.basicSettings.delete(originalBasicSettingsId)
        await db.advancedSettings.delete(originalAdvancedSettingsId)
      })

      const updatedTranslations = [...currentProject.translations, translation.id]
      await updateProjectItemsDB(projectId, updatedTranslations, 'translations')

      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, translations: updatedTranslations, updatedAt: new Date() } : p),
        currentProject: state.currentProject?.id === projectId ? { ...state.currentProject, translations: updatedTranslations, updatedAt: new Date() } : state.currentProject,
        loading: false
      }))

      return translation.id
    } catch (err) {
      console.error('Failed to create translation for batch', err)
      set({ loading: false, error: 'Failed to create translation for batch' })
      throw err
    }
  },

  removeTranslationFromBatch: async (projectId, translationId) => {
    set({ loading: true })
    try {
      const currentProject = get().projects.find(p => p.id === projectId)
      if (!currentProject) throw new Error('Project not found')

      const isBatchProject = currentProject.isBatch

      if (isBatchProject) {
        // Only delete the translation record; keep shared settings intact
        await db.translations.delete(translationId)
      } else {
        await deleteTranslation(projectId, translationId)
      }

      const updatedTranslations = currentProject.translations.filter(id => id !== translationId)
      await updateProjectItemsDB(projectId, updatedTranslations, 'translations')

      // update translation store
      const translationStore = useTranslationDataStore.getState()
      translationStore.removeData(translationId)

      // update local project state
      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, translations: updatedTranslations, updatedAt: new Date() } : p),
        currentProject: state.currentProject?.id === projectId ? { ...state.currentProject, translations: updatedTranslations, updatedAt: new Date() } : state.currentProject,
        loading: false
      }))
    } catch (err) {
      console.error('Failed to remove translation from batch', err)
      set({ loading: false, error: 'Failed to remove translation from batch' })
      throw err
    }
  }
}))
