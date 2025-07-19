"use client"

import { memo, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export const FullContextMemorySwitch = memo(() => {
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.getIsUseFullContextMemory())
  const setIsUseFullContextMemory = useAdvancedSettingsStore((state) => state.setIsUseFullContextMemory)
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
        When enabled, it's using all previous chunks to improve translation
        consistency and accuracy, but drastically increases token usage and the risk of hitting
        input token limits. Only for models with large context windows (128k+ tokens).
        When disabled, it's only including the last previous chunk.
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