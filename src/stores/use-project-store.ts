import { create } from "zustand"
import { Project } from "@/types/project"
import { getAllProjects, createProject as createProjectDB, deleteProject as deleteProjectDB, updateProject as updateProjectDB, updateProjectOrder } from "@/lib/db/project"

interface ProjectStore {
  currentProject: Project | null
  projects: Project[]
  loading: boolean
  error: string | null
  setCurrentProject: (project: Project | null) => void
  loadProjects: () => Promise<void>
  createProject: (name: string) => Promise<Project>
  updateProject: (id: string, name: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  reorderProjects: (newOrder: string[]) => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentProject: null,
  projects: [],
  loading: false,
  error: null,

  setCurrentProject: (project) => set({ currentProject: project }),

  loadProjects: async () => {
    set({ loading: true, error: null })
    try {
      const projects = await getAllProjects()
      set((state) => ({
        projects,
        currentProject: (() => {
          const curr = state.currentProject
          return curr ? projects.find((pr) => pr.id === curr.id) : null
        })(),
        loading: false,
      }))
    } catch (error) {
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

  updateProject: async (id, name) => {
    set({ loading: true })
    try {
      const updatedProject = await updateProjectDB(id, { name })
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
      set({ error: 'Failed to update project', loading: false })
    }
  },

  deleteProject: async (id) => {
    set({ loading: true })
    try {
      await deleteProjectDB(id)
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id
          ? null
          : state.currentProject,
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to delete project', loading: false })
    }
  },

  reorderProjects: async (newOrder) => {
    set({ loading: true })
    try {
      await updateProjectOrder(newOrder)
      const projects = await getAllProjects()
      set({ projects, loading: false })
    } catch (error) {
      set({ error: 'Failed to reorder projects', loading: false })
    }
  }
}))
