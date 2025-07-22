"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { useSessionStore } from "@/stores/use-session-store"
import demoPlaceholderImage from "@/static/demo-placeholder.png"

export default function HeroSection() {
  const session = useSessionStore((state) => state.session)
  const [isPlayClicked, setIsPlayClicked] = useState(false)

  const handlePlayClick = () => {
    setIsPlayClicked(true)
  }

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 my-12">
      {/* Notification banner */}
      <div className="mb-12 max-w-3xl mx-auto">
        <Link href="/dashboard" className="group flex items-center justify-center gap-2 px-8 py-4 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] dark:hover:bg-[#252525] hover:bg-gray-50 transition-colors drop-shadow-sm">
          ✨
          <span className="dark:text-gray-200 text-gray-800">Grok 4 and Gemini 2.5 Pro are now available!</span>
          <ExternalLink size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main heading */}
      <h1 className="max-w-3xl text-5xl md:text-6xl font-medium text-center mb-8 bg-gradient-to-r bg-clip-text">
        The Most Accurate AI <span className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">Subtitle Translator</span>
      </h1>

      {/* Subheading */}
      <div className="max-w-2xl text-center mb-12 text-lg">
        <p>
          Mitsuko prioritizes meaning over literal translation, adapting for cultural nuance and idiomatic expressions.
          Get subtitle translation with high-quality results.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-4 mb-4">
        <Link
          href="/dashboard"
          className="px-8 py-4 rounded-md bg-gradient-to-r from-[#ff7b72] to-[#bc8cff] text-white font-medium hover:brightness-110 transition-all whitespace-nowrap"
        >
          Try for Free!
        </Link>
        <Link
          href="/auth/login"
          className="px-8 py-4 rounded-md bg-[#1a1a1a] hover:bg-[#252525] border border-gray-800 transition-colors text-white font-medium whitespace-nowrap"
        >
          {session ? "My Account" : "Sign In"}
        </Link>
      </div>

      {/* Video embed */}
      <div className="mt-16 w-full max-w-5xl mx-auto rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="relative pt-[56.25%] bg-black select-none">
          {!isPlayClicked && (
            <Image
              width={960}
              height={540}
              src={demoPlaceholderImage}
              alt="Play video"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {!isPlayClicked && (
            <div
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              aria-label="Play video"
              role="button"
            >
              <div className="absolute inset-0 bg-black bg-opacity-10 transition-colors duration-300"></div>
              <svg className="w-20 h-20 text-white opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300 z-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
            </div>
          )}

          {isPlayClicked && (
            <iframe
              suppressHydrationWarning
              src="https://player.vimeo.com/video/1089413708?h=4944913f27&badge=0&autopause=0&player_id=0&app_id=58479&loop=1&autoplay=1&vimeo_logo=0&byline=0&portrait=0&title=0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              className="absolute inset-0 w-full h-full"
              title="Mitsuko AI Subtitle Translator Demo"
            />
          )}
        </div>
      </div>
    </div>
  )
}
