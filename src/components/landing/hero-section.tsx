"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { useSessionStore } from "@/stores/use-session-store"
import demoPlaceholderImage from "@/static/demo-placeholder.png"
import { cn } from "@/lib/utils"

export default function HeroSection() {
  const session = useSessionStore((state) => state.session)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const vimeoScript = document.createElement('script')
      vimeoScript.src = "https://player.vimeo.com/api/player.js"
      vimeoScript.async = true

      const handleScriptLoad = () => {
        setIsScriptLoaded(true)
      }

      vimeoScript.addEventListener('load', handleScriptLoad)
      document.body.appendChild(vimeoScript)

      return () => {
        vimeoScript.removeEventListener('load', handleScriptLoad)
        if (document.body.contains(vimeoScript)) {
          document.body.removeChild(vimeoScript)
        }
      }
    }
  }, [])

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 my-12">
      {/* Notification banner */}
      <div className="mb-12 max-w-3xl mx-auto">
        <Link href="/dashboard" className="group flex items-center justify-center gap-2 px-8 py-4 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] dark:hover:bg-[#252525] hover:bg-gray-50 transition-colors drop-shadow-sm">
          ✨
          <span className="dark:text-gray-200 text-gray-800">Claude 4 Sonnet and Gemini 2.5 Pro are now available!</span>
          <ExternalLink size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main heading */}
      <h1 className="max-w-3xl text-5xl md:text-6xl font-medium text-center mb-8 bg-gradient-to-r  bg-clip-text">
        {/* Easily translate subtitles and transcribe audio with high quality results. */}
        {/* Your Professional AI-Powered Subtitle Translator */}
        The Most Accurate AI <span className="text-purple-500">Subtitle Translator</span>
      </h1>

      {/* Subheading */}
      <div className="max-w-2xl text-center mb-12 text-lg">
        <p>
          AI-Powered Subtitle Translator & Audio Transcription.
          Get SRT/ASS translation with high-quality and context-aware results.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Link
          href="/dashboard"
          className="px-8 py-4 rounded-md bg-gradient-to-r from-[#ff7b72] to-[#bc8cff] text-white font-medium flex items-center justify-center hover:brightness-110 transition-all"
        >
          Try for Free!
        </Link>
        <Link
          href="/auth/login"
          className="px-8 py-4 rounded-md bg-[#1a1a1a] hover:bg-[#252525] border border-gray-800 transition-colors text-white font-medium flex items-center justify-center"
        >
          {session ? "My Account" : "Sign In"}
        </Link>
      </div>

      {/* Video embed */}
      <div className="mt-16 w-full max-w-5xl mx-auto rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="relative pt-[56.25%]">
          {!isScriptLoaded && (
            <Image
              width={960}
              height={540}
              src={demoPlaceholderImage}
              alt="Loading video..."
              priority
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <iframe
            suppressHydrationWarning
            src="https://player.vimeo.com/video/1089413708?h=4944913f27&badge=0&autopause=0&player_id=0&app_id=58479&loop=1&autoplay=1&vimeo_logo=0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-500",
              isScriptLoaded ? "opacity-100" : "opacity-0"
            )}
            title="Mitsuko AI Subtitle Translator Demo"
            style={{ visibility: isScriptLoaded ? "visible" : "hidden" }}
          />
        </div>
      </div>
    </div>
  )
}
