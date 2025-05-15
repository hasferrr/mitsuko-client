"use client"

import { DialogCustom } from "@/components/ui-custom/dialog-custom"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LanguageSelection, ModelSelection } from "@/components/settings-inputs"
import { Button } from "@/components/ui/button"

interface SettingsDialogueProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  projectName: string
}

export const SettingsDialogue: React.FC<SettingsDialogueProps> = ({
  isOpen,
  onOpenChange,
  projectName,
}) => {
  return (
    <DialogCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modal={false}
      fadeDuration={50}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Default settings for "{projectName}" will go here.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <LanguageSelection type="project" />
          <ModelSelection
            type="project"
            showUseCustomModelSwitch={false}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {/* <Button type="submit">Save</Button> */}
        </DialogFooter>
      </DialogContent>
    </DialogCustom>
  )
}