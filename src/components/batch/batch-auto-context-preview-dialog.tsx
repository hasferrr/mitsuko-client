"use client"

import { ExternalLink, FileText } from "lucide-react"
import { ExtractionBadges } from "@/components/extract-context/extraction-badges"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getBatchAutoContextPreview, getExtractionProblem } from "@/lib/translation/auto-context"
import { isAutoContextOwnedBy } from "@/lib/extraction/status"
import { Extraction, Translation } from "@/types/project"

interface BatchAutoContextPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  translation: Translation
  extraction: Extraction
  contextDocument: string
  autoContextEnabled: boolean
  runningIds: Set<string>
  onOpenExtraction: (extractionId: string) => void
}

export function BatchAutoContextPreviewDialog({
  open,
  onOpenChange,
  translation,
  extraction,
  contextDocument,
  autoContextEnabled,
  runningIds,
  onOpenExtraction,
}: BatchAutoContextPreviewDialogProps) {
  const isRunning = runningIds.has(extraction.id)
  const isOwned = isAutoContextOwnedBy(extraction, translation.id)
  const extractionProblem = isRunning
    ? null
    : getExtractionProblem(extraction, translation.projectId, runningIds)
  const preview = getBatchAutoContextPreview({
    contextDocument,
    enabled: autoContextEnabled,
    extraction,
    isOwned,
    isRunning,
    extractionProblem,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Auto Context Preview</DialogTitle>
          <DialogDescription>
            Final context that will be sent when translating “{translation.title || "Untitled Translation"}”.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {!autoContextEnabled && (
            <Alert>
              <AlertDescription>
                Batch Auto Context is off, so the linked extraction is not included.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <FileText className="size-4 text-muted-foreground" />
              Preview final context
            </div>
            <ExtractionBadges extraction={extraction} runningIds={runningIds} size="compact" />
          </div>

          {preview ? (
            <div className="min-h-[100px] max-h-[280px] overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-muted/30 p-3 text-xs">
              {preview}
            </div>
          ) : (
            <div className="rounded-md bg-muted/30 py-8 text-center text-xs text-muted-foreground">
              No context will be sent.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              onOpenExtraction(extraction.id)
            }}
          >
            <ExternalLink data-icon="inline-start" />
            Open Linked Extraction
          </Button>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
