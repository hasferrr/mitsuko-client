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
import { SettingsTranscription } from "./settings-transcription"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"

interface TranscriptionSettingsDialogueProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  projectName: string
  defaultTranscriptionId: string
}

export const TranscriptionSettingsDialogue: React.FC<TranscriptionSettingsDialogueProps> = ({
  isOpen,
  onOpenChange,
  projectName,
  defaultTranscriptionId,
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
          <DialogTitle>Transcription Settings</DialogTitle>
          <DialogDescription>
            {`Default transcription settings for "${projectName}" will go here.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {data[defaultTranscriptionId] ? (
            <SettingsTranscription transcriptionId={defaultTranscriptionId} />
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </DialogCustom>
  )
}
