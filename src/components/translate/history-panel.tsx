"use client"

import { useState } from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { HistoryItemDetails } from "./history-item-details"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CheckCircle, FileJson, FileUp, Trash, XCircle } from "lucide-react"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useHistoryStore, type HistoryItem } from "@/stores/ui/use-history-store"
import { toast } from "sonner"
import { HISTORY_MAX_ITEMS } from "@/constants/limits"

interface HistoryPanelProps {
  isHistoryOpen: boolean
  setIsHistoryOpen: (value: boolean) => void
  advancedSettingsId: string
}

export function HistoryPanel({ isHistoryOpen, setIsHistoryOpen, advancedSettingsId }: HistoryPanelProps) {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const setTitle = useTranslationDataStore((state) => state.setTitle)
  const setSubtitles = useTranslationDataStore((state) => state.setSubtitles)
  const setParsed = useTranslationDataStore((state) => state.setParsed)
  const setResponse = useTranslationDataStore((state) => state.setResponse)
  const setJsonResponse = useTranslationDataStore((state) => state.setJsonResponse)
  const saveData = useTranslationDataStore((state) => state.saveData)

  // Advanced Settings Store
  const resetIndex = useAdvancedSettingsStore((state) => state.resetIndex)

  // History Store & State
  const history = useHistoryStore((state) => state.history)
  const clearHistory = useHistoryStore((state) => state.clearHistory)
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null)

  // History Handler
  const handleHistoryClick = (index: number) => {
    setSelectedHistoryIndex(index)
  }

  const handleApplyHistory = async () => {
    if (selectedHistoryIndex === null || !currentId) return

    const selectedHistoryItem = history[selectedHistoryIndex]
    const errors: string[] = []

    // Check for errors first
    if (!Array.isArray(selectedHistoryItem.subtitles)) {
      errors.push("Invalid history item format: subtitles is not an array")
    }
    if (!selectedHistoryItem.parsed) {
      errors.push("Invalid history item format: parsed data is missing")
    }
    if (!Array.isArray(selectedHistoryItem.content)) {
      errors.push("Invalid history item format: content is not an array")
    }
    if (!Array.isArray(selectedHistoryItem.json)) {
      errors.push("Invalid history item format: json is not an array")
    }

    // If there are errors, log them and return
    if (errors.length > 0) {
      errors.forEach(error => console.error(error))
      return
    }

    // If no errors, apply the history item
    try {
      setTitle(currentId, selectedHistoryItem.title)
      setSubtitles(currentId, selectedHistoryItem.subtitles)
      setParsed(currentId, selectedHistoryItem.parsed)
      setResponse(currentId, selectedHistoryItem.content.join(""))
      setJsonResponse(currentId, selectedHistoryItem.json)
      await saveData(currentId)
      setIsHistoryOpen(false)
      resetIndex(advancedSettingsId, 1, selectedHistoryItem.subtitles.length)
    } catch (error) {
      console.error("Error applying history:", error)
    }
  }

  const handleDeleteHistory = () => {
    if (selectedHistoryIndex === null) return
    const updatedHistory = history.filter((_, index) => index !== selectedHistoryIndex)
    useHistoryStore.setState({ history: updatedHistory })
    setSelectedHistoryIndex(
      updatedHistory.length > 0 ? Math.max(0, selectedHistoryIndex - 1) : null
    )
  }

  const handleDeleteAll = () => {
    clearHistory()
    setSelectedHistoryIndex(null)
  }

  function isValidHistoryItem(item: unknown): item is HistoryItem {
    if (typeof item !== "object" || item === null) return false
    const obj = item as Record<string, unknown>
    return (
      typeof obj.title === "string" &&
      Array.isArray(obj.content) &&
      Array.isArray(obj.json) &&
      Array.isArray(obj.subtitles) &&
      typeof obj.parsed === "object" && obj.parsed !== null &&
      typeof obj.timestamp === "string"
    )
  }

  const addHistoryItems = useHistoryStore((state) => state.addHistoryItems)

  const handleExportAll = () => {
    try {
      const blob = new Blob([JSON.stringify(history)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mitsuko-history-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("History exported successfully")
    } catch (error) {
      console.error("Error exporting history:", error)
      toast.error("Failed to export history")
    }
  }

  const handleImport = () => {
    try {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".json"
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        setSelectedFile(file)
        setShowImportConfirm(true)
      }
      input.click()
    } catch (error) {
      console.error("Error importing history:", error)
      toast.error("Failed to import history")
    }
  }

  const handleConfirmImport = () => {
    if (!selectedFile) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        if (!Array.isArray(data)) {
          toast.error("Invalid file format: expected an array")
          return
        }
        const validItems = data.filter(isValidHistoryItem)
        if (validItems.length === 0) {
          toast.error("No valid history items found in file")
          return
        }
        addHistoryItems(validItems)
        toast.success(`Imported ${validItems.length} history item${validItems.length > 1 ? "s" : ""}`)
      } catch (error) {
        console.error("Error importing history:", error)
        toast.error("Failed to parse import file")
      }
    }
    reader.readAsText(selectedFile)
  }

  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  if (!isHistoryOpen) return null

  return (
    <>
      <ResizablePanelGroup
        orientation="horizontal"
        className="max-w-4xl mx-auto h-[1000px] border rounded-lg"
      >
        {/* Left Panel: History List */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <ScrollArea className="h-[550px]">
            {history.toReversed().map((item, reversedIndex) => {
              const index = history.length - reversedIndex - 1
              return (
                <div
                  key={index}
                  className={cn(
                    "p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors",
                    selectedHistoryIndex === index && "bg-muted",
                  )}
                  onClick={() => handleHistoryClick(index)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className={cn(selectedHistoryIndex === index && "font-semibold")}>
                      {item.title}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.content.join("\n").substring(0, 100)}
                    {item.content.join("\n").length > 100 ? "..." : ""}
                  </p>
                </div>
              )
            }
            )}
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel: Split Vertically into Three */}
        <ResizablePanel defaultSize={70} minSize={10}>
          <ResizablePanelGroup
            orientation="vertical"
            className="h-full"
          >

            {/* Top Panel: Subtitles and Parsed Data */}
            <ResizablePanel minSize={10}>
              <ScrollArea className="h-full">
                <div className="p-6 max-w-none text-sm">
                  {selectedHistoryIndex !== null && (
                    <HistoryItemDetails
                      parsed={history[selectedHistoryIndex].parsed}
                      subtitles={history[selectedHistoryIndex].subtitles}
                    />
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </ResizablePanel>

            <ResizableHandle />

            {/* Middle Panel: Raw Responses */}
            <ResizablePanel minSize={10}>
              <ScrollArea className="h-full">
                <div className="p-6 max-w-none text-sm">
                  <div className="space-y-4">
                    {selectedHistoryIndex !== null &&
                      <>
                        <p className="text-lg">Raw Response</p>
                        <div className="space-y-10">
                          {history[selectedHistoryIndex].content.map((text, i) =>
                            <pre
                              className="whitespace-pre-wrap"
                              key={`history-${selectedHistoryIndex}-${i}-${'j'}`}>
                              {text}
                            </pre>
                          )}
                        </div>
                      </>
                    }
                  </div>
                </div>
              </ScrollArea>
            </ResizablePanel>

            <ResizableHandle />

            {/* Bottom Panel: JSON  */}
            <ResizablePanel minSize={10}>
              <ScrollArea className="h-full">
                <div className="p-6 max-w-none text-sm">
                  <div className="space-y-4">
                    {selectedHistoryIndex !== null && (
                      <>
                        <p className="text-lg">Parsed Response</p>
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(history[selectedHistoryIndex].json, null, 2)}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

      </ResizablePanelGroup>

      {/* History Action Buttons */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        <Button variant="outline" disabled={history.length === 0} onClick={handleExportAll}>
          <FileJson className="size-4" /> Export All
        </Button>

        <Button variant="outline" onClick={handleImport}>
          <FileUp className="size-4" /> Import
        </Button>

        <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Import History</AlertDialogTitle>
              <AlertDialogDescription>
                This will append imported items to your existing history. History is limited to {HISTORY_MAX_ITEMS} items, so older entries may be removed. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmImport}>
                Import
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="default" disabled={selectedHistoryIndex === null}>
              <CheckCircle className="size-4" /> Apply
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply History</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to apply this translation history to the current subtitles? This will overwrite any existing translations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleApplyHistory}>
                Apply
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={selectedHistoryIndex === null}>
              <XCircle className="size-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete History Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this history item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteHistory}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={history.length === 0}>
              <Trash className="size-4" /> Delete All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete All History</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete all history items? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAll}>
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
