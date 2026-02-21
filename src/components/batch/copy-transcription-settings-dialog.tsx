"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { BatchFile } from "@/types/batch"
import { useTranscriptionDataStore, TranscriptionSettingKey } from "@/stores/data/use-transcription-data-store"
import { ListChecks, ListX, Loader2 } from "lucide-react"

interface CopyTranscriptionSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  batchFiles: BatchFile[]
  defaultTranscriptionId: string
}

const SETTING_KEY_LABELS: Record<TranscriptionSettingKey, string> = {
  language: "Language",
  selectedMode: "Mode (clause/sentence)",
  customInstructions: "Custom Instructions",
  models: "Model",
}

const ALL_KEYS: TranscriptionSettingKey[] = ['language', 'selectedMode', 'customInstructions', 'models']

export function CopyTranscriptionSettingsDialog({
  open,
  onOpenChange,
  batchFiles,
  defaultTranscriptionId,
}: CopyTranscriptionSettingsDialogProps) {
  const transcriptionIds = useMemo(() => batchFiles.map(b => b.id), [batchFiles])

  // Store
  const getTranscriptionsDb = useTranscriptionDataStore(s => s.getTranscriptionsDb)
  const transcriptionStore = useTranscriptionDataStore(s => s.data)
  const copyTranscriptionSettingsKeys = useTranscriptionDataStore(s => s.copyTranscriptionSettingsKeys)

  // Local selection state
  const [selectedKeys, setSelectedKeys] = useState<Set<TranscriptionSettingKey>>(new Set())

  const [isLoading, setIsLoading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // Initialize and ensure data is loaded when opening
  useEffect(() => {
    if (!open) return
    let cancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        await getTranscriptionsDb(transcriptionIds)
        if (cancelled) return
        // default: no selection
        setSelectedKeys(new Set())
      } catch (e) {
        console.error("Failed to load transcriptions for Copy Settings dialog", e)
        toast.error("Failed to load items")
      } finally {
        setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transcriptionIds.join("|")])

  // Helpers
  const toggleKey = (key: TranscriptionSettingKey) => {
    setSelectedKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const setAll = (checked: boolean) => {
    setSelectedKeys(checked ? new Set(ALL_KEYS) : new Set())
  }

  const handleApply = async () => {
    const keys = Array.from(selectedKeys)

    if (keys.length === 0) {
      toast.message("Nothing selected")
      return
    }

    setIsApplying(true)
    try {
      let applied = 0
      const ops: Promise<void>[] = []

      // Apply to all transcriptions
      for (const tId of transcriptionIds) {
        const transcription = transcriptionStore[tId]
        if (!transcription) continue
        ops.push(copyTranscriptionSettingsKeys(defaultTranscriptionId, tId, keys))
        applied += 1
      }

      await Promise.all(ops)

      if (applied > 0) {
        toast.success(`Copied settings to ${applied} transcription${applied === 1 ? '' : 's'}`)
        onOpenChange(false)
      } else {
        toast.message("Nothing to apply")
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to copy settings")
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Copy Shared Settings to All Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Transcription Settings</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setAll(true)} disabled={isLoading}>
                  <ListChecks className="h-4 w-4" />
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAll(false)} disabled={isLoading}>
                  <ListX className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {ALL_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={selectedKeys.has(key)} onCheckedChange={() => toggleKey(key)} />
                  {SETTING_KEY_LABELS[key]}
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isApplying || isLoading || transcriptionIds.length === 0}>
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
