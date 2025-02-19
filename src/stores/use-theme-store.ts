import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ThemeStore {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: true,
      setIsDarkMode: (value) => set({ isDarkMode: value }),
    }),
    {
      name: 'dark-mode',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
