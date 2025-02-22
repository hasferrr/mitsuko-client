"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, Moon, Sun, Loader2 } from "lucide-react"
import { useThemeStore } from "@/stores/use-theme-store"
import { useTranslationStore } from "@/stores/use-translation-store"
import { useExtractionStore } from "@/stores/use-extraction-store"
import { DISCORD_LINK } from "@/constants/external-links"

export function Navbar() {
  const isDarkModeGlobal = useThemeStore(state => state.isDarkMode)
  const setIsDarkModeGlobal = useThemeStore(state => state.setIsDarkMode)
  const isTranslating = useTranslationStore(state => state.isTranslating)
  const isExtracting = useExtractionStore(state => state.isExtracting)

  const isProcessing = isTranslating || isExtracting

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-4">
          <img
            src="https://i.pinimg.com/1200x/2f/52/bb/2f52bb67e52f767ed39a2d655537829c.jpg"
            alt="Logo"
            className="w-6 h-6 object-cover"
          />
          <Link href="/" className="font-semibold">Mitsuko</Link>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
            About
          </Link>
          <Link
            href={DISCORD_LINK}
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </Link>
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-foreground/80 mr-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsDarkModeGlobal(!isDarkModeGlobal)}>
            {isDarkModeGlobal ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon">
            <LogIn className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

