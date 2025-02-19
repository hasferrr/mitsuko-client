import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ThemeStore {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
  hydrateStore: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: true,
      setIsDarkMode: (value) => set({ isDarkMode: value }),
      hydrateStore: () => {
        const storedData = localStorage.getItem('dark-mode')
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          set(parsedData)
        }
      }
    }),
    {
      name: 'dark-mode',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
