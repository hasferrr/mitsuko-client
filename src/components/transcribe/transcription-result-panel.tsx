"use client"

import { type RefObject, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Download,
  Clock,
  Trash,
  Save,
  Edit,
  AudioWaveform,
  ClipboardPaste,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { AiStreamOutput } from "../ai-stream/ai-stream-output"
import { cn } from "@/lib/utils"
import { timestampToString } from "@/lib/subtitles/timestamp"
import type { Subtitle } from "@/types/subtitles"

interface TranscriptionResultPanelProps {
  rightTab: "transcript" | "subtitles"
  onSetRightTab: (tab: "transcript" | "subtitles") => void
  transcriptionText: string
  transcriptSubtitles: Subtitle[]
  isTranscribing: boolean
  isEditing: boolean
  isClearDialogOpen: boolean
  transcriptionAreaRef: RefObject<HTMLTextAreaElement | null>
  transcriptionResultRef: RefObject<HTMLDivElement | null>
  onTranscriptionTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onIsEditing: () => void
  onClear: () => void
  onConfirmClear: () => void
  onSetIsClearDialogOpen: (open: boolean) => void
  onParse: () => void
  onExport: () => void
}

export function TranscriptionResultPanel({
  rightTab,
  onSetRightTab,
  transcriptionText,
  transcriptSubtitles,
  isTranscribing,
  isEditing,
  isClearDialogOpen,
  transcriptionAreaRef,
  transcriptionResultRef,
  onTranscriptionTextChange,
  onIsEditing,
  onClear,
  onConfirmClear,
  onSetIsClearDialogOpen,
  onParse,
  onExport,
}: TranscriptionResultPanelProps) {
  return (
    <Tabs value={rightTab} onValueChange={value => onSetRightTab(value as "transcript" | "subtitles")}>
      <TabsList className="w-full">
        <TabsTrigger value="transcript" className="w-full">
          Transcript
        </TabsTrigger>
        <TabsTrigger value="subtitles" className="w-full" >
          Subtitles
        </TabsTrigger>
      </TabsList>

      <TabsContent value="transcript" className="mt-4">
        <Card size="sm">
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              <h2 className="text-lg font-medium">Transcription</h2>

              {(transcriptionText || isEditing) && (
                <div className="flex flex-wrap gap-2 justify-end">
                  <AlertDialog open={isClearDialogOpen} onOpenChange={onSetIsClearDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={onClear}
                        disabled={isTranscribing}
                      >
                        <Trash className="size-3" /> Clear
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently clear the transcription and subtitles.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmClear}>
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn("text-xs", isEditing && "border-primary/50")}
                    onClick={onIsEditing}
                    disabled={isTranscribing}
                  >
                    {isEditing
                      ? <Save className="size-3" />
                      : <Edit className="size-3" />}
                    {isEditing ? "Done" : "Edit"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={onExport}
                  >
                    <Download className="size-3" /> Export SRT
                  </Button>
                </div>
              )}
            </div>

            {!transcriptionText && !isTranscribing && !isEditing ? (
              <div className="border border-border rounded-lg p-8 flex flex-col items-center justify-center">
                <AudioWaveform className="size-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm mb-1">
                  Upload an audio file and click &quot;Start Transcription&quot;
                </p>
                <p className="text-muted-foreground text-xs">
                  Your transcription will appear here in real-time
                </p>
              </div>
            ) : isEditing ? (
              <Textarea
                ref={transcriptionAreaRef}
                value={transcriptionText}
                readOnly={!isEditing || isTranscribing}
                onChange={onTranscriptionTextChange}
                className="h-96 p-4 bg-background text-foreground resize-none overflow-y-auto rounded-xl"
              />
            ) : (
              <Card
                ref={transcriptionResultRef}
                size="sm"
                className={cn(
                  "min-h-96 h-96 overflow-y-auto",
                  !transcriptionText && "text-muted-foreground",
                )}
              >
                <CardContent className="pr-2">
                  <AiStreamOutput
                    content={transcriptionText || "Transcription will appear here..."}
                    isProcessing={isTranscribing}
                    defaultCollapsed={!!transcriptionText}
                  />
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subtitles" className="mt-4">
        <Card size="sm">
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              <h2 className="text-lg font-medium">Subtitle Result</h2>

              {transcriptSubtitles.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-end">
                  <AlertDialog open={isClearDialogOpen} onOpenChange={onSetIsClearDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={onClear}
                        disabled={isTranscribing}
                      >
                        <Trash className="size-3" /> Clear
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently clear the transcription and subtitles.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmClear}>
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={onParse}
                  >
                    <ClipboardPaste className="size-3" /> Parse
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={onExport}
                  >
                    <Download className="size-3" /> Export SRT
                  </Button>
                </div>
              )}
            </div>

            {transcriptSubtitles.length === 0 && !isTranscribing ? (
              <div className="border border-border rounded-lg p-8 flex flex-col items-center justify-center">
                <Clock className="size-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm mb-1">
                  Your subtitles with timestamps will appear here
                </p>
                <p className="text-muted-foreground text-xs">After transcription is complete</p>
              </div>
            ) : (
              <div className="h-96 overflow-y-auto pr-2">
                {transcriptSubtitles.map((subtitle) => (
                  <div
                    key={`transcript-subtitle-${subtitle.index}`}
                    className="mb-4 p-3 border border-border rounded-xl hover:border-border/80 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium">#{subtitle.index}</span>
                      <span className="text-xs text-muted-foreground">
                        {timestampToString(subtitle.timestamp.start)} → {timestampToString(subtitle.timestamp.end)}
                      </span>
                    </div>
                    {subtitle.content.split("\n").map((line: string, index: number) => (
                      <p key={`transcript-subtitle-${subtitle.index}-${index}`} className="text-sm">
                        {line}
                      </p>
                    ))}
                  </div>
                ))}

                {isTranscribing && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-pulse flex space-x-1">
                      <div className="size-2 bg-primary rounded-full"></div>
                      <div className="size-2 bg-primary rounded-full"></div>
                      <div className="size-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
