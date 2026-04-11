"use client"

import { Moon, Sun } from "lucide-react"
import { useThemeStore } from "@/stores/ui/use-theme-store"

export function ThemeToggle() {
  const isDarkMode = useThemeStore(state => state.isDarkMode)
  const setIsDarkMode = useThemeStore(state => state.setIsDarkMode)

  return (
    <button
      className="text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}