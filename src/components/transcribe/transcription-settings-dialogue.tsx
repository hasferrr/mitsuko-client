"use client"

import { useEffect } from "react"
import { DialogCustom } from "@/components/ui-custom/dialog-custom"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SettingsTranscription } from "./settings-transcription"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"

interface TranscriptionSettingsDialogueProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  projectName: string
  defaultTranscriptionId: string
  isGlobal?: boolean
  isDefaultEnabled?: boolean
  onDefaultEnabledChange?: (enabled: boolean) => void
  onOpenGlobalSettings?: () => void
}

export const TranscriptionSettingsDialogue: React.FC<TranscriptionSettingsDialogueProps> = ({
  isOpen,
  onOpenChange,
  projectName,
  defaultTranscriptionId,
  isGlobal,
  isDefaultEnabled,
  onDefaultEnabledChange,
  onOpenGlobalSettings,
}) => {
  const getTranscriptionDb = useTranscriptionDataStore((s) => s.getTranscriptionDb)
  const data = useTranscriptionDataStore((s) => s.data)

  useEffect(() => {
    if (isOpen && !data[defaultTranscriptionId]) {
      getTranscriptionDb(defaultTranscriptionId)
    }
  }, [isOpen, defaultTranscriptionId, data, getTranscriptionDb])

  return (
    <DialogCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modal={false}
      fadeDuration={50}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isGlobal ? "Global Transcription Settings" : "Transcription Settings"}</DialogTitle>
          <DialogDescription>
            {isGlobal
              ? "Configure the default transcription settings for all new projects."
              : `Default transcription settings for "${projectName}" will go here.`}
          </DialogDescription>
        </DialogHeader>

        {!isGlobal && isDefaultEnabled !== undefined && onDefaultEnabledChange && (
          <div className="flex items-center justify-between gap-2 p-4 border rounded-md mb-4 bg-muted/20">
            <div className="flex flex-col gap-1">
              <Label htmlFor="enable-default-transcription">
                Enable Settings
              </Label>
              <p className="text-xs text-muted-foreground">
                When enabled, new transcriptions in this project will use these custom default settings. When disabled, they will use your Global Transcription Settings.
              </p>
            </div>
            <Switch
              id="enable-default-transcription"
              checked={isDefaultEnabled}
              onCheckedChange={onDefaultEnabledChange}
            />
          </div>
        )}

        <div className={`space-y-4 ${!isGlobal && isDefaultEnabled === false ? 'opacity-50 pointer-events-none' : ''}`}>
          {data[defaultTranscriptionId] ? (
            <SettingsTranscription transcriptionId={defaultTranscriptionId} />
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </div>
        <DialogFooter>
          {!isGlobal && onOpenGlobalSettings && (
            <Button variant="outline" className="mr-auto" onClick={onOpenGlobalSettings}>
              Global Settings
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </DialogCustom>
  )
}
