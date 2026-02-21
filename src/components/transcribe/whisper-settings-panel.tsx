"use client"

import { Button } from "@/components/ui/button"
import { Wand2, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useWhisperSettingsStore } from "@/stores/use-whisper-settings-store"
import { cn } from "@/lib/utils"

interface WhisperSettingsPanelProps {
  showApplyButton?: boolean
  onApplyClick?: () => void
  applyDisabled?: boolean
  className?: string
}

export function WhisperSettingsPanel({
  showApplyButton = false,
  onApplyClick,
  applyDisabled = false,
  className,
}: WhisperSettingsPanelProps) {
  const subtitleLevel = useWhisperSettingsStore((state) => state.subtitleLevel)
  const maxSilenceGap = useWhisperSettingsStore((state) => state.maxSilenceGap)
  const targetCps = useWhisperSettingsStore((state) => state.targetCps)
  const maxCps = useWhisperSettingsStore((state) => state.maxCps)
  const maxChars = useWhisperSettingsStore((state) => state.maxChars)
  const minDuration = useWhisperSettingsStore((state) => state.minDuration)

  const setSubtitleLevel = useWhisperSettingsStore((state) => state.setSubtitleLevel)
  const setMaxSilenceGap = useWhisperSettingsStore((state) => state.setMaxSilenceGap)
  const setTargetCps = useWhisperSettingsStore((state) => state.setTargetCps)
  const setMaxCps = useWhisperSettingsStore((state) => state.setMaxCps)
  const setMaxChars = useWhisperSettingsStore((state) => state.setMaxChars)
  const setMinDuration = useWhisperSettingsStore((state) => state.setMinDuration)
  const reset = useWhisperSettingsStore((state) => state.reset)

  return (
    <div className={cn("bg-card border border-border rounded-lg p-6", className)}>
      <h2 className="text-lg font-medium mb-4">Whisper transcription settings</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Subtitle level</p>
          <RadioGroup
            value={subtitleLevel}
            onValueChange={(value) => setSubtitleLevel(value as "words" | "segments")}
            className="flex flex-col sm:flex-row gap-4"
          >
            <label className="flex items-center gap-2 cursor-pointer text-sm" htmlFor="whisper-level-words">
              <RadioGroupItem id="whisper-level-words" value="words" />
              <span>Words</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm" htmlFor="whisper-level-segments">
              <RadioGroupItem id="whisper-level-segments" value="segments" />
              <span>Segments</span>
            </label>
          </RadioGroup>
        </div>

        {subtitleLevel === "words" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <Label
                htmlFor="whisper-max-silence"
                title="Max gap between words (in seconds) to consider them part of the same phrase. Longer gaps force a new subtitle."
              >
                Max silence gap (seconds)
              </Label>
              <Input
                id="whisper-max-silence"
                type="number"
                step="0.1"
                min="0"
                value={maxSilenceGap}
                onChange={(e) => setMaxSilenceGap(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="whisper-min-duration"
                title="Try not to make subtitles shorter than this duration, so they stay on screen long enough to read."
              >
                Minimum duration (seconds)
              </Label>
              <Input
                id="whisper-min-duration"
                type="number"
                step="0.1"
                min="0"
                value={minDuration}
                onChange={(e) => setMinDuration(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="whisper-target-cps"
                title="Character Per Second (CPS). Controls reading speed."
              >
                Target CPS
              </Label>
              <Input
                id="whisper-target-cps"
                type="number"
                min="1"
                value={targetCps}
                onChange={(e) => setTargetCps(Number(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="whisper-max-cps"
                title="Maximum allowed CPS before forcing split."
              >
                Max CPS
              </Label>
              <Input
                id="whisper-max-cps"
                type="number"
                min="1"
                value={maxCps}
                onChange={(e) => setMaxCps(Number(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="whisper-max-chars"
                title="Fallback limit for maximum characters per subtitle block. Higher values allow longer lines. Roughly 2 lines of 42 chars"
              >
                Max characters per subtitle
              </Label>
              <Input
                id="whisper-max-chars"
                type="number"
                min="1"
                value={maxChars}
                onChange={(e) => setMaxChars(Number(e.target.value) || 1)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {showApplyButton && (
            <Button
              size="sm"
              variant="outline"
              className="border-border"
              onClick={onApplyClick}
              disabled={applyDisabled}
            >
              <Wand2 className="h-3 w-3" />
              Apply Whisper subtitles
            </Button>
          )}
          {subtitleLevel === "words" && (
            <Button
              size="sm"
              variant="outline"
              className="border-border"
              onClick={reset}
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}