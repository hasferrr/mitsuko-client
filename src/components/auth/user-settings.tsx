"use client"

import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SettingsDialogue } from "@/components/settings-dialogue"
import {
  GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID,
  GLOBAL_EXTRACTION_BASIC_SETTINGS_ID,
  GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID,
  GLOBAL_TRANSLATION_BASIC_SETTINGS_ID,
  GLOBAL_TRANSCRIPTION_SETTINGS_ID
} from "@/constants/global-settings"
import { TranscriptionSettingsDialogue } from "@/components/transcribe/transcription-settings-dialogue"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Settings2 } from "lucide-react"

export function UserSettings() {
  const isThirdPartyModelEnabled = useLocalSettingsStore((state) => state.isThirdPartyModelEnabled)
  const toggleThirdPartyModel = useLocalSettingsStore((state) => state.toggleThirdPartyModel)
  const isSubtitlePerformanceModeEnabled = useLocalSettingsStore((state) => state.isSubtitlePerformanceModeEnabled)
  const setIsSubtitlePerformanceModeEnabled = useLocalSettingsStore((state) => state.setIsSubtitlePerformanceModeEnabled)
  const [isThirdPartyDialogOpen, setIsThirdPartyDialogOpen] = useState(false)
  const [isGlobalTranslationSettingsOpen, setIsGlobalTranslationSettingsOpen] = useState(false)
  const [isGlobalExtractionSettingsOpen, setIsGlobalExtractionSettingsOpen] = useState(false)
  const [isGlobalTranscriptionSettingsOpen, setIsGlobalTranscriptionSettingsOpen] = useState(false)

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      setIsThirdPartyDialogOpen(true)
    } else {
      toggleThirdPartyModel()
    }
  }

  const handleConfirm = () => {
    toggleThirdPartyModel()
    setIsThirdPartyDialogOpen(false)
  }

  const handleCancel = () => {
    setIsThirdPartyDialogOpen(false)
  }

  return (
    <>
      <div className="rounded-md overflow-hidden border">
        <div className="px-4 py-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-medium">User Settings</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setIsGlobalTranslationSettingsOpen(true)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Global Translation
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsGlobalTranscriptionSettingsOpen(true)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Global Transcription
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsGlobalExtractionSettingsOpen(true)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Global Extraction
            </Button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-2">
              <Label>
                Enable Third-Party Model
              </Label>
              <p className="text-xs text-muted-foreground max-w-lg">
                Allow Mitsuko to access additional custom models from third-party providers using your own API keys. A small fee may apply.
              </p>
            </div>
            <Switch
              id="third-party-model-switch"
              checked={isThirdPartyModelEnabled}
              onCheckedChange={handleCheckedChange}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-2">
              <Label>
                Disable performance mode
              </Label>
              <p className="text-xs text-muted-foreground max-w-lg">
                Turn off performance optimizations for subtitle operations. This can improve quality on some devices but may feel laggy.
              </p>
            </div>
            <Switch
              id="subtitle-performance-mode-switch"
              checked={!isSubtitlePerformanceModeEnabled}
              onCheckedChange={(checked) => setIsSubtitlePerformanceModeEnabled(!checked)}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-2">
              <Label>
                Enable default settings for new projects
              </Label>
              <p className="text-xs text-muted-foreground max-w-lg">
                When enabled, new projects will have their individual "Enable Default" switches turned on by default for translation, extraction, and transcription.
              </p>
            </div>
            <Switch
              id="default-settings-enabled-default-switch"
              checked={useLocalSettingsStore((state) => state.isDefaultSettingsEnabledDefault)}
              onCheckedChange={(checked) => useLocalSettingsStore.getState().setIsDefaultSettingsEnabledDefault(checked)}
            />
          </div>
        </div>
      </div>
      <SettingsDialogue
        isGlobal
        isOpen={isGlobalTranslationSettingsOpen}
        onOpenChange={setIsGlobalTranslationSettingsOpen}
        projectName="Global Translation Settings"
        basicSettingsId={GLOBAL_TRANSLATION_BASIC_SETTINGS_ID}
        advancedSettingsId={GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID}
        settingsParentType="translation"
      />
      <TranscriptionSettingsDialogue
        isGlobal
        isOpen={isGlobalTranscriptionSettingsOpen}
        onOpenChange={setIsGlobalTranscriptionSettingsOpen}
        projectName="Global Transcription Settings"
        defaultTranscriptionId={GLOBAL_TRANSCRIPTION_SETTINGS_ID}
      />
      <SettingsDialogue
        isGlobal
        isOpen={isGlobalExtractionSettingsOpen}
        onOpenChange={setIsGlobalExtractionSettingsOpen}
        projectName="Global Extraction Settings"
        basicSettingsId={GLOBAL_EXTRACTION_BASIC_SETTINGS_ID}
        advancedSettingsId={GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID}
        settingsParentType="extraction"
      />
      <AlertDialog open={isThirdPartyDialogOpen} onOpenChange={setIsThirdPartyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Third-Party Model?</AlertDialogTitle>
            <AlertDialogDescription>
              Enabling this option will allow the application to use third-party models. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}