"use client"

import { Toaster } from "sonner"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { useThemeStore } from "@/stores/use-theme-store"

export default function Layout({ children }: { children: React.ReactNode }) {
  const isDarkMode = useThemeStore(state => state.isDarkMode)

  return (
    <div className={`${isDarkMode ? "dark" : ""} bg-background text-foreground`}>
      <Navbar />
      {children}
      <Footer />
      <Toaster />
    </div>
  )
}
