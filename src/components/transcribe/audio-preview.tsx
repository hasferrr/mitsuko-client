"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface AudioPreviewProps {
  src: string
  onError: () => void
}

function formatPlaybackTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00"

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function AudioPreview({ src, onError }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
  }, [src])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        onError()
      }
      return
    }

    audio.pause()
  }

  const handleSeek = ([nextTime]: number[]) => {
    const audio = audioRef.current
    if (!audio || nextTime === undefined) return

    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const updateDuration = () => {
    const nextDuration = audioRef.current?.duration ?? 0
    setDuration(Number.isFinite(nextDuration) ? nextDuration : 0)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 ring-1 ring-foreground/10">
      <audio
        ref={audioRef}
        src={src}
        onDurationChange={updateDuration}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={onError}
      />
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="shrink-0"
        aria-label={isPlaying ? "Pause audio preview" : "Play audio preview"}
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
      </Button>
      <Slider
        value={[Math.min(currentTime, duration)]}
        min={0}
        max={duration || 1}
        step={0.1}
        disabled={!duration}
        aria-label="Audio preview progress"
        onValueChange={handleSeek}
      />
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {formatPlaybackTime(currentTime)} / {formatPlaybackTime(duration)}
      </span>
    </div>
  )
}
