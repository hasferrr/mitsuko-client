"use client"

import { memo, useEffect, useRef, useState } from "react"
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
  const jsonResponse = translation?.response.jsonResponse ?? []
  const isTranslating = isTranslatingSet.has(currentId ?? "")

  // State
  const [isShowRaw, setIsShowRaw] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [isParseError, setIsParseError] = useState(false)
  const topContainerRef = useRef<HTMLDivElement | null>(null)
  const topTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const bottomTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const jsonText = jsonResponse.length ? `[${jsonResponse.map(s => JSON.stringify(s, null, 2))}]` : ""

  useAutoScroll(response, topContainerRef, 500)
  useAutoScroll(response, topTextareaRef)

  useEffect(() => {
    if (isParseError) {
      setIsParseError(false)
    }
  }, [editValue])

  useEffect(() => {
    setEditValue(jsonText)
    if (isParseError) {
      setIsParseError(false)
    }
  }, [isEditing])

  useEffect(() => {
    if (isTranslating) {
      setIsEditing(false)
    }
  }, [isTranslating])

  const handleChangeJSONInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value)
  }

  const handleEditText = () => {
    bottomTextareaRef.current?.focus()
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
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
  }

  const handleApply = async () => {
    if (!currentId) return
    const tlChunk = jsonResponse
    if (!tlChunk.length) {
      return
    }

    const merged = [...subtitles]
    for (let i = 0; i < tlChunk.length; i++) {
      const index = tlChunk[i].index - 1
      merged[index] = {
        ...merged[index],
        translated: tlChunk[i].translated || merged[index].translated,
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
          value={response || "Translation output will appear here..."}
          readOnly
          className={cn(
            "h-[430px] bg-background dark:bg-muted/30 overflow-y-auto rounded-md border p-3 pr-2 resize-none",
            !response && "text-muted-foreground"
          )}
        />
      ) : (
        <div
          ref={topContainerRef}
          className={cn(
            "h-[430px] bg-background dark:bg-muted/30 overflow-y-auto rounded-md border p-3 pr-2",
            !response && "text-muted-foreground"
          )}
        >
          <AiStreamOutput
            content={response || "Translation output will appear here..."}
            subtitles={subtitles}
            isTranslating={isTranslating}
          />
        </div>
      )}
      <Textarea
        ref={bottomTextareaRef}
        value={isEditing ? editValue : jsonText}
        readOnly={!isEditing || isTranslating}
        onChange={handleChangeJSONInput}
        className={cn(
          "h-[209px] bg-background dark:bg-muted/30 resize-none overflow-y-auto font-mono text-sm",
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