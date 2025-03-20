"use client"

import { useState } from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useHistoryStore } from "@/stores/use-history-store"
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
import { CheckCircle, FileJson, Trash, XCircle } from "lucide-react"
import { useSubtitleStore } from "@/stores/use-subtitle-store"
import { useTranslationStore } from "@/stores/use-translation-store"
import { useAdvancedSettingsStore } from "@/stores/use-advanced-settings-store"
import { useProjectDataStore } from "@/stores/use-project-data-store"
import { SubtitleTranslated } from "@/types/types"

interface HistoryPanelProps {
  isHistoryOpen: boolean
  setIsHistoryOpen: (value: boolean) => void
}

export function HistoryPanel({ isHistoryOpen, setIsHistoryOpen }: HistoryPanelProps) {
  const currentTranslationId = useProjectDataStore((state) => state.currentTranslationId)
  const saveData = useProjectDataStore((state) => state.saveData)

  // Subtitle Store
  const setTitle = useSubtitleStore((state) => state.setTitle)
  const _setSubtitles = useSubtitleStore((state) => state.setSubtitles)
  const setSubtitles = async (subtitles: SubtitleTranslated[]) => {
    _setSubtitles(subtitles)
    if (currentTranslationId) {
      await saveData(currentTranslationId, "translation", true)
    }
  }
  const setParsed = useSubtitleStore((state) => state.setParsed)

  // Translation Store
  const setResponse = useTranslationStore((state) => state.setResponse)
  const setJsonResponse = useTranslationStore((state) => state.setJsonResponse)

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

  const handleApplyHistory = () => {
    if (selectedHistoryIndex === null) return

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
      setSubtitles(selectedHistoryItem.subtitles)
      setParsed(selectedHistoryItem.parsed)
      setTitle(selectedHistoryItem.title)
      setResponse(selectedHistoryItem.content.join(""))
      setJsonResponse(selectedHistoryItem.json)
      setIsHistoryOpen(false)
      resetIndex(1, selectedHistoryItem.subtitles.length)
    } catch (error) {
      console.error("Error applying history:", error)
    }
  }

  const handleDeleteHistory = () => {
    if (selectedHistoryIndex === null) return
    const updatedHistory = history.filter((_, index) => index !== selectedHistoryIndex)
    useHistoryStore.setState({ history: updatedHistory })
    setSelectedHistoryIndex(null)
  }

  const handleDeleteAll = () => {
    clearHistory()
    setSelectedHistoryIndex(null)
  }

  if (!isHistoryOpen) return null

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[1000px] border rounded-lg overflow-hidden mt-4"
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

        <ResizableHandle className="border" />

        {/* Right Panel: Split Vertically into Three */}
        <ResizablePanel defaultSize={70} minSize={10}>
          <ResizablePanelGroup direction="vertical" className="h-full">

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
              </ScrollArea>
            </ResizablePanel>

            <ResizableHandle className="border" />

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

            <ResizableHandle className="border" />

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
        <Button variant="outline" disabled>
          <FileJson className="h-4 w-4 mr-2" /> Export All
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="default" disabled={selectedHistoryIndex === null}>
              <CheckCircle className="h-4 w-4 mr-2" /> Apply
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
              <XCircle className="h-4 w-4 mr-2" /> Delete
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
              <Trash className="h-4 w-4 mr-2" /> Delete All
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
