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
  extraction: Extraction | null
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
  const isRunning = extraction ? runningIds.has(extraction.id) : false
  const isOwned = extraction ? isAutoContextOwnedBy(extraction, translation.id) : false
  const extractionProblem = !extraction || isRunning
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

          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-1.5">
              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="text-sm font-medium">Preview final context</div>
                <div className="line-clamp-1 break-all text-xs text-muted-foreground">
                  {extraction?.title || "Context will be generated when translation starts"}
                  {extraction?.episodeNumber && ` · Episode ${extraction.episodeNumber}`}
                </div>
              </div>
            </div>
            {extraction && (
              <ExtractionBadges extraction={extraction} runningIds={runningIds} size="compact" className="shrink-0" />
            )}
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
          {extraction && (
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
          )}
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
