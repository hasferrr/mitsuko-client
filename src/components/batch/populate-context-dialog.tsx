"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, ArrowLeft, Loader2, ListChecks, ListX, ListRestart } from "lucide-react"
import type { BatchFile } from "@/types/batch"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { getContent } from "@/lib/parser/parser"

interface PopulateContextDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  translationBatchFiles: BatchFile[]
  extractionBatchFiles: BatchFile[]
}

export function PopulateContextDialog({ open, onOpenChange, translationBatchFiles, extractionBatchFiles }: PopulateContextDialogProps) {
  const translationIds = useMemo(() => translationBatchFiles.map(b => b.id), [translationBatchFiles])
  const extractionIds = useMemo(() => extractionBatchFiles.map(b => b.id), [extractionBatchFiles])

  // Stores
  const getTranslationsDb = useTranslationDataStore(s => s.getTranslationsDb)
  const translationStore = useTranslationDataStore(s => s.data)
  const getExtractionsDb = useExtractionDataStore(s => s.getExtractionsDb)
  const extractionStore = useExtractionDataStore(s => s.data)
  const setBasicSettingsValue = useSettingsStore(s => s.setBasicSettingsValue)

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
        // Default mapping by index alignment
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
      } catch (e) {
        console.error("Failed to load items for Populate Context dialog", e)
        toast.error("Failed to load items")
      } finally {
        setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSelectChange = (tId: string, eId: string | null) => {
    setMapping(prev => ({ ...prev, [tId]: eId }))
    setSelected(prev => ({ ...prev, [tId]: !!eId }))
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
      let applied = 0
      let empties = 0
      for (const tId of translationIds) {
        if (!selected[tId]) continue
        const eId = mapping[tId]
        if (!eId) continue
        const extraction = extractionStore[eId]
        const translation = translationStore[tId]
        if (!translation) continue
        const bsId = translation.basicSettingsId
        let context = (extraction?.contextResult ?? "")
        // Remove trailing <done>
        context = getContent(context.replace(/<done>\s*$/, "")).trim()
        if (!context) empties += 1
        setBasicSettingsValue(bsId, "contextDocument", context)
        applied += 1
      }
      if (applied > 0) {
        toast.success(`Populated context for ${applied} translation${applied === 1 ? "" : "s"}${empties ? ` (${empties} empty)` : ""}`)
      } else {
        toast.message("Nothing to apply")
      }
      onOpenChange(false)
    } catch (e) {
      console.error(e)
      toast.error("Failed to populate context")
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Populate Context Document from Extractions</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAllToggle} disabled={isLoading || translationIds.length === 0}>
              <ListChecks className="h-4 w-4" />
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll} disabled={isLoading || translationIds.length === 0}>
              <ListX className="h-4 w-4" />
              Deselect All
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetMapping} disabled={isLoading}>
              <ListRestart className="h-4 w-4" />
              Reset Mapping
            </Button>

            {/* Shift all mappings */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleShiftAll(-1)}
                disabled={isLoading || extractionIds.length === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div
                className="h-8 px-4 text-xs cursor-default select-none pointer-events-none border border-input bg-background rounded-md inline-flex items-center justify-center"
                aria-hidden
              >
                Shift All
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleShiftAll(+1)}
                disabled={isLoading || extractionIds.length === 0}
              >
                <ChevronRight className="h-4 w-4" />
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
                        <p className="text-sm font-medium truncate">{t.title || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">{t.subtitlesCount} lines, status: {t.status}</p>
                      </label>
                    </div>
                    {isChecked && (
                      <ArrowLeft className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex items-center gap-2 min-w-[360px]">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleShift(t.id, -1)} disabled={isLoading || extractionIds.length === 0}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Select value={mappedId ?? undefined} onValueChange={(val) => handleSelectChange(t.id, val)}>
                        <SelectTrigger className="w-[300px] h-10">
                          <SelectValue placeholder="Select extraction" />
                        </SelectTrigger>
                        <SelectContent>
                          {extractionBatchFiles.map((e) => (
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
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleShift(t.id, +1)} disabled={isLoading || extractionIds.length === 0}>
                        <ChevronRight className="h-4 w-4" />
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
