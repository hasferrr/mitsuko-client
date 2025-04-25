"use client"

import { X } from "lucide-react"
import { useState } from "react"

export default function AnnouncementHeadline() {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <section className="py-1 text-center bg-gradient-to-r from-blue-500 to-purple-600 relative">
      <div className="container mx-auto flex items-center justify-center gap-2 relative">
        <span className="text-sm md:text-lg">✨</span>
        <h2 className="text-xs md:text-base font-medium text-white">
          Featuring OpenAI GPT Models & Credit Packs Now Available!
        </h2>
        <span className="text-sm md:text-lg">📦</span>

        <button
          aria-label="Dismiss announcement"
          onClick={handleDismiss}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full mr-2"
        >
          <X size={16} />
        </button>
      </div>
    </section>
  )
}