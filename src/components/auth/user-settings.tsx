"use client"

import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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

export function UserSettings() {
  const isThirdPartyModelEnabled = useLocalSettingsStore((state) => state.isThirdPartyModelEnabled)
  const toggleThirdPartyModel = useLocalSettingsStore((state) => state.toggleThirdPartyModel)
  const isFeedbackEnabled = useLocalSettingsStore((state) => state.isFeedbackEnabled)
  const toggleFeedbackHidden = useLocalSettingsStore((state) => state.toggleFeedbackHidden)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      setIsDialogOpen(true)
    } else {
      toggleThirdPartyModel()
    }
  }

  const handleConfirm = () => {
    toggleThirdPartyModel()
    setIsDialogOpen(false)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
  }

  const handleFeedbackCheckedChange = () => {
    toggleFeedbackHidden()
  }

  return (
    <>
      <div className="rounded-md overflow-hidden border">
        <div className="px-4 py-2 border-b">
          <h2 className="font-medium">User Settings</h2>
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
          <div className="flex items-center justify-between">
            <Label>
              Enable Feedback Button
            </Label>
            <Switch
              id="feedback-hidden-switch"
              checked={isFeedbackEnabled}
              onCheckedChange={handleFeedbackCheckedChange}
            />
          </div>
        </div>
      </div>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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