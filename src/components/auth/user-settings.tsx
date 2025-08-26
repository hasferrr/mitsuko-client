"use client"

import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SettingsDialogue } from "@/components/settings-dialogue"
import { GLOBAL_ADVANCED_SETTINGS_ID, GLOBAL_BASIC_SETTINGS_ID } from "@/constants/global-settings"
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
  const [isThirdPartyDialogOpen, setIsThirdPartyDialogOpen] = useState(false)
  const [isGlobalDefaultsOpen, setIsGlobalDefaultsOpen] = useState(false)

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
        <div className="px-4 py-2 border-b flex items-center justify-between">
          <h2 className="font-medium">User Settings</h2>
          <Button
            variant="outline"
            id="configure-global-defaults-button"
            onClick={() => setIsGlobalDefaultsOpen(true)}
          >
            <Settings2 className="h-4 w-4" />
            Global Settings
          </Button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label>
              Enable Third-Party Model
            </Label>
            <Switch
              id="third-party-model-switch"
              checked={isThirdPartyModelEnabled}
              onCheckedChange={handleCheckedChange}
            />
          </div>
        </div>
      </div>
      <SettingsDialogue
        isGlobal
        isOpen={isGlobalDefaultsOpen}
        onOpenChange={setIsGlobalDefaultsOpen}
        projectName="Global Settings"
        basicSettingsId={GLOBAL_BASIC_SETTINGS_ID}
        advancedSettingsId={GLOBAL_ADVANCED_SETTINGS_ID}
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