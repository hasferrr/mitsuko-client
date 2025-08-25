"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ImportSubDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalFiles: number
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function ImportSubDialog({
  open,
  onOpenChange,
  totalFiles,
  onConfirm,
  isLoading,
}: ImportSubDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Import Subtitles</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p>Create extractions from all translations in this batch.</p>
          <p>New <span className="font-semibold">{totalFiles}</span> extraction{totalFiles === 1 ? "" : "s"} will be added to the batch.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={!!isLoading}>Cancel</Button>
          <Button onClick={onConfirm} disabled={!!isLoading}>
            {isLoading ? "Creating..." : "Create Extractions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
