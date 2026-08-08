"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, ArrowLeft, Loader2, ListChecks, ListX, ListRestart, Unlink } from "lucide-react"
import type { BatchFile } from "@/types/batch"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"

interface LinkContextDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  translationBatchFiles: BatchFile[]
  extractionBatchFiles: BatchFile[]
  startingExtractionId?: string | null
}

const UNLINK_CONTEXT_VALUE = "__unlink-context__"

export function LinkContextDialog({
  open,
  onOpenChange,
  translationBatchFiles,
  extractionBatchFiles,
  startingExtractionId = null,
}: LinkContextDialogProps) {
  const translationIds = useMemo(() => translationBatchFiles.map(b => b.id), [translationBatchFiles])
  const mappingExtractionBatchFiles = useMemo(
    () => extractionBatchFiles.filter(file => file.id !== startingExtractionId),
    [extractionBatchFiles, startingExtractionId],
  )
  const extractionIds = useMemo(
    () => mappingExtractionBatchFiles.map(b => b.id),
    [mappingExtractionBatchFiles],
  )

  // Stores
  const getTranslationsDb = useTranslationDataStore(s => s.getTranslationsDb)
  const translationStore = useTranslationDataStore(s => s.data)
  const updateBatchAutoContextLinksDb = useTranslationDataStore(s => s.updateBatchAutoContextLinksDb)
  const getExtractionsDb = useExtractionDataStore(s => s.getExtractionsDb)

  // Local state
  const [mapping, setMapping] = useState<Record<string, string | null>>({})
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // Build quick lookup for extraction index and label
  const extractionIndexById = useMemo(() => {
    const map = new Map<string, number>()
    extractionIds.forEach((id, idx) => map.set(id, idx))
    return map
  }, [extractionIds])

  // Initialize when opened
  useEffect(() => {
    if (!open) return
    let cancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        // Ensure data is in stores
        await Promise.all([
          getTranslationsDb(translationIds),
          getExtractionsDb(extractionIds),
        ])
        if (cancelled) return
        const loadedTranslations = useTranslationDataStore.getState().data
        const initMap: Record<string, string | null> = {}
        const initSel: Record<string, boolean> = {}
        for (let i = 0; i < translationIds.length; i++) {
          const tId = translationIds[i]
          const linkedId = loadedTranslations[tId]?.autoContextExtractionId
          const eId = linkedId && extractionIds.includes(linkedId)
            ? linkedId
            : extractionIds[i] ?? null
          initMap[tId] = eId
          initSel[tId] = !!eId
        }
        setMapping(initMap)
        setSelected(initSel)
      } catch (e) {
        console.error("Failed to load items for Link Context dialog", e)
        toast.error("Failed to load items")
      } finally {
        setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
    // oxlint-disable-next-line react/exhaustive-deps
  }, [open, translationIds.join("|"), extractionIds.join("|")])

  const handleShift = (tId: string, dir: -1 | 1) => {
    const cur = mapping[tId]
    if (!extractionIds.length) return
    const curIdx = cur ? (extractionIndexById.get(cur) ?? 0) : 0
    let nextIdx = (curIdx + dir) % extractionIds.length
    if (nextIdx < 0) nextIdx = extractionIds.length - 1
    const nextId = extractionIds[nextIdx]
    setMapping(prev => ({ ...prev, [tId]: nextId }))
    setSelected(prev => ({ ...prev, [tId]: true }))
  }

  const handleShiftAll = (dir: -1 | 1) => {
    if (!extractionIds.length) return
    setMapping(prev => {
      const next: Record<string, string | null> = {}
      for (const tId of translationIds) {
        const cur = prev[tId]
        const curIdx = cur ? (extractionIndexById.get(cur) ?? 0) : 0
        let nextIdx = (curIdx + dir) % extractionIds.length
        if (nextIdx < 0) nextIdx = extractionIds.length - 1
        next[tId] = extractionIds[nextIdx]
      }
      return next
    })
    setSelected(() => {
      const nextSel: Record<string, boolean> = {}
      for (const tId of translationIds) {
        nextSel[tId] = true
      }
      return nextSel
    })
  }

  const handleSelectChange = (tId: string, value: string) => {
    const extractionId = value === UNLINK_CONTEXT_VALUE ? null : value
    setMapping(prev => ({ ...prev, [tId]: extractionId }))
    setSelected(prev => ({ ...prev, [tId]: true }))
  }

  const handleUnlink = (tId: string) => {
    setMapping(prev => ({ ...prev, [tId]: null }))
    setSelected(prev => ({ ...prev, [tId]: true }))
  }

  const handleToggleSelected = (tId: string, checked: boolean) => {
    setSelected(prev => ({ ...prev, [tId]: checked }))
  }

  const handleSelectAllToggle = () => {
    // Determine current selection state
    const isAllSelected = translationIds.length > 0 && translationIds.every(tid => !!selected[tid])
    const isSomeState = translationIds.every(tid => (!!selected[tid]) === (!!mapping[tid]))

    const next: Record<string, boolean> = {}
    if (isAllSelected) {
      // When currently "all", toggle back to "some" (only items with a mapping)
      translationIds.forEach(tid => { next[tid] = !!mapping[tid] })
    } else if (isSomeState) {
      // When currently "some", toggle to "all"
      translationIds.forEach(tid => { next[tid] = true })
    } else {
      // From any other mixed state, go to "some" first
      translationIds.forEach(tid => { next[tid] = !!mapping[tid] })
    }
    setSelected(next)
  }

  const handleDeselectAll = () => {
    const next: Record<string, boolean> = {}
    translationIds.forEach(tid => { next[tid] = false })
    setSelected(next)
  }

  const handleUnlinkAll = () => {
    const nextMapping: Record<string, null> = {}
    const nextSelected: Record<string, boolean> = {}
    translationIds.forEach(tid => {
      nextMapping[tid] = null
      nextSelected[tid] = true
    })
    setMapping(nextMapping)
    setSelected(nextSelected)
  }

  const handleResetMapping = () => {
    const initMap: Record<string, string | null> = {}
    const initSel: Record<string, boolean> = {}
    for (let i = 0; i < translationIds.length; i++) {
      const tId = translationIds[i]
      const eId = extractionIds[i] ?? null
      initMap[tId] = eId
      initSel[tId] = !!eId
    }
    setMapping(initMap)
    setSelected(initSel)
  }

  const handleApply = async () => {
    setIsApplying(true)
    try {
      const selectedTranslationIds = new Set(
        translationIds.filter(translationId => selected[translationId]),
      )
      const links = translationIds.flatMap(translationId => {
        const extractionId = mapping[translationId]
        return selected[translationId] && extractionId
          ? [{ translationId, extractionId }]
          : []
      })

      const currentTranslations = useTranslationDataStore.getState().data
      const linkedIdByTranslation = new Map(links.map(link => [link.translationId, link.extractionId]))

      let previousExtractionId = startingExtractionId
      const previousIdByExtractionId = new Map<string, string | null>()
      const translationChanges = new Map<string, {
        autoContextMode: "create-new" | "use-existing"
        autoContextExtractionId: string | null
        autoContextPreviousMode: "selected" | "none"
        autoContextPreviousExtractionId: string | null
      }>()
      for (const translationId of translationIds) {
        const linkedId = linkedIdByTranslation.get(translationId)
        if (linkedId) {
          const linkedPreviousId = previousIdByExtractionId.has(linkedId)
            ? previousIdByExtractionId.get(linkedId) ?? null
            : previousExtractionId
          previousIdByExtractionId.set(linkedId, linkedPreviousId)
          translationChanges.set(translationId, {
            autoContextMode: "use-existing",
            autoContextExtractionId: linkedId,
            autoContextPreviousMode: linkedPreviousId ? "selected" : "none",
            autoContextPreviousExtractionId: linkedPreviousId,
          })
        } else if (selectedTranslationIds.has(translationId)) {
          translationChanges.set(translationId, {
            autoContextMode: "create-new",
            autoContextExtractionId: null,
            autoContextPreviousMode: previousExtractionId ? "selected" : "none",
            autoContextPreviousExtractionId: previousExtractionId,
          })
        }

        const projectedExtractionId = selectedTranslationIds.has(translationId)
          ? linkedId
          : currentTranslations[translationId]?.autoContextExtractionId
        previousExtractionId = projectedExtractionId ?? null
      }

      await updateBatchAutoContextLinksDb({
        translations: [...translationChanges].map(([id, changes]) => ({ id, changes })),
      })

      const unlinkedCount = [...selectedTranslationIds].filter(translationId => !linkedIdByTranslation.has(translationId)).length
      if (links.length > 0 && unlinkedCount > 0) {
        toast.success(`Updated context links for ${links.length + unlinkedCount} translations`)
      } else if (links.length > 0) {
        toast.success(`Linked context for ${links.length} translation${links.length === 1 ? "" : "s"}`)
      } else if (unlinkedCount > 0) {
        toast.success(`Unlinked context from ${unlinkedCount} translation${unlinkedCount === 1 ? "" : "s"}`)
      } else {
        toast.message("Nothing to update")
      }
      onOpenChange(false)
    } catch (e) {
      console.error(e)
      toast.error("Failed to link context")
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Link Context Extractions to Translations</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAllToggle} disabled={isLoading || translationIds.length === 0}>
              <ListChecks data-icon="inline-start" />
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll} disabled={isLoading || translationIds.length === 0}>
              <ListX data-icon="inline-start" />
              Deselect All
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetMapping} disabled={isLoading}>
              <ListRestart data-icon="inline-start" />
              Reset Mapping
            </Button>
            <Button variant="outline" size="sm" onClick={handleUnlinkAll} disabled={isLoading || translationIds.length === 0}>
              <Unlink data-icon="inline-start" />
              Unlink All
            </Button>

            {/* Shift all mappings */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShiftAll(-1)}
                disabled={isLoading || extractionIds.length === 0}
                aria-label="Shift all mappings left"
              >
                <ChevronLeft />
              </Button>
              <Button variant="outline" asChild>
                <span className="pointer-events-none" aria-hidden>
                  Shift All
                </span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShiftAll(+1)}
                disabled={isLoading || extractionIds.length === 0}
                aria-label="Shift all mappings right"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>

          {/* Mapping list */}
          <div className="border rounded-md divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
            {translationBatchFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">No translations in this batch.</p>
            ) : (
              translationBatchFiles.map((t) => {
                const mappedId = mapping[t.id] ?? null
                const isChecked = !!selected[t.id]
                return (
                  <div key={t.id} className="p-3 flex items-center gap-3">
                    <Checkbox
                      id={`checkbox-${t.id}`}
                      checked={isChecked}
                      onCheckedChange={(v) => handleToggleSelected(t.id, Boolean(v))}
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor={`checkbox-${t.id}`} className="cursor-pointer">
                        <p className="text-sm font-medium wrap-break-word break-all line-clamp-2">{t.title || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">{t.subtitlesCount} lines, status: {t.status}</p>
                      </label>
                    </div>
                    {isChecked && (
                      <ArrowLeft className="size-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex items-center gap-2 min-w-[360px]">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShift(t.id, -1)}
                        disabled={isLoading || extractionIds.length === 0}
                        aria-label={`Shift mapping for ${t.title || "Untitled"} left`}
                      >
                        <ChevronLeft />
                      </Button>
                      <Select
                        value={isChecked && !mappedId ? UNLINK_CONTEXT_VALUE : mappedId ?? ""}
                        onValueChange={(val) => handleSelectChange(t.id, val)}
                      >
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Select extraction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value={UNLINK_CONTEXT_VALUE}>
                              Unlink context
                            </SelectItem>
                            {mappingExtractionBatchFiles.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                <div className="flex flex-col items-start text-sm">
                                  Episode {e.title}
                                  <span className="text-xs text-muted-foreground">
                                    <span className="font-medium">status: {e.status}</span>
                                    <span className="font-extralight">{e.description && " - " + e.description}</span>
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUnlink(t.id)}
                        disabled={isLoading || !translationStore[t.id]?.autoContextExtractionId}
                        aria-label={`Unlink context from ${t.title || "Untitled"}`}
                        title="Unlink context"
                      >
                        <Unlink />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShift(t.id, +1)}
                        disabled={isLoading || extractionIds.length === 0}
                        aria-label={`Shift mapping for ${t.title || "Untitled"} right`}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isApplying || isLoading || translationIds.length === 0}>
            {isApplying ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Linking...
              </>
            ) : (
              "Link Context"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
