"use client"

import { memo, useState, useCallback, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { XCircle, Link as LinkIcon, FileText as FileTextIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { Translation } from "@/types/project"
import { db } from "@/lib/db/db"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { SettingsParentType } from "@/types/project"

interface Props {
  basicSettingsId: string
  parent: SettingsParentType
}

export const FewShotInput = memo(({ basicSettingsId, parent }: Props) => {
  const isFewShotEnabled = useSettingsStore((state) => state.getFewShotIsEnabled(basicSettingsId))
  const fewShotValue = useSettingsStore((state) => state.getFewShotValue(basicSettingsId))
  const fewShotLinkedId = useSettingsStore((state) => state.getFewShotLinkedId(basicSettingsId))
  const fewShotType = useSettingsStore((state) => state.getFewShotType(basicSettingsId))
  const fewShotStartIndex = useSettingsStore((state) => state.getFewShotStartIndex(basicSettingsId))
  const fewShotEndIndex = useSettingsStore((state) => state.getFewShotEndIndex(basicSettingsId))
  const _setIsFewShotEnabled = useSettingsStore((state) => state.setIsFewShotEnabled)
  const _setFewShotValue = useSettingsStore((state) => state.setFewShotValue)
  const _setFewShotLinkedId = useSettingsStore((state) => state.setFewShotLinkedId)
  const _setFewShotType = useSettingsStore((state) => state.setFewShotType)
  const _setFewShotStartIndex = useSettingsStore((state) => state.setFewShotStartIndex)
  const _setFewShotEndIndex = useSettingsStore((state) => state.setFewShotEndIndex)

  const setIsFewShotEnabled = (isEnabled: boolean, parent: SettingsParentType) => _setIsFewShotEnabled(basicSettingsId, isEnabled, parent)
  const setFewShotValue = (value: string, parent: SettingsParentType) => _setFewShotValue(basicSettingsId, value, parent)
  const setFewShotLinkedId = (linkedId: string, parent: SettingsParentType) => _setFewShotLinkedId(basicSettingsId, linkedId, parent)
  const setFewShotType = (type: 'manual' | 'linked', parent: SettingsParentType) => _setFewShotType(basicSettingsId, type, parent)
  const setFewShotStartIndex = (index: number, parent: SettingsParentType) => _setFewShotStartIndex(basicSettingsId, index, parent)
  const setFewShotEndIndex = (index: number, parent: SettingsParentType) => _setFewShotEndIndex(basicSettingsId, index, parent)

  const currentTranslationId = useTranslationDataStore((state) => state.currentId)
  const currentProject = useProjectStore((state) => state.currentProject)

  const { setHasChanges } = useUnsavedChanges()
  const [isLinkTranslationDialogOpen, setIsLinkTranslationDialogOpen] = useState(false)
  const [availableTranslations, setAvailableTranslations] = useState<Translation[]>([])
  const [linkedTranslationTitle, setLinkedTranslationTitle] = useState<string | null>(null)
  const [linkedTranslationLineCount, setLinkedTranslationLineCount] = useState<number | null>(null)

  const loadAvailableTranslations = useCallback(async () => {
    if (!currentProject) return
    const translationsData = await db.translations.bulkGet(currentProject.translations)
    setAvailableTranslations(
      translationsData
        .filter((t): t is Translation => !!t && t.id !== currentTranslationId)
        .toReversed()
    )
  }, [currentProject, currentTranslationId])

  useEffect(() => {
    if (fewShotType === 'linked' && fewShotLinkedId) {
      db.translations.get(fewShotLinkedId).then(translation => {
        if (translation) {
          setLinkedTranslationTitle(translation.title)
          const lineCount = translation.subtitles?.length || 0
          setLinkedTranslationLineCount(lineCount)
          if (fewShotStartIndex === undefined || fewShotStartIndex < 1) {
            setFewShotStartIndex(1, parent)
          }
          if (fewShotEndIndex === undefined || fewShotEndIndex > lineCount || fewShotEndIndex < (fewShotStartIndex || 1)) {
            setFewShotEndIndex(lineCount > 0 ? lineCount : 1, parent)
          }
        } else {
          setLinkedTranslationTitle(null)
          setLinkedTranslationLineCount(null)
          setFewShotStartIndex(0, parent)
          setFewShotEndIndex(0, parent)
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFewShotEnabled, fewShotType, fewShotLinkedId, setFewShotStartIndex, setFewShotEndIndex, parent])

  const handleFewShotValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setFewShotValue(e.target.value, parent)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
  }

  const handleEnableChange = (enabled: boolean) => {
    setHasChanges(true)
    setIsFewShotEnabled(enabled, parent)
    if (enabled && fewShotType === 'linked' && !fewShotLinkedId) {
      loadAvailableTranslations()
    }
  }

  const handleTypeChange = (type: 'manual' | 'linked') => {
    setHasChanges(true)
    setIsFewShotEnabled(true, parent)
    setFewShotType(type, parent)
    if (type === 'linked' && !fewShotLinkedId) {
      loadAvailableTranslations()
    }
  }

  const handleLinkTranslationSelect = async (translation: Translation) => {
    setHasChanges(true)
    setIsFewShotEnabled(true, parent)
    setFewShotLinkedId(translation.id, parent)
    setFewShotType('linked', parent)
    setLinkedTranslationTitle(translation.title)
    const lineCount = translation.subtitles?.length || 0
    setLinkedTranslationLineCount(lineCount)
    setFewShotStartIndex(1, parent)
    setFewShotEndIndex(Math.min(lineCount > 0 ? lineCount : 1, 20), parent)
    setIsLinkTranslationDialogOpen(false)
  }

  const handleUnlinkTranslation = () => {
    setHasChanges(true)
    setFewShotLinkedId("", parent)
    setLinkedTranslationTitle(null)
    setLinkedTranslationLineCount(null)
    setFewShotStartIndex(0, parent)
    setFewShotEndIndex(0, parent)
  }

  const openLinkDialog = () => {
    loadAvailableTranslations()
    setIsLinkTranslationDialogOpen(true)
  }

  const handleStartIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
    setHasChanges(true)
    if (value === undefined) {
      setFewShotStartIndex(0, parent)
      return
    }
    if (!isNaN(value) && linkedTranslationLineCount !== null) {
      const newStartIndex = Math.max(1, Math.min(value, linkedTranslationLineCount))
      setFewShotStartIndex(newStartIndex, parent)
      if (fewShotEndIndex !== undefined && newStartIndex > fewShotEndIndex) {
        setFewShotEndIndex(newStartIndex, parent)
      }
    }
  }

  const handleEndIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
    setHasChanges(true)
    if (value === undefined) {
      setFewShotEndIndex(0, parent)
      return
    }
    if (!isNaN(value) && linkedTranslationLineCount !== null) {
      const newEndIndex = Math.max(fewShotStartIndex || 1, Math.min(value, linkedTranslationLineCount))
      setFewShotEndIndex(newEndIndex, parent)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Few-shot Examples</Label>
        <Switch
          checked={isFewShotEnabled}
          onCheckedChange={handleEnableChange}
        />
      </div>

      <>
        <RadioGroup
          disabled={!isFewShotEnabled}
          value={fewShotType}
          onValueChange={(value) => handleTypeChange(value as 'manual' | 'linked')}
          className={cn("flex space-x-4 mb-2 py-2", !isFewShotEnabled && "opacity-50")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="linked" id="fewshot-link" />
            <Label htmlFor="fewshot-link" className="font-normal">Link Translation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="fewshot-manual" />
            <Label htmlFor="fewshot-manual" className="font-normal">Manual Input</Label>
          </div>
        </RadioGroup>

        {fewShotType === 'manual' && (
          <>
            <Textarea
              disabled={!isFewShotEnabled}
              value={fewShotValue}
              onChange={handleFewShotValueChange}
              className="min-h-[260px] h-[260px] max-h-[300px] font-mono bg-background dark:bg-muted/30 resize-none overflow-y-auto"
              placeholder={`Provide few-shot examples in JSON format:\n${JSON.stringify([{ content: "string", translated: "string" }, { content: "string", translated: "string" }], null, 2)}`}
              onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`)}
            />
            <p className="text-xs text-muted-foreground">
              Input examples directly. Ensure data is structured as: [{'{content: "string", translated: "string"}'}, ...]
            </p>
          </>
        )}

        {fewShotType === 'linked' && (
          <div className="space-y-3">
            {fewShotLinkedId && linkedTranslationTitle ? (
              <div className={cn("p-3 border rounded-md space-y-3", !isFewShotEnabled && "opacity-50")}>
                <div className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Linked: {linkedTranslationTitle}</span>
                    <p className="text-xs text-muted-foreground">{linkedTranslationLineCount === null ? '...' : linkedTranslationLineCount} Lines</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={openLinkDialog} className="h-8 px-2">
                      <LinkIcon className="h-3 w-3" /> Change
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleUnlinkTranslation} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <Label htmlFor="fewshot-start-index" className="text-xs">Start Line</Label>
                    <Input
                      id="fewshot-start-index"
                      type="number"
                      value={fewShotStartIndex === undefined ? '' : fewShotStartIndex}
                      onBlur={handleStartIndexChange}
                      onChange={handleStartIndexChange}
                      min={1}
                      max={linkedTranslationLineCount || 1}
                      className="bg-background dark:bg-muted/30 h-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={linkedTranslationLineCount === null}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fewshot-end-index" className="text-xs">End Line</Label>
                    <Input
                      id="fewshot-end-index"
                      type="number"
                      value={fewShotEndIndex === undefined ? '' : fewShotEndIndex}
                      onBlur={handleEndIndexChange}
                      onChange={handleEndIndexChange}
                      min={fewShotStartIndex || 1}
                      max={linkedTranslationLineCount || 1}
                      className="bg-background dark:bg-muted/30 h-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={linkedTranslationLineCount === null}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Note: Using a large number of lines will significantly increase token and credit usage.
                </p>
              </div>
            ) : (
              <Button
                disabled={!isFewShotEnabled}
                variant="outline"
                onClick={openLinkDialog}
                className="w-full"
              >
                <LinkIcon className="h-4 w-4" />
                Link Existing Translation Project
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Use subtitles from other translation projects as examples. This helps the model understand the translation styles.
            </p>
          </div>
        )}
      </>

      <Dialog open={isLinkTranslationDialogOpen} onOpenChange={setIsLinkTranslationDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Link Translation for Few-shot Examples</DialogTitle>
            <DialogDescription>
              Select an existing translation project. Its subtitles will be used as examples.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto py-2 pr-2 space-y-2">
            {availableTranslations.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No other translation projects available to link.
              </div>
            ) : (
              availableTranslations.map((translation) => (
                <div
                  key={translation.id}
                  className="p-3 border rounded-md cursor-pointer hover:bg-muted flex items-center justify-between"
                  onClick={() => handleLinkTranslationSelect(translation)}
                >
                  <div>
                    <div className="font-medium">{translation.title || "Untitled Translation"}</div>
                    <div className="text-sm text-muted-foreground">
                      {translation.subtitles?.length || 0} lines
                    </div>
                  </div>
                  <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsLinkTranslationDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})