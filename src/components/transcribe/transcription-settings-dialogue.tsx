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
import { GLOBAL_TRANSCRIPTION_SETTINGS_ID } from "@/constants/global-settings"
import { DEFAULT_TRANSCRIPTION_SETTINGS } from "@/constants/default"
import { Settings2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BaseTranscriptionSettingsDialogueProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  defaultTranscriptionId: string
}

interface GlobalTranscriptionSettingsDialogueProps extends BaseTranscriptionSettingsDialogueProps {
  mode: 'global'
}

interface ProjectTranscriptionSettingsDialogueProps extends BaseTranscriptionSettingsDialogueProps {
  mode: 'project'
  projectName: string
  isDefaultEnabled?: boolean
  onDefaultEnabledChange?: (enabled: boolean) => void
  onOpenGlobalSettings?: () => void
}

type TranscriptionSettingsDialogueProps = GlobalTranscriptionSettingsDialogueProps | ProjectTranscriptionSettingsDialogueProps

export const TranscriptionSettingsDialogue: React.FC<TranscriptionSettingsDialogueProps> = (props) => {
  const {
    isOpen,
    onOpenChange,
    defaultTranscriptionId,
  } = props

  const isGlobal = props.mode === 'global'
  const projectName = props.mode === 'project' ? props.projectName : ''
  const isDefaultEnabled = props.mode === 'project' ? props.isDefaultEnabled : undefined
  const onDefaultEnabledChange = props.mode === 'project' ? props.onDefaultEnabledChange : undefined
  const onOpenGlobalSettings = props.mode === 'project' ? props.onOpenGlobalSettings : undefined
  const getTranscriptionDb = useTranscriptionDataStore((s) => s.getTranscriptionDb)
  const updateTranscriptionDb = useTranscriptionDataStore((s) => s.updateTranscriptionDb)
  const copyTranscriptionSettingsKeys = useTranscriptionDataStore((s) => s.copyTranscriptionSettingsKeys)
  const data = useTranscriptionDataStore((s) => s.data)

  const handleResetAll = async () => {
    if (isGlobal) {
      await updateTranscriptionDb(defaultTranscriptionId, {
        language: DEFAULT_TRANSCRIPTION_SETTINGS.language,
        selectedMode: DEFAULT_TRANSCRIPTION_SETTINGS.selectedMode,
        customInstructions: DEFAULT_TRANSCRIPTION_SETTINGS.customInstructions,
        models: DEFAULT_TRANSCRIPTION_SETTINGS.models,
      })
    } else {
      await copyTranscriptionSettingsKeys(
        GLOBAL_TRANSCRIPTION_SETTINGS_ID,
        defaultTranscriptionId,
        ['language', 'selectedMode', 'customInstructions', 'models']
      )
    }
  }

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
                When enabled, new transcriptions will use these custom default settings. When disabled, they will use your Global Transcription Settings.
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
              <Settings2 className="h-4 w-4" />
              Global Settings
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                Reset All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  {isGlobal
                    ? "This will reset settings to defaults."
                    : "This will reset to global settings."
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetAll}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </DialogCustom>
  )
}
