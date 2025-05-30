import { StateStorage } from "zustand/middleware"
import { set, get, del } from "idb-keyval"

export const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (typeof window !== "undefined") {
        const value = await get(name)
        return value ?? null
      }
      return null
    } catch (error) {
      console.error("Error getting item from IndexedDB:", error)
      return null
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (typeof window !== "undefined") {
        await set(name, value)
      }
    } catch (error) {
      console.error("Error setting item in IndexedDB:", error)
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (typeof window !== "undefined") {
        await del(name)
      }
    } catch (error) {
      console.error("Error removing item in IndexedDB:", error)
    }
  },
}
