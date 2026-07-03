"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, ChevronUp, Loader2, OctagonX, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import {
  useProcessingIndicatorStore,
  type TrackedProcessingItem,
} from "@/stores/ui/use-processing-indicator-store"
import { useProcessingCompleteNotification } from "@/hooks/use-processing-complete-notification"
import type { ProjectType } from "@/types/project"

const TYPE_META: Record<ProjectType, { label: string; route: string }> = {
  translation: { label: "Translation", route: "/translate" },
  transcription: { label: "Transcription", route: "/transcribe" },
  extraction: { label: "Extraction", route: "/extract-context" },
}

const TYPE_ORDER: ProjectType[] = ["translation", "transcription", "extraction"]

export function ProcessingIndicator() {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isTranslatingSet = useTranslationStore((s) => s.isTranslatingSet)
  const isTranscribingSet = useTranscriptionStore((s) => s.isTranscribingSet)
  const isExtractingSet = useExtractionStore((s) => s.isExtractingSet)

  const reconcile = useProcessingIndicatorStore((s) => s.reconcile)
  const items = useProcessingIndicatorStore((s) => s.items)
  const clearItem = useProcessingIndicatorStore((s) => s.clearItem)
  const clearCompleted = useProcessingIndicatorStore((s) => s.clearCompleted)

  useProcessingCompleteNotification()

  useEffect(() => {
    reconcile({
      translation: isTranslatingSet,
      transcription: isTranscribingSet,
      extraction: isExtractingSet,
    })
  }, [isTranslatingSet, isTranscribingSet, isExtractingSet, reconcile])

  useEffect(() => {
    if (!expanded) return
    const handlePointer = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false)
    }
    document.addEventListener("pointerdown", handlePointer)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("pointerdown", handlePointer)
      document.removeEventListener("keydown", handleKey)
    }
  }, [expanded])

  const trackedItems = useMemo(() => Object.values(items), [items])
  const processingCount = useMemo(
    () => trackedItems.filter((i) => i.status === "processing").length,
    [trackedItems],
  )
  const completedCount = useMemo(
    () => trackedItems.filter((i) => i.status === "completed").length,
    [trackedItems],
  )
  const errorCount = useMemo(
    () => trackedItems.filter((i) => i.status === "error").length,
    [trackedItems],
  )
  const stoppedCount = useMemo(
    () => trackedItems.filter((i) => i.status === "stopped").length,
    [trackedItems],
  )
  const finishedCount = completedCount + errorCount + stoppedCount

  const grouped = useMemo<Record<ProjectType, TrackedProcessingItem[]> | null>(() => {
    if (!expanded) return null

    const groups: Record<ProjectType, TrackedProcessingItem[]> = {
      translation: [],
      transcription: [],
      extraction: [],
    }
    for (const item of trackedItems) groups[item.type].push(item)
    for (const type of TYPE_ORDER) {
      groups[type].sort((a, b) => {
        if (a.status === "processing" && b.status !== "processing") return -1
        if (b.status === "processing" && a.status !== "processing") return 1
        return (b.completedAt ?? 0) - (a.completedAt ?? 0)
      })
    }
    return groups
  }, [expanded, trackedItems])

  if (trackedItems.length === 0) return null

  const getLabel = (item: TrackedProcessingItem) => {
    switch (item.type) {
      case "translation":
        const tlData = useTranslationDataStore.getState().data
        return tlData[item.id]?.title || `Item ${item.id}`
      case "transcription":
        const tsData = useTranscriptionDataStore.getState().data
        return tsData[item.id]?.title || `Item ${item.id}`
      case "extraction": {
        const exData = useExtractionDataStore.getState().data
        const e = exData[item.id]
        if (e?.episodeNumber) return `Episode ${e.episodeNumber}`
        if (e?.title) return e.title
        return `Item ${item.id}`
      }
    }
  }

  const handleNavigate = (item: TrackedProcessingItem) => {
    if (item.type === "translation") {
      useTranslationDataStore.getState().setCurrentId(item.id)
    } else if (item.type === "transcription") {
      useTranscriptionDataStore.getState().setCurrentId(item.id)
    } else {
      useExtractionDataStore.getState().setCurrentId(item.id)
    }
    setExpanded(false)
    router.push(TYPE_META[item.type].route)
  }

  return (
    <div ref={containerRef} className="flex flex-col items-end gap-2">
      {expanded && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-150 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-popover/95 text-popover-foreground shadow-xl ring-1 ring-foreground/10 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <span className="text-sm font-semibold">Processing activity</span>
            {finishedCount > 0 && (
              <Button variant="ghost" size="xs" onClick={clearCompleted}>
                Clear finished
              </Button>
            )}
          </div>
          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto p-2">
            {TYPE_ORDER.map((type) => {
              const list = grouped?.[type] ?? []
              if (list.length === 0) return null
              return (
                <div key={type} className="flex flex-col gap-1">
                  <p className="px-1 text-xs font-medium text-muted-foreground">
                    {TYPE_META[type].label}
                  </p>
                  {list.map((item) => {
                    const key = `${item.type}:${item.id}`
                    const isProcessing = item.status === "processing"
                    const isError = item.status === "error"
                    const isStopped = item.status === "stopped"
                    const isFinished = !isProcessing
                    return (
                      <div
                        key={key}
                        className="group flex items-center gap-1 rounded-lg px-1.5 py-1.5 transition hover:bg-muted"
                      >
                        <button
                          onClick={() => handleNavigate(item)}
                          className="flex flex-1 items-center gap-2 overflow-hidden text-left text-sm"
                        >
                          {isProcessing ? (
                            <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                          ) : isError ? (
                            <AlertCircle className="size-4 shrink-0 text-destructive" />
                          ) : isStopped ? (
                            <OctagonX className="size-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                          )}
                          <span className={cn("truncate", isFinished && !isError && "text-muted-foreground")}>
                            {getLabel(item)}
                          </span>
                          {isError && (
                            <span className="ml-auto shrink-0 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                              Error
                            </span>
                          )}
                          {isStopped && (
                            <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Stopped
                            </span>
                          )}
                          {item.status === "completed" && (
                            <span className="ml-auto shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              Done
                            </span>
                          )}
                        </button>
                        {isFinished && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="shrink-0 opacity-60 transition group-hover:opacity-100"
                            onClick={() => clearItem(key)}
                            aria-label="Clear item"
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        aria-expanded={expanded}
        aria-label="Toggle processing activity"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2 rounded-full bg-card/85 px-3 py-2 text-sm text-card-foreground shadow-lg ring-1 ring-foreground/10 backdrop-blur-md transition-all hover:bg-card hover:shadow-xl"
      >
        {processingCount > 0 ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : errorCount > 0 ? (
          <AlertCircle className="size-4 text-destructive" />
        ) : stoppedCount > 0 ? (
          <OctagonX className="size-4 text-muted-foreground" />
        ) : (
          <CheckCircle2 className="size-4 text-emerald-500" />
        )}
        <span className="font-medium">
          {processingCount > 0
            ? `Processing ${processingCount}`
            : errorCount > 0
              ? `${errorCount} ${errorCount === 1 ? "issue" : "issues"}`
              : stoppedCount > 0
                ? `${stoppedCount} stopped`
              : `${completedCount} completed`}
        </span>
        {processingCount > 0 && completedCount > 0 && (
          <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            {completedCount} done
          </span>
        )}
        {processingCount === 0 && (errorCount > 0 || stoppedCount > 0) && completedCount > 0 && (
          <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            {completedCount} done
          </span>
        )}
        <ChevronUp
          className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-180")}
        />
      </button>
    </div>
  )
}
