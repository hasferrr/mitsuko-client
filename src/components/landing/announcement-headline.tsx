"use client"

import { X } from "lucide-react"
import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"

export default function AnnouncementHeadline() {
  const [isVisible, setIsVisible] = useState(true)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="py-1 text-center bg-gradient-to-r from-blue-500 to-purple-600 relative"
    >
      <div className="container mx-auto flex items-center justify-center gap-2 relative">
        <span className="text-sm md:text-lg">✨</span>
        <p className="text-xs md:text-base font-medium text-white">
          Featuring Gemini 2.5 Pro, Grok, Claude and Credit Packs Now Available!
        </p>
        <span className="text-sm md:text-lg">📦</span>

        <button
          aria-label="Dismiss announcement"
          onClick={handleDismiss}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full mr-2"
        >
          <X size={16} />
        </button>
      </div>
    </motion.section>
  )
}