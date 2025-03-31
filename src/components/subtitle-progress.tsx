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
import { useState, useEffect } from "react"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"

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

  const handleCountTranslatedLines = () => {
    let translatedLines = 0
    let missingOriginalLines = 0
    const untranslatedIndices: number[] = []
    const missingOriginalIndices: number[] = []

    // Single pass to count translated lines, missing original lines, and collect indices
    subtitles.forEach((sub, index) => {
      if (sub.translated.trim() !== "") {
        translatedLines++
      } else {
        untranslatedIndices.push(index + 1) // +1 to convert to 1-based index
      }

      if (sub.content.trim() === "") {
        missingOriginalLines++
        missingOriginalIndices.push(index + 1) // +1 to convert to 1-based index
      }
    })

    setTranslatedCount(translatedLines)
    setOriginalCount(missingOriginalLines)

    // Calculate untranslated intervals
    const untranslatedIntervals: string[] = []
    let start = untranslatedIndices[0]
    let end = untranslatedIndices[0]

    for (let i = 1; i < untranslatedIndices.length; i++) {
      if (untranslatedIndices[i] === end + 1) {
        end = untranslatedIndices[i]
      } else {
        untranslatedIntervals.push(start === end ? `${start}` : `${start}-${end}`)
        start = untranslatedIndices[i]
        end = untranslatedIndices[i]
      }
    }

    if (untranslatedIndices.length > 0) {
      untranslatedIntervals.push(start === end ? `${start}` : `${start}-${end}`)
    }

    setUntranslatedIntervals(untranslatedIntervals)

    // Calculate missing original intervals
    const missingOriginalIntervals: string[] = []
    start = missingOriginalIndices[0]
    end = missingOriginalIndices[0]

    for (let i = 1; i < missingOriginalIndices.length; i++) {
      if (missingOriginalIndices[i] === end + 1) {
        end = missingOriginalIndices[i]
      } else {
        missingOriginalIntervals.push(start === end ? `${start}` : `${start}-${end}`)
        start = missingOriginalIndices[i]
        end = missingOriginalIndices[i]
      }
    }

    if (missingOriginalIndices.length > 0) {
      missingOriginalIntervals.push(start === end ? `${start}` : `${start}-${end}`)
    }

    setMissingOriginalIntervals(missingOriginalIntervals)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTranslatedCount(null) // Reset translatedCount when dialog is closed
      setOriginalCount(null) // Reset originalCount when dialog is closed
      setUntranslatedIntervals([]) // Reset untranslated intervals
      setMissingOriginalIntervals([]) // Reset missing original intervals
    }
    setIsOpen(open)
  }

  // Call handleCountTranslatedLines when the dialog is opened
  useEffect(() => {
    if (isOpen) {
      handleCountTranslatedLines()
    }
  }, [isOpen])

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
