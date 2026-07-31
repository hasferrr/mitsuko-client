"use client"

import { useEffect, useRef, useState } from "react"
import type VimeoPlayer from "@vimeo/player"
import Link from "@/components/link"
import { useSessionStore } from "@/stores/ui/use-session-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const demoVideoUrl = "https://vimeo.com/1206416824?h=4944913f27"

export default function HeroSection() {
  const session = useSessionStore((state) => state.session)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(
        () => setShouldLoadVideo(true),
        { timeout: 2000 },
      )

      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = window.setTimeout(() => setShouldLoadVideo(true), 100)

    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    const videoContainer = videoContainerRef.current

    if (!shouldLoadVideo || !videoContainer) return

    let player: VimeoPlayer | undefined
    let isCancelled = false

    const initializePlayer = async () => {
      try {
        const { default: Player } = await import("@vimeo/player")

        if (isCancelled) return

        player = new Player(videoContainer, {
          url: demoVideoUrl,
          autoplay: true,
          autopause: false,
          byline: false,
          loop: true,
          portrait: false,
          responsive: true,
          title: false,
          vimeo_logo: false,
        })

        await player.ready()

        if (!isCancelled) setIsVideoLoaded(true)
      } catch (error) {
        if (!isCancelled) console.error("Failed to load Vimeo player:", error)
      }
    }

    void initializePlayer()

    return () => {
      isCancelled = true
      void player?.destroy()
    }
  }, [shouldLoadVideo])

  return (
    <div className="flex flex-col justify-between items-center text-center px-4 my-12">
      {/* Main heading */}
      <h1 className="md:mt-8 w-full md:max-w-200 max-w-lg text-center leading-[110%] font-semibold text-balance md:text-5xl text-4xl tracking-tight">
        Translate an entire season without losing names, tone, or context.
      </h1>

      {/* Subheading */}
      <div className="text-foreground md:text-lg/[150%] text-base/[150%] mt-6 text-center md:max-w-xl max-w-lg">
        <p>
          Mitsuko is an AI Subtitle Translator for SRT, VTT, and ASS files.
          Translate multiple subtitle in single click with context-awareness.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="rounded-full shadow-xs px-5 py-2.5">
          <Link href="/dashboard">
            {session ? "Dashboard" : "Try for Free!"}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-5 py-2.5">
          <Link href="/auth/login">
            {session ? "My Account" : "Sign In"}
          </Link>
        </Button>
      </div>

      {/* Video embed */}
      <div className="md:mt-24 mt-16 w-full max-w-5xl mx-auto overflow-hidden">
        <div
          style={{ aspectRatio: 1852 / 1080 }}
          className="relative select-none overflow-hidden bg-muted/50 md:rounded-3xl rounded-lg md:border-[3px] border-2 border-border"
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_center,var(--color-primary)/15,transparent_45%),linear-gradient(135deg,var(--color-muted),var(--color-background))] px-6 text-center transition-opacity duration-500"
            aria-hidden={shouldLoadVideo && isVideoLoaded}
          />
          <div
            ref={videoContainerRef}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 [&>div]:size-full [&_iframe]:size-full",
              isVideoLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </div>
    </div>
  )
}
