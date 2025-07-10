import { create } from 'zustand'
import { CustomInstruction } from '@/types/custom-instruction'
import {
  createCustomInstruction as createDB,
  deleteCustomInstruction as deleteDB,
  getAllCustomInstructions as getAllDB,
  updateCustomInstruction as updateDB,
  bulkCreateCustomInstructions as bulkCreateDB
} from '@/lib/db/custom-instruction'

interface CustomInstructionStore {
  customInstructions: CustomInstruction[]
  loading: boolean
  error: string | null
  load: () => Promise<void>
  create: (name: string, content: string) => Promise<CustomInstruction>
  update: (id: string, changes: Partial<Pick<CustomInstruction, 'name' | 'content'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  bulkCreate: (instructions: CustomInstruction[]) => Promise<void>
}

export const useCustomInstructionStore = create<CustomInstructionStore>((set) => ({
  customInstructions: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null })
    try {
      const data = await getAllDB()
      set({ customInstructions: data, loading: false })
    } catch {
      set({ error: 'Failed to load custom instructions', loading: false })
    }
  },

  create: async (name, content) => {
    set({ loading: true })
    try {
      const newItem = await createDB({ name, content })
      set((state) => ({
        customInstructions: [...state.customInstructions, newItem],
        loading: false
      }))
      return newItem
    } catch (error) {
      set({ error: 'Failed to create custom instruction', loading: false })
      throw error
    }
  },

  update: async (id, changes) => {
    set({ loading: true })
    try {
      const updated = await updateDB(id, changes)
      set((state) => ({
        customInstructions: state.customInstructions.map(item =>
          item.id === id ? updated : item
        ),
        loading: false
      }))
    } catch {
      set({ error: 'Failed to update custom instruction', loading: false })
    }
  },

  remove: async (id) => {
    set({ loading: true })
    try {
      await deleteDB(id)
      set((state) => ({
        customInstructions: state.customInstructions.filter(item => item.id !== id),
        loading: false
      }))
    } catch {
      set({ error: 'Failed to delete custom instruction', loading: false })
    }
  },

  bulkCreate: async (instructions) => {
    set({ loading: true })
    try {
      await bulkCreateDB(instructions)
      set((state) => ({
        customInstructions: [...state.customInstructions, ...instructions],
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to import custom instructions', loading: false })
      throw error
    }
  }
}))