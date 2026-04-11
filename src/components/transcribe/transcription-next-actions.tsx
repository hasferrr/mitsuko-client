"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Globe,
  FileText,
} from "lucide-react"
import type { Subtitle } from "@/types/subtitles"

interface TranscriptionNextActionsProps {
  transcriptSubtitles: Subtitle[]
  isTranscribing: boolean
  onCreateTranslation: () => void
  onExport: () => void
}

export function TranscriptionNextActions({
  transcriptSubtitles,
  isTranscribing,
  onCreateTranslation,
  onExport,
}: TranscriptionNextActionsProps) {
  return (
    <Card size="sm">
      <CardContent className="space-y-4">
        <h2 className="text-lg font-medium">What&apos;s Next?</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card size="sm" className="flex flex-col justify-between">
            <CardContent>
              <div className="flex items-start gap-3 mb-2">
                <div className="size-5 mt-0.5 text-blue-500">
                  <Globe className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Translate</h3>
                  <p className="text-xs text-muted-foreground">Translate your transcript into 100+ languages</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={onCreateTranslation}
                disabled={!transcriptSubtitles.length || isTranscribing}
              >
                Translate Subtitles
              </Button>
            </CardContent>
          </Card>

          <Card size="sm" className="flex flex-col justify-between">
            <CardContent>
              <div className="flex items-start gap-3 mb-2">
                <div className="size-5 mt-0.5 text-blue-500">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Export</h3>
                  <p className="text-xs text-muted-foreground">Export transcription as SRT subtitle</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={onExport}
                disabled={!transcriptSubtitles.length || isTranscribing}
              >
                Export Subtitles
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
