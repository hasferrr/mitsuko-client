"use client"

import { memo, useRef, useState, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { Button } from "@/components/ui/button"
import { parseTranslationJson } from "@/lib/parser/parser"
import { cn } from "@/lib/utils"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { AiStreamOutput } from "@/components/ai-stream/ai-stream-output"

export const SubtitleResultOutput = memo(() => {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)
  const setSubtitles = useTranslationDataStore((state) => state.setSubtitles)
  const setJsonResponse = useTranslationDataStore((state) => state.setJsonResponse)
  const saveData = useTranslationDataStore((state) => state.saveData)
  const isTranslatingSet = useTranslationStore((state) => state.isTranslatingSet)

  const translation = currentId ? translationData[currentId] : null
  const subtitles = translation?.subtitles ?? []
  const response = translation?.response.response ?? ""
  const isTranslating = isTranslatingSet.has(currentId ?? "")

  // State
  const [isShowRaw, setIsShowRaw] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [isParseError, setIsParseError] = useState(false)
  const topContainerRef = useRef<HTMLDivElement | null>(null)
  const topTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const bottomTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const jsonResponse = useMemo(() => translation?.response.jsonResponse ?? [], [translation])

  const jsonText = useMemo(() => {
    if (!jsonResponse?.length) return ""
    return JSON.stringify(jsonResponse, null, 2)
  }, [jsonResponse])

  useAutoScroll(response, topContainerRef, 500)
  useAutoScroll(response, topTextareaRef)

  const handleChangeJSONInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value)
  }

  const handleEditText = () => {
    setEditValue(jsonText)
    bottomTextareaRef.current?.focus()
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (isParseError) {
      setIsParseError(false)
    }
  }

  const handleParseAndSave = () => {
    if (!currentId) return
    try {
      const parsed = parseTranslationJson(editValue)
      setJsonResponse(currentId, parsed)
      setIsParseError(false)
    } catch {
      console.log("Failed to parse JSON. Please check the format.")
      setIsParseError(true)
      bottomTextareaRef?.current?.focus()
      return
    }
    setIsEditing(false)
    if (isParseError) {
      setIsParseError(false)
    }
  }

  const handleApply = async () => {
    if (!currentId) return
    const tlChunk = jsonResponse
    if (!tlChunk.length) {
      return
    }

    const merged = [...subtitles]
    for (const { index: idx, translated } of tlChunk) {
      if (typeof idx !== 'number' || typeof translated !== 'string') {
        console.log('skipping invalid data: ', { index: idx, translated })
        continue
      }
      const targetIndex = idx - 1
      if (targetIndex < 0 || targetIndex >= merged.length) {
        console.log('skipping out of bounds at index: ', idx)
        continue
      }
      merged[targetIndex] = {
        ...merged[targetIndex],
        translated: translated || merged[targetIndex].translated,
      }
    }
    setSubtitles(currentId, merged)
    await saveData(currentId)
  }

  return (
    <div className="space-y-4">
      {isEditing || isShowRaw ? (
        <Textarea
          ref={topTextareaRef}
          value={response.trim() || "Translation output will appear here..."}
          readOnly
          className={cn(
            "h-[439px] bg-background dark:bg-muted/30 overflow-y-auto rounded-md border p-3 pr-2 resize-none",
            !response && "text-muted-foreground"
          )}
        />
      ) : (
        <div
          ref={topContainerRef}
          className={cn(
            "h-[439px] bg-background dark:bg-muted/30 overflow-y-auto rounded-md border p-3 pr-2",
            !response && "text-muted-foreground"
          )}
        >
          <AiStreamOutput
            content={response.trim() || "Translation output will appear here..."}
            subtitles={subtitles}
            isProcessing={isTranslating}
          />
        </div>
      )}
      <Textarea
        ref={bottomTextareaRef}
        value={isEditing ? editValue : jsonText}
        readOnly={!isEditing || isTranslating}
        onChange={handleChangeJSONInput}
        className={cn(
          "h-[200px] bg-background dark:bg-muted/30 resize-none overflow-y-auto font-mono text-sm",
          isParseError && "focus-visible:ring-red-600",
        )}
        placeholder="Accumulated result will appear here..."
      />
      <div className="flex gap-2">
        <Button
          variant={!isTranslating && isEditing ? "default" : "outline"}
          onClick={!isTranslating
            ? (isEditing ? handleParseAndSave : handleEditText)
            : () => setIsShowRaw(prev => !prev)}
          className="w-full"
        >
          {!isTranslating
            ? isEditing ? "Parse & Save" : "Edit Text"
            : !isShowRaw ? "Show Raw" : "Show Subtitles"}
        </Button>
        <Button
          variant="outline"
          onClick={isEditing ? handleCancelEdit : handleApply}
          disabled={isTranslating}
          className="w-full"
        >
          {isEditing ? "Cancel" : "Apply to Subtitles"}
        </Button>
      </div>
    </div>
  )
})