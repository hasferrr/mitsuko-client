"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import TranscriptionHistory from "@/components/cloud/transcription-history"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { getContent, parseTranscription, parseTranscriptionWordsAndSegments } from "@/lib/parser/parser"
import { TranscriptionLogItem } from "@/types/transcription-log"
import { toast } from "sonner"

interface TranscriptionHistoryDialogProps {
  currentId: string
}

export function TranscriptionHistoryDialog({ currentId }: TranscriptionHistoryDialogProps) {
  const [open, setOpen] = useState(false)

  const setTitle = useTranscriptionDataStore(state => state.setTitle)
  const setTranscriptionText = useTranscriptionDataStore(state => state.setTranscriptionText)
  const setTranscriptSubtitles = useTranscriptionDataStore(state => state.setTranscriptSubtitles)
  const setWords = useTranscriptionDataStore(state => state.setWords)
  const setSegments = useTranscriptionDataStore(state => state.setSegments)
  const saveData = useTranscriptionDataStore(state => state.saveData)

  const handleApplyDirect = async (raw: string, log: TranscriptionLogItem) => {
    try {
      const cleaned = getContent(raw)
      const transcriptSubtitles = parseTranscription(raw)
      const { words, segments } = parseTranscriptionWordsAndSegments(raw)

      const title = log.metadata.originalname || "Transcription"
      setTitle(currentId, title)
      setTranscriptionText(currentId, cleaned)
      setTranscriptSubtitles(currentId, transcriptSubtitles)
      setWords(currentId, words)
      setSegments(currentId, segments)
      await saveData(currentId)

      toast.success("Transcription applied")
      setOpen(false)
    } catch (error) {
      console.error("Failed to apply transcription:", error)
      toast.error("Failed to apply transcription")
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
        title="Transcription History"
      >
        <History className="h-4 w-4" />
        History
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Transcription History</DialogTitle>
          <TranscriptionHistory onApplyDirect={handleApplyDirect} />
        </DialogContent>
      </Dialog>
    </>
  )
}
