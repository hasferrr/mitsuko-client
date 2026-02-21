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
  getProject as getOneProjectDB,
} from "@/lib/db/project"
import { useTranscriptionDataStore } from "./use-transcription-data-store"
import { useTranslationDataStore } from "./use-translation-data-store"
import { useExtractionDataStore } from "./use-extraction-data-store"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import { getBasicSettings, getAdvancedSettings } from "@/lib/db/settings"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { SubtitleTranslated } from "@/types/subtitles"
import { deleteTranslation } from "@/lib/db/translation"
import { deleteExtraction } from "@/lib/db/extraction"
import { deleteTranscription } from "@/lib/db/transcription"

interface ProjectStore {
  currentProject: Project | null
  projects: Project[]
  loading: boolean
  error: string | null
  hasLoaded: boolean
  setCurrentProject: (project: Project | string | null) => void
  loadProjects: () => Promise<void>
  createProject: (name: string, isBatch?: boolean) => Promise<Project>
  renameProject: (id: string, name: string) => Promise<void>
  updateProject: (id: string, update: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>) => Promise<Project | null>
  updateProjectItems: (id: string, items: string[], type: 'translations' | 'transcriptions' | 'extractions' | ProjectType) => Promise<Project | null>
  deleteProject: (id: string) => Promise<void>
  reorderProjects: (newOrder: string[]) => Promise<void>
  getProjectDb: (id: string) => Promise<Project | undefined>

  createTranslationForBatch: (projectId: string, file: File, content: string) => Promise<string>
  removeTranslationFromBatch: (projectId: string, translationId: string) => Promise<void>
  createExtractionForBatch: (projectId: string, file: File, content: string) => Promise<string>
  removeExtractionFromBatch: (projectId: string, extractionId: string) => Promise<void>
  createTranscriptionForBatch: (projectId: string, title: string) => Promise<{ id: string; title: string }>
  removeTranscriptionFromBatch: (projectId: string, transcriptionId: string) => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentProject: null,
  projects: [],
  loading: false,
  error: null,
  hasLoaded: false,

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

  getProjectDb: async (id) => {
    return await getOneProjectDB(id)
  },

  loadProjects: async () => {
    set({ loading: true, error: null, hasLoaded: false })
    try {
      const projects = await getAllProjectsDB()
      set((state) => ({
        projects,
        currentProject: (() => {
          const curr = state.currentProject
          return curr ? projects.find((pr) => pr.id === curr.id) : null
        })(),
        loading: false,
        hasLoaded: true,
      }))
    } catch (error) {
      console.error('Failed to load projects', error)
      set({ error: 'Failed to load projects', loading: false, hasLoaded: true })
    }
  },

