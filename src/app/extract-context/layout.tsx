"use client"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar isDarkMode={true} onThemeToggle={() => { }} />
      {children}
      <Footer />
    </div>
  )
}
