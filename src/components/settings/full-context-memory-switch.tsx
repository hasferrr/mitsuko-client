"use client"

import { memo, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface Props {
  advancedSettingsId: string
}

export const FullContextMemorySwitch = memo(({ advancedSettingsId }: Props) => {
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.getIsUseFullContextMemory(advancedSettingsId))
  const setAdvancedSettingsValue = useAdvancedSettingsStore((state) => state.setAdvancedSettingsValue)
  const setIsUseFullContextMemory = (value: boolean) => setAdvancedSettingsValue(advancedSettingsId, "isUseFullContextMemory", value)

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      setIsConfirmDialogOpen(true)
    } else {
      setIsUseFullContextMemory(false)
    }
  }

  const handleConfirm = () => {
    setIsUseFullContextMemory(true)
    setIsConfirmDialogOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Full Context Memory</label>
        <Switch
          checked={isUseFullContextMemory}
          onCheckedChange={handleCheckedChange}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        When enabled, it uses all previous chunks as context to improve translation,
        but drastically increases input token usage and may result in response quality
        degradation. Only for models with large context windows (128k+ tokens).
        When disabled, it includes only the last previous chunk.
      </p>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Full Context Memory?</DialogTitle>
            <DialogDescription className="pt-2">
              Warning: This feature uses all previous chunks for context,
              which significantly increases token usage and costs. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})