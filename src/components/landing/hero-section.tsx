"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSessionStore } from "@/stores/use-session-store"
import demoPlaceholderImage from "@/static/demo-placeholder.png"
import { Play } from "lucide-react"

export default function HeroSection() {
  const session = useSessionStore((state) => state.session)
  const [isPlayClicked, setIsPlayClicked] = useState(false)

  const handlePlayClick = () => {
    setIsPlayClicked(true)
  }

  return (
    <div className="flex flex-col justify-between items-center text-center px-4 my-12">
      {/* Main heading */}
      <h1 className="md:mt-8 w-full md:max-w-[50rem] max-w-lg text-center font-semibold leading-[110%] text-balance md:text-5xl text-4xl tracking-tight">
        The Most Accurate AI Subtitle Translator
      </h1>

      {/* Subheading */}
      <div className="text-text-main md:text-lg/[150%] text-base/[150%] mt-6 text-center md:max-w-xl max-w-lg">
        <p>
          Translate subtitles with high-quality result, faster than ever.
          Accelerate your subtitling workflow with Mitsuko!
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#101828] text-white text-sm font-semibold shadow-sm transition-colors hover:bg-[#15213a] hover:shadow dark:bg-white dark:text-[#101828] dark:hover:bg-[#f4f4f5]"
        >
          {session ? "Dashboard" : "Try for Free!"}
        </Link>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-100 dark:hover:bg-[#1d1d1d]"
        >
          {session ? "My Account" : "Sign In"}
        </Link>
      </div>

      {/* Video embed */}
      <div className="md:mt-24 mt-16 w-full max-w-5xl mx-auto overflow-hidden">
        <div className="relative pt-[56.25%] select-none overflow-hidden md:rounded-3xl rounded-lg md:border-[3px] border-[2px] border-background-soft">
          {!isPlayClicked && (
            <Image
              width={960}
              height={540}
              src={demoPlaceholderImage}
              placeholder="blur"
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
              <Play className="text-white opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300 z-10 rounded-full border-2 border-white w-16 h-16 p-4" />
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
