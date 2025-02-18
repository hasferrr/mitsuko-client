"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, Moon, Sun } from "lucide-react"

interface NavbarProps {
  isDarkMode: boolean
  onThemeToggle: () => void
}

export function Navbar({ isDarkMode, onThemeToggle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-4">
          <img
            src="https://i.pinimg.com/1200x/2f/52/bb/2f52bb67e52f767ed39a2d655537829c.jpg"
            alt="Logo"
            className="w-6 h-6 object-cover"
          />
          <span className="font-semibold">Mitsuko</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
            About
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Discord
          </Link>
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" onClick={onThemeToggle}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon">
            <LogIn className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

