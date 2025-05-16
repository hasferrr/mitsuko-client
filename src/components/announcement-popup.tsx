"use client"

import { X } from "lucide-react"
import { useState, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"

export default function AnnouncementPopUp() {
  const [isVisible, setIsVisible] = useState(true)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            animate={isInView ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" } : { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[51] bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-xl p-4 max-w-md w-[90%]"
          >
            <div className="flex items-center justify-center gap-2 relative">
              <span className="text-lg">✨</span>
              <p className="text-base font-medium text-white text-center">
                DeepSeek R1, DeepSeek V3, Meta Llama 4, and Qwen 3 are in 70% discount!
              </p>
              <span className="text-lg">💰</span>

              <button
                aria-label="Dismiss announcement"
                onClick={handleDismiss}
                className="absolute -right-2 -top-2 p-1 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full bg-black/20"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}