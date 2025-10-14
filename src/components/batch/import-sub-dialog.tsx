"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useMemo, useState } from "react"
import type { BatchFile } from "@/types/batch"
import { ListChecks, ListX } from "lucide-react"

interface ImportSubDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  translationBatchFiles: BatchFile[]
  onConfirm: (selectedIds: string[]) => void | Promise<void>
  isLoading?: boolean
}

export function ImportSubDialog({
  open,
  onOpenChange,
  translationBatchFiles,
  onConfirm,
  isLoading,
}: ImportSubDialogProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  // Initialize selection (default select all) when opened or list changes
  useEffect(() => {
    if (!open) return
    const init: Record<string, boolean> = {}
    translationBatchFiles.forEach(f => { init[f.id] = true })
    setSelected(init)
  }, [open, translationBatchFiles])

  const selectedIds = useMemo(
    () => translationBatchFiles.filter(f => selected[f.id]).map(f => f.id),
    [translationBatchFiles, selected]
  )
  const selectedCount = selectedIds.length
  const totalFiles = translationBatchFiles.length

  const handleToggle = (id: string, checked: boolean) => {
    setSelected(prev => ({ ...prev, [id]: checked }))
  }

  const handleSelectAll = (checked: boolean) => {
    const next: Record<string, boolean> = {}
    translationBatchFiles.forEach(f => { next[f.id] = checked })
    setSelected(next)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Import Subtitles</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>Select which translations to import as extractions. Default is all selected.</p>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleSelectAll(true)} disabled={!!isLoading || totalFiles === 0}>
              <ListChecks className="h-4 w-4" />
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleSelectAll(false)} disabled={!!isLoading || totalFiles === 0}>
              <ListX className="h-4 w-4" />
              Deselect All
            </Button>
            <div className="ml-auto text-xs text-muted-foreground">
              Selected <span className="font-medium">{selectedCount}</span> of {totalFiles}
            </div>
          </div>

          {/* List */}
          <div className="border rounded-md divide-y max-h-[360px] overflow-y-auto">
            {translationBatchFiles.length === 0 ? (
              <p className="text-muted-foreground p-3">No translations in this batch.</p>
            ) : (
              translationBatchFiles.map((t) => (
                <label key={t.id} htmlFor={`imp-sub-${t.id}`} className="p-3 flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    id={`imp-sub-${t.id}`}
                    checked={!!selected[t.id]}
                    onCheckedChange={(v) => handleToggle(t.id, Boolean(v))}
                    disabled={!!isLoading}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium break-words break-all line-clamp-2">{t.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">{t.subtitlesCount} lines, status: {t.status}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          <p>
            New <span className="font-semibold">{selectedCount}</span> extraction{selectedCount === 1 ? "" : "s"} will be added to the batch.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={!!isLoading}>Cancel</Button>
          <Button onClick={() => onConfirm(selectedIds)} disabled={!!isLoading || selectedCount === 0}>
            {isLoading ? "Creating..." : `Create ${selectedCount || ""} Extraction${selectedCount === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
