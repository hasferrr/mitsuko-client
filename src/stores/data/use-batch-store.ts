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
import { createTranslation } from "@/lib/db/translation"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import { SubtitleTranslated } from "@/types/subtitles"
import { db } from "@/lib/db/db"

interface BatchStore {
  currentBatch: Batch | null
  batches: Batch[]
  loading: boolean
  error: string | null
  setCurrentBatch: (batch: Batch | string | null) => void
  loadBatches: () => Promise<void>
  createBatch: (name: string) => Promise<Batch>
  createTranslationForBatch: (batchId: string, file: File, content: string) => Promise<string>
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

  createTranslationForBatch: async (batchId, file, content) => {
    set({ loading: true })
    try {
      const currentBatch = get().batches.find(batch => batch.id === batchId)
      if (!currentBatch) {
        throw new Error("Batch not found")
      }

      const parsedData = parseSubtitle({ content })

      // Convert subtitles to SubtitleTranslated by adding the translated field
      const translatedSubtitles: SubtitleTranslated[] = parsedData.subtitles.map(subtitle => ({
        ...subtitle,
        translated: ""
      }))

      // Create the translation with the batch's default settings
      const translation = await createTranslation(
        "", // Empty projectId since this is for a batch
        {
          title: file.name,
          subtitles: translatedSubtitles,
          parsed: parsedData.parsed,
        },
        {}, // Use batch's default settings, no need to override
        {}  // Use batch's default settings, no need to override
      )

      // Store the original settings IDs before updating them
      const originalBasicSettingsId = translation.basicSettingsId
      const originalAdvancedSettingsId = translation.advancedSettingsId

      // Update the translation directly in the database first
      await db.translations.update(translation.id, {
        batchId,
        basicSettingsId: currentBatch.defaultBasicSettingsId,
        advancedSettingsId: currentBatch.defaultAdvancedSettingsId,
        updatedAt: new Date()
      })

      // Fetch the updated translation
      const updatedTranslation = await db.translations.get(translation.id)
      if (!updatedTranslation) {
        throw new Error("Failed to update translation")
      }

      // Update translation in the store
      const translationStore = useTranslationDataStore.getState()
      translationStore.upsertData(updatedTranslation.id, updatedTranslation)

      // Delete the unused settings that were created with the translation
      await db.transaction('rw', db.basicSettings, db.advancedSettings, async () => {
        await db.basicSettings.delete(originalBasicSettingsId)
        await db.advancedSettings.delete(originalAdvancedSettingsId)
      })

      // Update the batch's translations array
      const updatedTranslations = [...currentBatch.translations, translation.id]
      await updateBatchItemsDB(batchId, updatedTranslations)

      // Update the local state
      set((state) => ({
        batches: state.batches.map(b =>
          b.id === batchId
            ? { ...b, translations: updatedTranslations, updatedAt: new Date() }
            : b
        ),
        currentBatch: state.currentBatch?.id === batchId
          ? { ...state.currentBatch, translations: updatedTranslations, updatedAt: new Date() }
          : state.currentBatch,
        loading: false
      }))

      return translation.id
    } catch (error) {
      console.error('Failed to create translation for batch', error)
      set({ error: 'Failed to create translation for batch', loading: false })
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
