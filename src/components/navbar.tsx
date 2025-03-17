"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NavbarLinks } from "@/components/navbar-links"
import { Moon, Sun, Loader2 } from "lucide-react"
import { useThemeStore } from "@/stores/use-theme-store"
import { useTranslationStore } from "@/stores/use-translation-store"
import { useExtractionStore } from "@/stores/use-extraction-store"
import { NAVBAR_IMG_LINK } from "@/constants/external-links"
import { useTranscriptionStore } from "@/stores/use-transcription-store"
import { SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"

export function Navbar() {
  const isDarkModeGlobal = useThemeStore(state => state.isDarkMode)
  const setIsDarkModeGlobal = useThemeStore(state => state.setIsDarkMode)
  const isTranslating = useTranslationStore(state => state.isTranslating)
  const isExtracting = useExtractionStore(state => state.isExtracting)
  const isTranscribing = useTranscriptionStore(state => state.isTranscribing)

  const isProcessing = isTranslating || isExtracting || isTranscribing

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pr-8">
      <div className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </div>
        <div className="flex items-center gap-2 mr-4">
          <img
            width={4 * 6}
            height={4 * 6}
            src={NAVBAR_IMG_LINK}
            alt="Logo"
            className="w-6 h-6 object-cover"
          />
          <Link href="/" className="text-sm hover:text-foreground/80 text-foreground/60 dark:text-foreground/80 transition-all">
            Mitsuko
          </Link>
        </div>
        <nav className="items-center gap-6 text-sm hidden md:flex">
          <NavbarLinks />
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-foreground/80 mr-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsDarkModeGlobal(!isDarkModeGlobal)} className="transition-none">
            {isDarkModeGlobal ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
