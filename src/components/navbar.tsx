"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NavLinks } from "@/components/nav-links"
import { LogIn, Moon, Sun, Loader2, Menu } from "lucide-react"
import { useThemeStore } from "@/stores/use-theme-store"
import { useTranslationStore } from "@/stores/use-translation-store"
import { useExtractionStore } from "@/stores/use-extraction-store"
import { NAVBAR_IMG_LINK } from "@/constants/external-links"

export function Navbar() {
  const isDarkModeGlobal = useThemeStore(state => state.isDarkMode)
  const setIsDarkModeGlobal = useThemeStore(state => state.setIsDarkMode)
  const isTranslating = useTranslationStore(state => state.isTranslating)
  const isExtracting = useExtractionStore(state => state.isExtracting)

  const isProcessing = isTranslating || isExtracting
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8">
      <div className="flex h-14 items-center gap-2">
        <div className="flex items-center gap-2 mr-4">
          <img
            src={NAVBAR_IMG_LINK}
            alt="Logo"
            className="w-6 h-6 object-cover"
          />
          <Link href="/" className="font-semibold">Mitsuko</Link>
        </div>
        <nav className="items-center gap-6 text-sm hidden md:flex">
          <NavLinks isMobile={false} />
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
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] bg-background/95 backdrop-blur">
              <SheetHeader>
                <SheetTitle>Mitsuko</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col items-start gap-6 text-sm mt-8">
                <NavLinks isMobile={true} setOpen={setOpen} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
