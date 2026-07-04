import { create } from 'zustand'
import { CustomInstruction } from '@/types/custom-instruction'
import {
  createCustomInstruction as createDB,
  deleteCustomInstruction as deleteDB,
  getAllCustomInstructions as getAllDB,
  updateCustomInstruction as updateDB,
  bulkCreateCustomInstructions as bulkCreateDB,
  updateCustomInstructionOrder as updateOrderDB,
} from '@/lib/db/custom-instruction'

interface CustomInstructionStore {
  customInstructions: CustomInstruction[]
  error: string | null
  load: () => Promise<void>
  create: (name: string, content: string) => Promise<CustomInstruction>
  update: (id: string, changes: Partial<Pick<CustomInstruction, 'name' | 'content'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  bulkCreate: (instructions: CustomInstruction[]) => Promise<void>
  reorder: (newOrder: string[]) => Promise<void>
}

export const useCustomInstructionStore = create<CustomInstructionStore>((set, get) => ({
  customInstructions: [],
  error: null,

  load: async () => {
    set({ error: null })
    try {
      const data = await getAllDB()
      set({ customInstructions: data })
    } catch {
      set({ error: 'Failed to load custom instructions' })
    }
  },

  create: async (name, content) => {
    try {
      const newItem = await createDB({ name, content })
      set((state) => ({
        customInstructions: [...state.customInstructions, newItem],
      }))
      return newItem
    } catch (error) {
      set({ error: 'Failed to create custom instruction' })
      throw error
    }
  },

  update: async (id, changes) => {
    try {
      const updated = await updateDB(id, changes)
      set((state) => ({
        customInstructions: state.customInstructions.map(item =>
          item.id === id ? updated : item
        ),
      }))
    } catch {
      set({ error: 'Failed to update custom instruction' })
    }
  },

  remove: async (id) => {
    try {
      await deleteDB(id)
      set((state) => ({
        customInstructions: state.customInstructions.filter(item => item.id !== id),
      }))
    } catch {
      set({ error: 'Failed to delete custom instruction' })
    }
  },

  bulkCreate: async (instructions) => {
    try {
      await bulkCreateDB(instructions)
      set((state) => ({
        customInstructions: [...state.customInstructions, ...instructions],
      }))
    } catch (error) {
      set({ error: 'Failed to import custom instructions' })
      throw error
    }
  },

  reorder: async (newOrder) => {
    const previousInstructions = get().customInstructions
    const reordered = newOrder
      .map(id => previousInstructions.find(item => item.id === id))
      .filter((item): item is CustomInstruction => Boolean(item))
    set({ customInstructions: reordered })

    try {
      await updateOrderDB(newOrder)
    } catch (error) {
      console.error('Failed to reorder custom instructions', error)
      set({ customInstructions: previousInstructions, error: 'Failed to reorder custom instructions' })
    }
  }
}))