  createProject: async (name, isBatch = false) => {
    set({ loading: true })
    try {
      const newProject = await createProjectDB(name, isBatch)

      // upsert associated settings into stores
      const settingsStore = useSettingsStore.getState()
      const advancedSettingsStore = useAdvancedSettingsStore.getState()
      const bs = await getBasicSettings(newProject.defaultBasicSettingsId)
      if (bs) settingsStore.upsertData(bs.id, bs)
      const ads = await getAdvancedSettings(newProject.defaultAdvancedSettingsId)
      if (ads) advancedSettingsStore.upsertData(ads.id, ads)

      const translationBs = await getBasicSettings(newProject.defaultTranslationBasicSettingsId)
      if (translationBs) settingsStore.upsertData(translationBs.id, translationBs)
      const translationAds = await getAdvancedSettings(newProject.defaultTranslationAdvancedSettingsId)
      if (translationAds) advancedSettingsStore.upsertData(translationAds.id, translationAds)

      const extractionBs = await getBasicSettings(newProject.defaultExtractionBasicSettingsId)
      if (extractionBs) settingsStore.upsertData(extractionBs.id, extractionBs)
      const extractionAds = await getAdvancedSettings(newProject.defaultExtractionAdvancedSettingsId)
      if (extractionAds) advancedSettingsStore.upsertData(extractionAds.id, extractionAds)

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

      const translation = await useTranslationDataStore.getState().createTranslationDb(
        projectId,
        {
          title: file.name,
          subtitles: translatedSubtitles,
          parsed: parsedData.parsed,
        }
      )

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

      // Delete translation along with its own settings
      await deleteTranslation(projectId, translationId)

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
  },

  /* ------------------ Batch Extraction Helpers ------------------ */
  createExtractionForBatch: async (projectId, file, content) => {
    set({ loading: true })
    try {
      const currentProject = get().projects.find(p => p.id === projectId)
      if (!currentProject) throw new Error('Project not found')

      const extraction = await useExtractionDataStore.getState().createExtractionDb(
        projectId,
        {
          title: file.name,
          episodeNumber: file.name.split('.').slice(0, -1).join('.') || file.name,
          subtitleContent: content,
          previousContext: '',
          contextResult: '',
        }
      )

      const updatedExtractions = [...currentProject.extractions, extraction.id]
      await updateProjectItemsDB(projectId, updatedExtractions, 'extractions')

      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, extractions: updatedExtractions, updatedAt: new Date() } : p),
        currentProject: state.currentProject?.id === projectId ? { ...state.currentProject, extractions: updatedExtractions, updatedAt: new Date() } : state.currentProject,
        loading: false
      }))

      return extraction.id
    } catch (err) {
      console.error('Failed to create extraction for batch', err)
      set({ loading: false, error: 'Failed to create extraction for batch' })
      throw err
    }
  },

  removeExtractionFromBatch: async (projectId, extractionId) => {
    set({ loading: true })
    try {
      const currentProject = get().projects.find(p => p.id === projectId)
      if (!currentProject) throw new Error('Project not found')

      // Delete extraction and its settings
      await deleteExtraction(projectId, extractionId)

      const updatedExtractions = currentProject.extractions.filter(id => id !== extractionId)
      await updateProjectItemsDB(projectId, updatedExtractions, 'extractions')

      // update extraction store
      const extractionStore = useExtractionDataStore.getState()
      extractionStore.removeData(extractionId)

      // update local project state
      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, extractions: updatedExtractions, updatedAt: new Date() } : p),
        currentProject: state.currentProject?.id === projectId ? { ...state.currentProject, extractions: updatedExtractions, updatedAt: new Date() } : state.currentProject,
        loading: false
      }))
    } catch (err) {
      console.error('Failed to remove extraction from batch', err)
      set({ loading: false, error: 'Failed to remove extraction from batch' })
      throw err
    }
  },

  /* ------------------ Batch Transcription Helpers ------------------ */
  createTranscriptionForBatch: async (projectId, title) => {
    set({ loading: true })
    try {
      const currentProject = get().projects.find(p => p.id === projectId)
      if (!currentProject) throw new Error('Project not found')

      const transcription = await useTranscriptionDataStore.getState().createTranscriptionDb(
        projectId,
        {
          title,
          transcriptionText: '',
          transcriptSubtitles: [],
        }
      )

      const updatedTranscriptions = [...currentProject.transcriptions, transcription.id]
      await updateProjectItemsDB(projectId, updatedTranscriptions, 'transcriptions')

      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, transcriptions: updatedTranscriptions, updatedAt: new Date() } : p),
        currentProject: state.currentProject?.id === projectId ? { ...state.currentProject, transcriptions: updatedTranscriptions, updatedAt: new Date() } : state.currentProject,
        loading: false
      }))

      return { id: transcription.id, title: transcription.title }
    } catch (err) {
      console.error('Failed to create transcription for batch', err)
      set({ loading: false, error: 'Failed to create transcription for batch' })
      throw err
    }
  },

  removeTranscriptionFromBatch: async (projectId, transcriptionId) => {
    set({ loading: true })
    try {
      const currentProject = get().projects.find(p => p.id === projectId)
      if (!currentProject) throw new Error('Project not found')

      // Delete transcription
      await deleteTranscription(projectId, transcriptionId)

      const updatedTranscriptions = currentProject.transcriptions.filter(id => id !== transcriptionId)
      await updateProjectItemsDB(projectId, updatedTranscriptions, 'transcriptions')

      // update transcription store
      const transcriptionStore = useTranscriptionDataStore.getState()
      transcriptionStore.removeData(transcriptionId)

      // update local project state
      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, transcriptions: updatedTranscriptions, updatedAt: new Date() } : p),
        currentProject: state.currentProject?.id === projectId ? { ...state.currentProject, transcriptions: updatedTranscriptions, updatedAt: new Date() } : state.currentProject,
        loading: false
      }))
    } catch (err) {
      console.error('Failed to remove transcription from batch', err)
      set({ loading: false, error: 'Failed to remove transcription from batch' })
      throw err
    }
  }
}))
