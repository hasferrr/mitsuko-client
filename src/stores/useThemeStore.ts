import { create } from 'zustand'

interface ThemeStore {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDarkMode: true,
  setIsDarkMode: (value) => set({ isDarkMode: value }),
}))
