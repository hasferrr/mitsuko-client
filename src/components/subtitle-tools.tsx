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
import { memo, useState } from "react"
import { useSubtitleStore } from "@/stores/use-subtitle-store"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { Timestamp } from "@/types/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as AlertDialogContentInner,
  AlertDialogDescription as AlertDialogDescriptionInner,
  AlertDialogFooter as AlertDialogFooterInner,
  AlertDialogHeader as AlertDialogHeaderInner,
  AlertDialogTitle as AlertDialogTitleInner,
} from "@/components/ui/alert-dialog"

interface SubtitleToolsProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
}

export const SubtitleTools = memo(({ isOpen, setIsOpen, children }: SubtitleToolsProps) => {
  const [removeAllLineBreaks, setRemoveAllLineBreaks] = useState(false)
  const [removeBetweenCustom, setRemoveBetweenCustom] = useState(false)
  const [customStart, setCustomStart] = useState("(")
  const [customEnd, setCustomEnd] = useState(")")
  const [shiftTime, setShiftTime] = useState(0)
  const [alertDialog, setAlertDialog] = useState<{ open: boolean; action: () => void }>({
    open: false,
    action: () => { },
  })

  const subtitles = useSubtitleStore((state) => state.subtitles)
  const setSubtitles = useSubtitleStore((state) => state.setSubtitles)
  const parsed = useSubtitleStore((state) => state.parsed)

  const handleRemoveAllLineBreaks = (field: "content" | "translated") => {
    if (!subtitles.length) return

    const updatedSubtitles = subtitles.map((subtitle) => {
      const updatedContent =
        parsed.type === "ass"
          ? subtitle[field].replaceAll("\\N", " ").replaceAll("\n", " ").replaceAll("  ", " ")
          : subtitle[field].replaceAll("\n", " ").replaceAll("  ", " ")
      return { ...subtitle, [field]: updatedContent }
    })
    setSubtitles(updatedSubtitles)

    toast.success(`Removed all line breaks from ${field}`)
  }

  const handleRemoveBetweenCustom = (field: "content" | "translated") => {
    if (!subtitles.length || !customStart || !customEnd) return

    const regex = new RegExp(`${escapeRegExp(customStart)}(.*?)${escapeRegExp(customEnd)}`, "g")

    const updatedSubtitles = subtitles.map((subtitle) => {
      const updatedContent = subtitle[field].replace(regex, "").trim()
      return { ...subtitle, [field]: updatedContent }
    })
    setSubtitles(updatedSubtitles)

    toast.success(`Removed content between "${customStart}" and "${customEnd}" from ${field}`)
  }
  // Helper function to escape special characters for regex
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }


  const parseTimestamp = (timestamp: Timestamp) => {
    return timestamp.h * 3600000 + timestamp.m * 60000 + timestamp.s * 1000 + timestamp.ms
  }

  const formatTimestamp = (timeMs: number): Timestamp => {
    const h = Math.floor(timeMs / 3600000)
    const m = Math.floor((timeMs % 3600000) / 60000)
    const s = Math.floor((timeMs % 60000) / 1000)
    const ms = timeMs % 1000
    return { h, m, s, ms }
  }

  const handleShiftSubtitles = () => {
    if (!subtitles.length) return
    const shiftMs = shiftTime

    const updatedSubtitles = subtitles.map((subtitle) => {
      const startMs = parseTimestamp(subtitle.timestamp.start)
      const endMs = parseTimestamp(subtitle.timestamp.end)

      const newStartMs = Math.max(0, startMs + shiftMs)
      const newEndMs = Math.max(0, endMs + shiftMs)

      const newStart = formatTimestamp(newStartMs)
      const newEnd = formatTimestamp(newEndMs)

      return { ...subtitle, timestamp: { start: newStart, end: newEnd } }
    })
    setSubtitles(updatedSubtitles)

    toast.success(`Shifted subtitles by ${shiftTime} miliseconds`)
  }

  const onInputShiftTimeBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    let num = parseInt(value, 10)
    if (isNaN(num)) num = 0
    num = Math.floor(num)
    setShiftTime(num)
    event.target.value = String(num)
  }

  const showConfirmationDialog = (action: () => void) => {
    setAlertDialog({ open: true, action })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Subtitle Tools</DialogTitle>
        </DialogHeader>

        {/* Cleaner */}
        <div className="space-y-4">
          <DialogDescription className="font-medium text-base">Cleaner</DialogDescription>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="removeAllLineBreaks"
                checked={removeAllLineBreaks}
                onCheckedChange={(checked) => setRemoveAllLineBreaks(!!checked)}
                className="data-[state=checked]:bg-primary"
              />
              <label htmlFor="removeAllLineBreaks" className="text-sm font-medium leading-none cursor-pointer">
                Remove all line breaks
              </label>
            </div>
            {/* Custom Removal Section */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="removeBetweenCustom"
                checked={removeBetweenCustom}
                onCheckedChange={(checked) => setRemoveBetweenCustom(!!checked)}
                className="data-[state=checked]:bg-primary"
              />
              <label htmlFor="removeBetweenCustom" className="text-sm font-medium leading-none cursor-pointer">
                Remove everything between:
              </label>
            </div>
            <div className="flex items-center gap-x-2">
              <Input
                placeholder="Start"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                disabled={!removeBetweenCustom}
                className="w-24"

              />
              <Input
                placeholder="End"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                disabled={!removeBetweenCustom}
                className="w-24"
              />
            </div>
          </div>
          <div className="flex gap-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                showConfirmationDialog(() => {
                  if (removeAllLineBreaks) handleRemoveAllLineBreaks("content")
                  if (removeBetweenCustom) handleRemoveBetweenCustom("content")
                })
              }
              disabled={!removeAllLineBreaks && !removeBetweenCustom}
            >
              Apply to Original
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                showConfirmationDialog(() => {
                  if (removeAllLineBreaks) handleRemoveAllLineBreaks("translated")
                  if (removeBetweenCustom) handleRemoveBetweenCustom("translated")
                })
              }
              disabled={!removeAllLineBreaks && !removeBetweenCustom}
            >
              Apply to Translated
            </Button>
          </div>
        </div>

        {/* Time Shift */}
        <div className="space-y-4">
          <DialogDescription className="font-medium text-base">Time Shift</DialogDescription>
          <div className="grid gap-3">
            <Label htmlFor="shiftTime" className="text-sm">
              Shift subtitles (miliseconds)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="shiftTime"
                type="text"
                defaultValue={shiftTime}
                onBlur={onInputShiftTimeBlur}
                placeholder="Miliseconds"
                className="w-32"
                inputMode="numeric"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => showConfirmationDialog(handleShiftSubtitles)}
                disabled={!subtitles.length || shiftTime === 0}
              >
                Apply Shift
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>

      {/* Alert Dialog */}
      <AlertDialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}>
        <AlertDialogContentInner>
          <AlertDialogHeaderInner>
            <AlertDialogTitleInner>Are you sure?</AlertDialogTitleInner>
            <AlertDialogDescriptionInner>
              This action cannot be undone.
            </AlertDialogDescriptionInner>
          </AlertDialogHeaderInner>
          <AlertDialogFooterInner>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => alertDialog.action()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooterInner>
        </AlertDialogContentInner>
      </AlertDialog>
    </Dialog>
  )
})
