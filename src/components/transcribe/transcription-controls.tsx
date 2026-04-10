"use client"

import { Button } from "@/components/ui/button"
import {
  Wand2,
  Clock,
  Loader2,
  Square,
} from "lucide-react"
import { SettingsTranscription } from "./settings-transcription"
import { isModelDurationLimitExceeded, getModel } from "@/constants/transcription"
import { cn } from "@/lib/utils"
import type { TranscriptionModel } from "@/types/project"

interface TranscriptionControlsProps {
  currentId: string
  settingsId?: string
  isSharedSettings?: boolean
  models: TranscriptionModel | null
  localAudioDuration: number | undefined
  isTranscribing: boolean
  isGlobalMaxDurationExceeded: boolean
  session: unknown
  onStart: () => void
  onStop: () => void
  onSetRightTab: (tab: "transcript" | "subtitles") => void
}

export function TranscriptionControls({
  currentId,
  settingsId,
  isSharedSettings,
  models,
  localAudioDuration,
  isTranscribing,
  isGlobalMaxDurationExceeded,
  session,
  onStart,
  onStop,
  onSetRightTab,
}: TranscriptionControlsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Transcription Settings</h2>

      <div className="space-y-4">
        <div className={cn("space-y-4", isSharedSettings && "pointer-events-none opacity-50")}>
          {isSharedSettings && (
            <p className="text-sm font-semibold">Shared Settings (Applied to all files)</p>
          )}
          <SettingsTranscription transcriptionId={settingsId ?? currentId} />
        </div>

        {isModelDurationLimitExceeded(models, localAudioDuration || 0) && (
          <div className="flex items-center gap-2 text-red-600 text-xs">
            <div className="size-3">
              <Clock className="size-3" />
            </div>
            <p>
              {models ? `${models} model has ${(getModel(models)?.maxDuration || 0) / 60} minutes limit.` : ""}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isTranscribing || !session || isGlobalMaxDurationExceeded}
            onClick={() => {
              onSetRightTab("transcript")
              onStart()
            }}
          >
            {isTranscribing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Transcribing
              </>
            ) : (
              <>
                <Wand2 className="size-4" />
                {session ? "Transcribe" : "Sign in to Start"}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            disabled={!isTranscribing}
            onClick={onStop}
          >
            <Square className="size-4" />
            Stop
          </Button>
        </div>
      </div>
    </div>
  )
}
