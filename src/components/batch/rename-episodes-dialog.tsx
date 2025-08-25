"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import type { BatchFile } from "@/types/batch"

interface RenameEpisodesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  batchFiles: BatchFile[]
}

export function RenameEpisodesDialog({ open, onOpenChange, batchFiles }: RenameEpisodesDialogProps) {
  const getExtractionsDb = useExtractionDataStore((s) => s.getExtractionsDb)
  const updateExtractionDb = useExtractionDataStore((s) => s.updateExtractionDb)
  const storeData = useExtractionDataStore((s) => s.data)

  const ids = useMemo(() => batchFiles.map((b) => b.id), [batchFiles])

  // State
  const [initialMap, setInitialMap] = useState<Record<string, string>>({})
  const [renamePreview, setRenamePreview] = useState<Record<string, string>>({})
  const [isLoadingInitial, setIsLoadingInitial] = useState(false)
  const [isApplyingRename, setIsApplyingRename] = useState(false)

  // Sequential numbering controls
  const [seqStart, setSeqStart] = useState(1)
  const [seqStep, setSeqStep] = useState(1)
  const [seqPad, setSeqPad] = useState(2)

  // Remove text controls
  const [removeText, setRemoveText] = useState("")

  // Regex controls
  const [regexPattern, setRegexPattern] = useState("")
  const [regexReplace, setRegexReplace] = useState("")
  const [regexGlobal, setRegexGlobal] = useState(true)
  const [regexCaseInsensitive, setRegexCaseInsensitive] = useState(false)
  const [showEpisodePrefix, setShowEpisodePrefix] = useState(false)

  // Load extractions when opened
  useEffect(() => {
    if (!open) return
    let cancelled = false
    const load = async () => {
      try {
        setIsLoadingInitial(true)
        const fetched = await getExtractionsDb(ids)
        if (cancelled) return
        const init: Record<string, string> = {}
        ids.forEach((id) => {
          const fromFetched = fetched.find(e => e.id === id)?.episodeNumber
          init[id] = fromFetched ?? storeData[id]?.episodeNumber ?? ""
        })
        setInitialMap(init)
        setRenamePreview(init)
        setSeqStart(1)
        setSeqStep(1)
        setSeqPad(Math.max(2, String(ids.length).length))
        setRemoveText("")
        setRegexPattern("")
        setRegexReplace("")
        setRegexGlobal(true)
        setRegexCaseInsensitive(false)
        setShowEpisodePrefix(false)
      } catch (e) {
        console.error("Failed to load extractions for rename dialog", e)
        toast.error("Failed to load extractions")
      } finally {
        setIsLoadingInitial(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ids.join("")])

  const handleResetPreview = () => {
    setRenamePreview(initialMap)
  }

  const applySequentialNumbering = () => {
    setRenamePreview((prev) => {
      const next = { ...prev }
      let n = seqStart
      for (const id of ids) {
        next[id] = String(n).padStart(Math.max(0, seqPad), "0")
        n += seqStep
      }
      return next
    })
  }

  const applyRemoveText = () => {
    if (!removeText) return
    setRenamePreview((prev) => {
      const next = { ...prev }
      for (const id of ids) {
        const cur = next[id] ?? ""
        next[id] = cur.split(removeText).join("")
      }
      return next
    })
  }

  const applyRegexReplace = () => {
    if (!regexPattern) return
    try {
      const flags = `${regexGlobal ? "g" : ""}${regexCaseInsensitive ? "i" : ""}`
      const re = new RegExp(regexPattern, flags)
      setRenamePreview((prev) => {
        const next = { ...prev }
        for (const id of ids) {
          const cur = next[id] ?? ""
          next[id] = cur.replace(re, regexReplace)
        }
        return next
      })
    } catch {
      toast.error("Invalid regex pattern")
    }
  }

  const handleApplyRename = async () => {
    if (!ids.length) return
    setIsApplyingRename(true)
    try {
      for (const id of ids) {
        const newVal = renamePreview[id] ?? ""
        const oldVal = initialMap[id] ?? ""
        if (newVal !== oldVal) {
          await updateExtractionDb(id, { episodeNumber: newVal })
        }
      }
      toast.success("Episode numbers updated")
      onOpenChange(false)
    } catch (e) {
      console.error(e)
      toast.error("Failed to update episode numbers")
    } finally {
      setIsApplyingRename(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>Batch Rename Episode Numbers</DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="space-y-4">
          <Tabs defaultValue="sequence" className="w-full">
            <TabsList>
              <TabsTrigger value="sequence">Sequential numbering</TabsTrigger>
              <TabsTrigger value="remove">Remove text</TabsTrigger>
              <TabsTrigger value="regex">Regex replace</TabsTrigger>
            </TabsList>

            <TabsContent value="sequence">
              <div className="border rounded-md p-3">
                <p className="text-sm font-medium mb-2">Sequential numbering</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0 w-16">Start</span>
                    <Input
                      type="number"
                      value={seqStart}
                      onChange={(e) => setSeqStart(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0 w-16">Step</span>
                    <Input
                      type="number"
                      value={seqStep}
                      onChange={(e) => setSeqStep(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0 w-16">Pad</span>
                    <Input
                      type="number"
                      value={seqPad}
                      onChange={(e) => setSeqPad(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={applySequentialNumbering} disabled={isLoadingInitial}>
                    Apply sequence
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="remove">
              <div className="border rounded-md p-3">
                <p className="text-sm font-medium mb-2">Remove text from all</p>
                <Input
                  placeholder="Text to remove"
                  value={removeText}
                  onChange={(e) => setRemoveText(e.target.value)}
                />
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={applyRemoveText} disabled={!removeText}>
                    Remove
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="regex">
              <div className="border rounded-md p-3">
                <p className="text-sm font-medium mb-2">Regex replace</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Pattern (e.g. S04E)"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                  />
                  <Input
                    placeholder="Replacement"
                    value={regexReplace}
                    onChange={(e) => setRegexReplace(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={regexGlobal} onCheckedChange={setRegexGlobal} />
                    Global (g)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={regexCaseInsensitive} onCheckedChange={setRegexCaseInsensitive} />
                    Case-insensitive (i)
                  </label>
                  <Button variant="outline" size="sm" onClick={applyRegexReplace} disabled={!regexPattern}>
                    Apply regex
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview list */}
          <div className="border rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Preview changes</p>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch checked={showEpisodePrefix} onCheckedChange={setShowEpisodePrefix} />
                Preview with "Episode"
              </label>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y">
              {ids.length === 0 ? (
                <p className="text-sm text-muted-foreground">No extractions in this batch.</p>
              ) : (
                batchFiles.map((b) => {
                  const oldVal = initialMap[b.id] ?? ""
                  const newVal = renamePreview[b.id] ?? ""
                  return (
                    <div key={b.id} className="py-2 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm shrink-0 flex items-center gap-2">
                          <span className="font-medium text-muted-foreground">
                            {oldVal && showEpisodePrefix && <span className="font-bold">Episode </span>}
                            {oldVal || <span className="italic font-light">Empty</span>}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">
                            {newVal && showEpisodePrefix && <span className="font-bold">Episode </span>}
                            {newVal || <span className="italic font-light">Empty</span>}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground truncate font-extralight mt-1">
                          {b.description || 'No title'}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleResetPreview} disabled={isApplyingRename || isLoadingInitial}>
            Reset
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApplyingRename}>
            Cancel
          </Button>
          <Button onClick={handleApplyRename} disabled={isApplyingRename || isLoadingInitial || ids.length === 0}>
            {isApplyingRename ? "Renaming..." : "Rename All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
