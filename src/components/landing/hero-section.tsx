"use client"

import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  House,
  Folder,
  Languages,
  AudioWaveform,
  BookOpen,
} from "lucide-react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useSessionStore } from "@/stores/use-session-store"
import ImageLogo from "@/static/waifu.jpg"

export default function HeroSection() {
  const session = useSessionStore((state) => state.session)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="w-full flex items-center justify-center px-4 py-12 lg:px-16 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.2] bg-grid-8 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="
      w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-12
      bg-gradient-to-br from-indigo-600 via-purple-600 to-red-400 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-gray-900
      rounded-2xl border border-white/20 dark:border-gray-800 transition-colors
      p-8 md:p-12 overflow-hidden shadow-2xl relative z-10
      ">
        {/* Text content on the left */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <p className="text-4xl md:text-5xl lg:text-6xl font-medium text-white drop-shadow-md mb-6">
              Easily translate subtitles and transcribe audio with high quality results
            </p>
            <div className="text-gray-200 dark:text-gray-300 mb-8 text-sm md:text-lg sm:text-base">
              <h1>AI-Powered Subtitle Translator & Audio Transcription.</h1>
              <p>Get SRT/ASS translation with high-quality and context-aware results.</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-4"
          >
            <Link
              href="/dashboard"
              className="bg-blue-700 dark:bg-indigo-500 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white px-6 py-3 rounded-md flex items-center gap-2 transition-colors"
            >
              Try for Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/login"
              className="bg-white/10 hover:bg-gray-100/20 text-white px-6 py-3 rounded-md transition-colors"
            >
              {session ? "My Account" : "Sign In"}
            </Link>
          </motion.div>
        </div>

        {/* Card element on the right */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md min-w-[320px]"
        >
          <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800">
            {/* Browser chrome */}
            <div className="bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-2 flex items-center justify-between backdrop-blur-sm">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex space-x-4">
                <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>

            {/* App header */}
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg overflow-hidden mr-2 bg-white/20 backdrop-blur-sm">
                  <Image
                    width={32}
                    height={32}
                    src={ImageLogo}
                    alt="Mitsuko Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-medium text-gray-800 dark:text-white">Mitsuko</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Tools</span>
                </div>
              </div>
            </div>

            {/* Sidebar navigation */}
            <div className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="text-gray-500 dark:text-gray-400 mb-3 font-medium">Platform</div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-center group">
                  <div className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400">
                    <House className="w-full h-full" />
                  </div>
                  <span className="text-gray-800 dark:text-gray-300 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Dashboard</span>
                </li>
                <li className="flex items-center group">
                  <div className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <Folder className="w-full h-full" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Project</span>
                </li>
                <li className="flex items-center group">
                  <div className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <Languages className="w-full h-full" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Translate</span>
                </li>
                <li className="flex items-center group">
                  <div className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <AudioWaveform className="w-full h-full" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Transcribe</span>
                </li>
                <li className="flex items-center group">
                  <div className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <BookOpen className="w-full h-full" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Extract Context</span>
                </li>
              </ul>

              <div className="text-gray-500 dark:text-gray-400 mb-3 font-medium">Projects</div>
              <ul className="space-y-2 pl-1">
                <li className="flex items-center group">
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Movie</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
