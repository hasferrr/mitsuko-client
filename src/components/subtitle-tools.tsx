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
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
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
import {
  removeAllLineBreaks,
  removeContentBetween,
} from "@/lib/subtitles/content"
import { shiftSubtitles } from "@/lib/subtitles/timestamp"
import { SubtitleTranslated } from "@/types/types"

interface SubtitleToolsProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
}

export const SubtitleTools = memo(({ isOpen, setIsOpen, children }: SubtitleToolsProps) => {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)
  const setSubtitles = useTranslationDataStore((state) => state.setSubtitles)
  const saveData = useTranslationDataStore((state) => state.saveData)

  const [removeAllLineBreaksChecked, setRemoveAllLineBreaksChecked] = useState(false)
  const [removeBetweenCustomChecked, setRemoveBetweenCustomChecked] = useState(false)
  const [customStart, setCustomStart] = useState("(")
  const [customEnd, setCustomEnd] = useState(")")
  const [shiftTime, setShiftTime] = useState(0)
  const [alertDialog, setAlertDialog] = useState<{ open: boolean; action: () => void }>({
    open: false,
    action: () => { },
  })

  const translation = currentId ? translationData[currentId] : null
  const subtitles = translation?.subtitles ?? []
  const parsed = translation?.parsed ?? { type: "srt", data: null }

  const handleSetSubtitles = async (newSubtitles: SubtitleTranslated[]) => {
    if (!currentId) return
    setSubtitles(currentId, newSubtitles)
    await saveData(currentId)
  }

  const handleRemoveAllLineBreaks = (field: "content" | "translated") => {
    if (!subtitles.length) return
    const updatedSubtitles = removeAllLineBreaks(subtitles, field, parsed.type === "ass")
    handleSetSubtitles(updatedSubtitles)
    toast.success(`Removed all line breaks from ${field === "content" ? "original" : "translated"} text`)
  }

  const handleRemoveBetweenCustom = (field: "content" | "translated") => {
    if (!subtitles.length || !customStart || !customEnd) return
    const updatedSubtitles = removeContentBetween(subtitles, field, customStart, customEnd)
    handleSetSubtitles(updatedSubtitles)
    toast.success(`Removed content between "${customStart}" and "${customEnd}" from ${field === "content" ? "original" : "translated"} text`)
  }

  const handleShiftSubtitles = () => {
    if (!subtitles.length) return
    const updatedSubtitles = shiftSubtitles(subtitles, shiftTime)
    handleSetSubtitles(updatedSubtitles)
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
                checked={removeAllLineBreaksChecked}
                onCheckedChange={(checked) => setRemoveAllLineBreaksChecked(!!checked)}
                className="data-[state=checked]:bg-primary"
              />
              <label htmlFor="removeAllLineBreaks" className="text-sm font-medium leading-none cursor-pointer">
                Remove all line breaks
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="removeBetweenCustom"
                checked={removeBetweenCustomChecked}
                onCheckedChange={(checked) => setRemoveBetweenCustomChecked(!!checked)}
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
                disabled={!removeBetweenCustomChecked}
                className="w-24 font-mono"
              />
              <Input
                placeholder="End"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                disabled={!removeBetweenCustomChecked}
                className="w-24 font-mono"
              />
            </div>
          </div>
          <div className="flex gap-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                showConfirmationDialog(() => {
                  if (removeAllLineBreaksChecked) handleRemoveAllLineBreaks("content")
                  if (removeBetweenCustomChecked) handleRemoveBetweenCustom("content")
                })
              }
              disabled={!removeAllLineBreaksChecked && !removeBetweenCustomChecked}
            >
              Apply to Original
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                showConfirmationDialog(() => {
                  if (removeAllLineBreaksChecked) handleRemoveAllLineBreaks("translated")
                  if (removeBetweenCustomChecked) handleRemoveBetweenCustom("translated")
                })
              }
              disabled={!removeAllLineBreaksChecked && !removeBetweenCustomChecked}
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
