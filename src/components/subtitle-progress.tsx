"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { countUntranslatedLines } from "@/lib/subtitles/utils/count-untranslated"

interface SubtitleCountProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
}

export const SubtitleProgress = ({ isOpen, setIsOpen, children }: SubtitleCountProps) => {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)
  const subtitles = currentId ? translationData[currentId]?.subtitles ?? [] : []

  const [translatedCount, setTranslatedCount] = useState<number | null>(null)
  const [originalCount, setOriginalCount] = useState<number | null>(null)
  const [untranslatedIntervals, setUntranslatedIntervals] = useState<string[]>([])
  const [missingOriginalIntervals, setMissingOriginalIntervals] = useState<string[]>([])

  const handleCountTranslatedLines = useCallback(() => {
    if (subtitles.length === 0) {
      setTranslatedCount(0)
      setOriginalCount(0)
      setUntranslatedIntervals([])
      setMissingOriginalIntervals([])
      return
    }

    const { untranslated, missingOriginal } = countUntranslatedLines(subtitles)

    let totalUntranslated = 0
    const untranslatedStrings: string[] = []
    for (const [start, end] of untranslated) {
      totalUntranslated += (end - start + 1)
      untranslatedStrings.push(start === end ? `${start}` : `${start}-${end}`)
    }
    setTranslatedCount(subtitles.length - totalUntranslated)
    setUntranslatedIntervals(untranslatedStrings)

    let totalMissingOriginal = 0
    const missingOriginalStrings: string[] = []
    for (const [start, end] of missingOriginal) {
      totalMissingOriginal += (end - start + 1)
      missingOriginalStrings.push(start === end ? `${start}` : `${start}-${end}`)
    }
    setOriginalCount(totalMissingOriginal)
    setMissingOriginalIntervals(missingOriginalStrings)
  }, [subtitles])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTranslatedCount(null)
      setOriginalCount(null)
      setUntranslatedIntervals([])
      setMissingOriginalIntervals([])
    }
    setIsOpen(open)
  }

  useEffect(() => {
    if (isOpen) {
      handleCountTranslatedLines()
    }
  }, [isOpen, handleCountTranslatedLines])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Translation Progress</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription>
            Here is the progress of subtitle translation and missing original text.
          </DialogDescription>
          {translatedCount !== null && (
            <div className="text-sm font-medium">
              <div>Translated count: {translatedCount} / {subtitles.length}</div>
              {translatedCount === subtitles.length ? (
                <div>All subtitles are translated.</div>
              ) : (
                <>
                  {untranslatedIntervals.length > 0 && (
                    <div className="">
                      Untranslated at index: {untranslatedIntervals.join(", ")}
                    </div>
                  )}
                </>
              )}
              {originalCount !== null && originalCount > 0 && (
                <div className="mt-2">
                  Missing original text: {originalCount} / {subtitles.length}
                  {missingOriginalIntervals.length > 0 && (
                    <div className="">
                      Missing text at index: {missingOriginalIntervals.join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
