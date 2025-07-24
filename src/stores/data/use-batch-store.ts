import { create } from "zustand"
import { Batch } from "@/types/project"
import {
  getAllBatches as getAllBatchesDB,
  createBatch as createBatchDB,
  deleteBatch as deleteBatchDB,
  renameBatch as renameBatchDB,
  updateBatch as updateBatchDB,
  updateBatchItems as updateBatchItemsDB,
} from "@/lib/db/batch"
import { useTranslationDataStore } from "./use-translation-data-store"

interface BatchStore {
  currentBatch: Batch | null
  batches: Batch[]
  loading: boolean
  error: string | null
  setCurrentBatch: (batch: Batch | string | null) => void
  loadBatches: () => Promise<void>
  createBatch: (name: string) => Promise<Batch>
  renameBatch: (id: string, name: string) => Promise<void>
  updateBatch: (id: string, update: Partial<Omit<Batch, "id" | "createdAt" | "updatedAt">>) => Promise<Batch | null>
  updateBatchItems: (id: string, items: string[]) => Promise<Batch | null>
  deleteBatch: (id: string) => Promise<void>
}

export const useBatchStore = create<BatchStore>((set, get) => ({
  currentBatch: null,
  batches: [],
  loading: false,
  error: null,

  setCurrentBatch: (batch: Batch | string | null) => {
    if (typeof batch === 'string') {
      const foundBatch = get().batches.find((p) => p.id === batch)
      if (foundBatch) {
        set({ currentBatch: foundBatch })
      }
    } else {
      set({ currentBatch: batch })
    }
  },

  loadBatches: async () => {
    set({ loading: true, error: null })
    try {
      const batches = await getAllBatchesDB()
      set((state) => ({
        batches,
        currentBatch: (() => {
          const curr = state.currentBatch
          return curr ? batches.find((pr) => pr.id === curr.id) : null
        })(),
        loading: false,
      }))
    } catch (error) {
      console.error('Failed to load batches', error)
      set({ error: 'Failed to load batches', loading: false })
    }
  },

  createBatch: async (name) => {
    set({ loading: true })
    try {
      const newBatch = await createBatchDB(name)
      set((state) => ({
        batches: [newBatch, ...state.batches],
        loading: false
      }))
      return newBatch
    } catch (error) {
      set({ error: 'Failed to create batch', loading: false })
      throw error
    }
  },

  renameBatch: async (id, name) => {
    set({ loading: true })
    try {
      const updatedBatch = await renameBatchDB(id, { name })
      set((state) => ({
        batches: state.batches.map(p =>
          p.id === id ? updatedBatch : p
        ),
        currentBatch: state.currentBatch?.id === id
          ? updatedBatch
          : state.currentBatch,
        loading: false
      }))
    } catch (error) {
      console.error('Failed to update batch', error)
      set({ error: 'Failed to update batch', loading: false })
    }
  },

  updateBatch: async (id, update) => {
    set({ loading: true })
    try {
      const updatedBatch = await updateBatchDB(id, update)
      set((state) => ({
        batches: state.batches.map(p =>
          p.id === id ? updatedBatch : p
        ),
        loading: false
      }))
      return updatedBatch
    } catch (error) {
      console.error('Failed to update batch', error)
      set({ error: 'Failed to update batch', loading: false })
      return null
    }
  },

  updateBatchItems: async (id, items) => {
    set({ loading: true })
    try {
      const updatedBatch = await updateBatchItemsDB(id, items)
      if (!updatedBatch) return null
      set((state) => ({
        batches: state.batches.map(p =>
          p.id === id ? updatedBatch : p
        ),
        currentBatch: state.currentBatch?.id === id ? updatedBatch : state.currentBatch,
        loading: false
      }))
      return updatedBatch
    } catch (error) {
      console.error('Failed to update batch items', error)
      set({ error: 'Failed to update batch items', loading: false })
      return null
    }
  },

  deleteBatch: async (id) => {
    set({ loading: true })
    try {
      await deleteBatchDB(id)

      const translationStore = useTranslationDataStore.getState()

      // Remove data for deleted batch from all stores
      const deletedBatch = get().batches.find((p: { id: string }) => p.id === id)
      if (deletedBatch) {
        deletedBatch.translations.forEach((translationId: string) => {
          translationStore.removeData(translationId)
        })
      }

      set((state) => ({
        batches: state.batches.filter(p => p.id !== id),
        currentBatch: state.currentBatch?.id === id
          ? null
          : state.currentBatch,
        loading: false
      }))

      if (get().currentBatch?.id === id) {
        set({ currentBatch: null })
      }
    } catch (error) {
      console.error('Failed to delete batch', error)
      set({ error: 'Failed to delete batch', loading: false })
    }
  },
}))
