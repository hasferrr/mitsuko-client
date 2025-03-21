"use client"

import { memo, useEffect, useRef, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { Button } from "./ui/button"
import { parseTranslationArrayStrict } from "@/lib/parser"
import { cn } from "@/lib/utils"
import { useTranslationDataStore } from "@/stores/use-translation-data-store"
import { useTranslationStore } from "@/stores/use-translation-store"

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
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [isParseError, setIsParseError] = useState(false)
  const topTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const bottomTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const jsonText = jsonResponse.length ? `[${jsonResponse.map(s => JSON.stringify(s, null, 2))}]` : ""

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

  useEffect(() => {
    if (topTextareaRef.current) {
      topTextareaRef.current.scrollTop = topTextareaRef.current.scrollHeight
    }
  }, [topTextareaRef])

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
      const parsed = parseTranslationArrayStrict(editValue)
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
      <Textarea
        ref={topTextareaRef}
        value={response.trim()}
        readOnly
        className="h-[390px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Translation output will appear here..."
      />
      <Textarea
        ref={bottomTextareaRef}
        value={isEditing ? editValue : jsonText}
        readOnly={!isEditing}
        onChange={handleChangeJSONInput}
        className={cn(
          "h-[247px] bg-background dark:bg-muted/30 resize-none overflow-y-auto font-mono text-sm",
          isParseError && "focus-visible:ring-red-600",
        )}
        placeholder="Accumulated result will appear here..."
      />
      <div className="flex gap-2">
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={isEditing ? handleParseAndSave : handleEditText}
          disabled={isTranslating}
          className="w-full"
        >
          {isEditing ? "Parse & Save" : "Edit Text"}
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