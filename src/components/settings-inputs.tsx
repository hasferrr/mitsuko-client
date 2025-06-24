"use client"

import { memo, useRef, useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { ChevronsRight, Eye, EyeOff, FolderDown, List, Link as LinkIcon, FileText as FileTextIcon, XCircle, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import {
  SPLIT_SIZE_MIN,
  SPLIT_SIZE_MAX,
  MAX_COMPLETION_TOKENS_MIN,
  MAX_COMPLETION_TOKENS_MAX,
  TEMPERATURE_MIN,
  TEMPERATURE_MAX,
} from "@/constants/limits"
import { ModelSelector } from "@/components/model-selector"
import { LANGUAGES } from "@/constants/lang"
import { ComboBox } from "./ui-custom/combo-box"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SettingsParentType, Translation } from "@/types/project"
import { useProjectStore } from "@/stores/data/use-project-store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Extraction } from "@/types/project"
import { db } from "@/lib/db/db"
import { getContent } from "@/lib/parser/parser"
import { customInstructionPresets } from "@/constants/custom-instructions"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import WhichModels from "@/components/pricing/which-models"
import { HelpCircle } from "lucide-react"
import { useLocalSettingsStore } from '@/stores/use-local-settings-store'

export const LanguageSelection = memo(({ type }: { type: SettingsParentType }) => {
  const sourceLanguage = useSettingsStore((state) => state.getSourceLanguage())
  const setSourceLanguage = useSettingsStore((state) => state.setSourceLanguage)
  const targetLanguage = useSettingsStore((state) => state.getTargetLanguage())
  const setTargetLanguage = useSettingsStore((state) => state.setTargetLanguage)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Source Language</label>
        <ComboBox
          data={LANGUAGES}
          value={sourceLanguage}
          setValue={(t) => setSourceLanguage(t, type)}
          name="language"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Language</label>
        <ComboBox
          data={LANGUAGES}
          value={targetLanguage}
          setValue={(t) => setTargetLanguage(t, type)}
          name="language"
        />
      </div>
    </div>
  )
})

export const ModelSelection = memo(({
  type,
  showUseCustomModelSwitch = true
}: { type: SettingsParentType, showUseCustomModelSwitch?: boolean }) => {
  // Settings Store
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel())
  const setIsUseCustomModel = useSettingsStore((state) => state.setIsUseCustomModel)

  // API Settings Store
  const apiKey = useLocalSettingsStore((state) => state.apiKey)
  const customBaseUrl = useLocalSettingsStore((state) => state.customBaseUrl)
  const customModel = useLocalSettingsStore((state) => state.customModel)
  const setApiKey = useLocalSettingsStore((state) => state.setApiKey)
  const setCustomBaseUrl = useLocalSettingsStore((state) => state.setCustomBaseUrl)
  const setCustomModel = useLocalSettingsStore((state) => state.setCustomModel)
  const isThirdPartyModelEnabled = useLocalSettingsStore((state) => state.isThirdPartyModelEnabled)

  const [showApiKey, setShowApiKey] = useState(false)
  const [isWhichModelsDialogOpen, setIsWhichModelsDialogOpen] = useState(false)

  useEffect(() => {
    if (!isThirdPartyModelEnabled && isUseCustomModel) {
      setIsUseCustomModel(false, type)
    }
  }, [isThirdPartyModelEnabled, isUseCustomModel, setIsUseCustomModel, type])

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Model</label>
        <div className="flex items-center gap-2">
          <div className="flex-grow">
            <ModelSelector
              disabled={isUseCustomModel}
              type={type}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            size="default"
            className="w-10 flex items-center justify-center"
            onClick={() => setIsWhichModelsDialogOpen(true)}
            aria-label="Which Models Should I Use?"
          >
            <HelpCircle className="w-4 h-4 opacity-70" />
          </Button>
        </div>
      </div>
      {showUseCustomModelSwitch && isThirdPartyModelEnabled && (
        <div className="flex items-center space-x-2">
          <Switch id="custom-model" checked={isUseCustomModel} onCheckedChange={(checked) => setIsUseCustomModel(checked, type)} />
          <label htmlFor="custom-model" className="text-sm font-medium">
            Use Custom Model
          </label>
        </div>
      )}
      {isUseCustomModel && (
        <div className="space-y-4 pt-2">
          <Input
            value={customBaseUrl}
            onChange={(e) => setCustomBaseUrl(e.target.value)}
            placeholder="Base URL (OpenAI compatibility)"
            className="bg-background dark:bg-muted/30"
          />
          <Input
            value={customModel}
            onChange={(e) => setCustomModel(e.target.value)}
            placeholder="Model Name"
            className="bg-background dark:bg-muted/30"
          />
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="col-span-2 relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API Key"
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Dialog open={isWhichModelsDialogOpen} onOpenChange={setIsWhichModelsDialogOpen}>
        <DialogContent className="sm:max-w-2xl pt-2">
          <DialogTitle></DialogTitle>
          <WhichModels className="mt-0 p-2 border-0 shadow-none" />
        </DialogContent>
      </Dialog>
    </>
  )
})

export const ContextDocumentInput = memo(() => {
  const contextDocument = useSettingsStore((state) => state.getContextDocument())
  const setContextDocument = useSettingsStore((state) => state.setContextDocument)
  const { setHasChanges } = useUnsavedChanges()
  const [isContextDialogOpen, setIsContextDialogOpen] = useState(false)
  const currentProject = useProjectStore((state) => state.currentProject)
  const [projectExtractions, setProjectExtractions] = useState<Extraction[]>([])

  const loadProjectExtractions = useCallback(async () => {
    if (!currentProject) return
    const extractionsData = await db.extractions.bulkGet(currentProject.extractions)
    setProjectExtractions(extractionsData.filter((e): e is Extraction => !!e).toReversed())
  }, [currentProject])

  const handleContextDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setContextDocument(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
  }

  const handleContextSelect = (contextResult: string) => {
    setHasChanges(true)
    setContextDocument(getContent(contextResult).trim())
    setIsContextDialogOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Context Document</label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadProjectExtractions()
            setIsContextDialogOpen(true)
          }}
          className="h-8 px-2"
        >
          <FolderDown className="h-4 w-4" />
          Import
        </Button>
      </div>
      <Textarea
        value={contextDocument}
        onChange={handleContextDocumentChange}
        className="min-h-[120px] h-[120px] max-h-[300px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Add context about the video..."
        onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`)}
      />
      <p className="text-xs text-muted-foreground">
        Provide context from previous episodes (can be generated using the
        <span className="font-semibold"> Extract Context</span> feature). This improves accuracy and relevance.
      </p>

      <Dialog open={isContextDialogOpen} onOpenChange={setIsContextDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Context Document</DialogTitle>
            <DialogDescription>
              Choose a context document from your project extractions
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {projectExtractions.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No context documents found in this project
              </div>
            ) : isContextDialogOpen ? (
              <div className="space-y-2 mr-1">
                {projectExtractions.map((extraction) => (
                  <div
                    key={extraction.id}
                    className="p-3 border rounded-md cursor-pointer hover:bg-muted"
                    onClick={() => handleContextSelect(extraction.contextResult)}
                  >
                    <div className="font-medium">Episode {extraction.episodeNumber || "X"}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {extraction.contextResult.length ? extraction.contextResult.substring(0, 150) + "..." : "No content"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (null)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})

export const CustomInstructionsInput = memo(() => {
  const customInstructions = useSettingsStore((state) => state.getCustomInstructions())
  const setCustomInstructions = useSettingsStore((state) => state.setCustomInstructions)
  const [isPresetsDialogOpen, setIsPresetsDialogOpen] = useState(false)
  const { setHasChanges } = useUnsavedChanges()

  const handleCustomInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setCustomInstructions(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
  }

  const handlePresetSelect = (instruction: string) => {
    setHasChanges(true)
    setCustomInstructions(instruction)
    setIsPresetsDialogOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Additional Instructions</label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPresetsDialogOpen(true)}
          className="h-8 px-2"
        >
          <List className="h-4 w-4" />
          Presets
        </Button>
      </div>
      <Textarea
        value={customInstructions}
        onChange={handleCustomInstructionsChange}
        className="min-h-[120px] h-[120px] max-h-[300px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Provide specific instructions to guide the translation model..."
        onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`)}
      />
      <p className="text-xs text-muted-foreground">
        Guide the model's translation style, tone, or specific terminology usage. This is passed directly to the system prompt.
      </p>

      <Dialog open={isPresetsDialogOpen} onOpenChange={setIsPresetsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Custom Instruction Preset</DialogTitle>
            <DialogDescription>
              Choose a preset to guide the translation model.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="space-y-2 mr-1">
              {customInstructionPresets.map((preset) => (
                <div
                  key={preset.title}
                  className="p-3 border rounded-md cursor-pointer hover:bg-muted"
                  onClick={() => handlePresetSelect(preset.instruction)}
                >
                  <div className="font-medium">{preset.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {preset.instruction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})

export const FewShotInput = memo(() => {
  const isFewShotEnabled = useSettingsStore((state) => state.getFewShotIsEnabled())
  const setIsFewShotEnabled = useSettingsStore((state) => state.setIsFewShotEnabled)
  const fewShotValue = useSettingsStore((state) => state.getFewShotValue())
  const setFewShotValue = useSettingsStore((state) => state.setFewShotValue)
  const fewShotLinkedId = useSettingsStore((state) => state.getFewShotLinkedId())
  const setFewShotLinkedId = useSettingsStore((state) => state.setFewShotLinkedId)
  const fewShotType = useSettingsStore((state) => state.getFewShotType())
  const setFewShotType = useSettingsStore((state) => state.setFewShotType)
  const fewShotStartIndex = useSettingsStore((state) => state.getFewShotStartIndex())
  const setFewShotStartIndex = useSettingsStore((state) => state.setFewShotStartIndex)
  const fewShotEndIndex = useSettingsStore((state) => state.getFewShotEndIndex())
  const setFewShotEndIndex = useSettingsStore((state) => state.setFewShotEndIndex)

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
            setFewShotStartIndex(1)
          }
          if (fewShotEndIndex === undefined || fewShotEndIndex > lineCount || fewShotEndIndex < (fewShotStartIndex || 1)) {
            setFewShotEndIndex(lineCount > 0 ? lineCount : 1)
          }
        } else {
          setLinkedTranslationTitle(null)
          setLinkedTranslationLineCount(null)
          setFewShotStartIndex(undefined)
          setFewShotEndIndex(undefined)
        }
      })
    }
  }, [isFewShotEnabled, fewShotType, fewShotLinkedId, setFewShotStartIndex, setFewShotEndIndex])

  const handleFewShotValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setFewShotValue(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
  }

  const handleEnableChange = (enabled: boolean) => {
    setHasChanges(true)
    setIsFewShotEnabled(enabled)
    if (enabled && fewShotType === 'linked' && !fewShotLinkedId) {
      loadAvailableTranslations()
    }
  }

  const handleTypeChange = (type: 'manual' | 'linked') => {
    setHasChanges(true)
    setIsFewShotEnabled(true)
    setFewShotType(type)
    if (type === 'linked' && !fewShotLinkedId) {
      loadAvailableTranslations()
    }
  }

  const handleLinkTranslationSelect = async (translation: Translation) => {
    setHasChanges(true)
    setIsFewShotEnabled(true)
    setFewShotLinkedId(translation.id)
    setFewShotType('linked')
    setLinkedTranslationTitle(translation.title)
    const lineCount = translation.subtitles?.length || 0
    setLinkedTranslationLineCount(lineCount)
    setFewShotStartIndex(1)
    setFewShotEndIndex(Math.min(lineCount > 0 ? lineCount : 1, 20))
    setIsLinkTranslationDialogOpen(false)
  }

  const handleUnlinkTranslation = () => {
    setHasChanges(true)
    setFewShotLinkedId("")
    setLinkedTranslationTitle(null)
    setLinkedTranslationLineCount(null)
    setFewShotStartIndex(undefined)
    setFewShotEndIndex(undefined)
  }

  const openLinkDialog = () => {
    loadAvailableTranslations()
    setIsLinkTranslationDialogOpen(true)
  }

  const handleStartIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
    setHasChanges(true)
    if (value === undefined) {
      setFewShotStartIndex(undefined)
      return
    }
    if (!isNaN(value) && linkedTranslationLineCount !== null) {
      const newStartIndex = Math.max(1, Math.min(value, linkedTranslationLineCount))
      setFewShotStartIndex(newStartIndex)
      if (fewShotEndIndex !== undefined && newStartIndex > fewShotEndIndex) {
        setFewShotEndIndex(newStartIndex)
      }
    }
  }

  const handleEndIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
    setHasChanges(true)
    if (value === undefined) {
      setFewShotEndIndex(undefined)
      return
    }
    if (!isNaN(value) && linkedTranslationLineCount !== null) {
      const newEndIndex = Math.max(fewShotStartIndex || 1, Math.min(value, linkedTranslationLineCount))
      setFewShotEndIndex(newEndIndex)
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
              Use subtitles from other translation projects as examples. This helps the model understand the translation styles and nuances.
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

export const TemperatureSlider = memo(({ type }: { type: SettingsParentType }) => {
  const temperature = useAdvancedSettingsStore((state) => state.getTemperature())
  const setTemperature = useAdvancedSettingsStore((state) => state.setTemperature)
  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Temperature</label>
        <span className="text-sm text-muted-foreground">
          {temperature}
        </span>
      </div>
      <Slider
        value={[temperature]}
        onValueChange={([value]) => setTemperature(value, type)}
        max={TEMPERATURE_MAX}
        min={TEMPERATURE_MIN}
        step={0.1}
        className="py-2"
      />
      <p className="text-xs text-muted-foreground">
        Controls the randomness of the output.
        Higher values produce more diverse (creative) results,
        lower values produce more consistent (accurate) results.
      </p>
    </div>
  )
})

export const StartIndexInput = memo(() => {
  const startIndex = useAdvancedSettingsStore((state) => state.getStartIndex())
  const endIndex = useAdvancedSettingsStore((state) => state.getEndIndex())
  const setStartIndex = useAdvancedSettingsStore((state) => state.setStartIndex)
  const setEndIndex = useAdvancedSettingsStore((state) => state.setEndIndex)
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)
  const subtitles = currentId ? translationData[currentId]?.subtitles ?? [] : []

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (/^\d*$/.test(value)) {
      let num = parseInt(value, 10)
      num = Math.min(num, subtitles.length)
      num = value === "" ? 0 : num
      setStartIndex(num)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setStartIndex(Math.min(Math.max(parseInt(value, 10), 1), subtitles.length))
    if (startIndex > endIndex) {
      setEndIndex(Math.max(1, startIndex))
    }
  }

  const handleFindEmptyTranslation = () => {
    for (let i = 0; i < subtitles.length; i++) {
      if (
        subtitles[i].translated.trim() === "" &&
        subtitles[i].content.trim() !== ""
      ) {
        setStartIndex(i + 1)
        setEndIndex(subtitles.length)
        break
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Start Index</label>
      </div>
      <div className="relative">
        <Input
          type="text"
          value={startIndex}
          onBlur={handleBlur}
          onChange={handleChange}
          min={1}
          max={subtitles.length}
          step={1}
          className="bg-background dark:bg-muted/30 pr-10"
          inputMode="numeric"
        />
        <TooltipProvider>
          <Tooltip delayDuration={10}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                onClick={handleFindEmptyTranslation}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium text-center">Find the first subtitle with empty</p>
              <p className="font-medium text-center">translation and set it as the start index</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-xs text-muted-foreground">
        Start translation from this subtitle index. Useful for resuming translations. (1-{subtitles.length})
      </p>
    </div>
  )
})

export const EndIndexInput = memo(() => {
  const startIndex = useAdvancedSettingsStore((state) => state.getStartIndex())
  const endIndex = useAdvancedSettingsStore((state) => state.getEndIndex())
  const setStartIndex = useAdvancedSettingsStore((state) => state.setStartIndex)
  const setEndIndex = useAdvancedSettingsStore((state) => state.setEndIndex)
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)
  const subtitles = currentId ? translationData[currentId]?.subtitles ?? [] : []

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (/^\d*$/.test(value)) {
      let num = parseInt(value, 10)
      num = Math.min(num, subtitles.length)
      num = value === "" ? 0 : num
      setEndIndex(num)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setEndIndex(Math.min(Math.max(parseInt(value, 10), 1), subtitles.length))
    if (endIndex < startIndex) {
      setStartIndex(Math.max(1, endIndex))
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">End Index</label>
      </div>
      <Input
        type="text"
        value={endIndex}
        onBlur={handleBlur}
        onChange={handleChange}
        min={1}
        max={subtitles.length}
        step={1}
        className="bg-background dark:bg-muted/30"
        inputMode="numeric"
      />
      <p className="text-xs text-muted-foreground">
        End translation at this subtitle index. This index will also be translated. (1-{subtitles.length})
      </p>
    </div>
  )
})

export const SplitSizeInput = memo(() => {
  const splitSize = useAdvancedSettingsStore((state) => state.getSplitSize())
  const setSplitSize = useAdvancedSettingsStore((state) => state.setSplitSize)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Allow only numbers, and handle empty string
    if (/^\d*$/.test(value)) {
      let num = parseInt(value, 10) // Prevent NaN
      num = Math.min(num, SPLIT_SIZE_MAX)
      setSplitSize(value === "" ? 0 : num)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSplitSize(Math.min(Math.max(parseInt(value, 10), SPLIT_SIZE_MIN), SPLIT_SIZE_MAX))
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Split Size</label>
      </div>
      <Input
        type="text"
        value={splitSize}
        onBlur={handleBlur}
        onChange={handleChange}
        min={SPLIT_SIZE_MIN}
        max={SPLIT_SIZE_MAX}
        step={10}
        className="bg-background dark:bg-muted/30"
        inputMode="numeric"
      />
      <p className="text-xs text-muted-foreground">
        Determines the number of dialogues to process in each chunk.
        Smaller chunks can help with context management and reliability.
        Larger chunks increase efficiency but may result in response quality degradation.
        ({SPLIT_SIZE_MIN}-{SPLIT_SIZE_MAX})
      </p>
    </div>
  )
})

export const MaxCompletionTokenInput = memo(({ type }: { type: SettingsParentType }) => {
  const modelDetail = useSettingsStore((state) => state.getModelDetail())
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel())
  const maxCompletionTokens = useAdvancedSettingsStore((state) => state.getMaxCompletionTokens())
  const setMaxCompletionTokens = useAdvancedSettingsStore((state) => state.setMaxCompletionTokens)
  const isMaxCompletionTokensAuto = useAdvancedSettingsStore((state) => state.getIsMaxCompletionTokensAuto())
  const setIsMaxCompletionTokensAuto = useAdvancedSettingsStore((state) => state.setIsMaxCompletionTokensAuto)

  const maxToken = isUseCustomModel || !modelDetail
    ? MAX_COMPLETION_TOKENS_MAX
    : modelDetail.maxOutput

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Allow only numbers, and handle empty string
    if (/^\d*$/.test(value)) {
      let num = parseInt(value, 10) // Prevent NaN
      num = Math.min(num, maxToken)
      setMaxCompletionTokens(value === "" ? 0 : num, type)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMaxCompletionTokens(Math.min(Math.max(parseInt(value, 10), MAX_COMPLETION_TOKENS_MIN), maxToken), type)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Max Completion Token</label>
        <Switch
          checked={!isMaxCompletionTokensAuto}
          onCheckedChange={(checked) => setIsMaxCompletionTokensAuto(!checked, type)}
        />
      </div>
      <Input
        type="text"
        value={maxCompletionTokens}
        onBlur={handleBlur}
        onChange={handleChange}
        min={MAX_COMPLETION_TOKENS_MIN}
        max={maxToken}
        step={512}
        className="bg-background dark:bg-muted/30"
        inputMode="numeric"
        disabled={isMaxCompletionTokensAuto}
      />
      <p className="text-xs text-muted-foreground">
        Maximum number of tokens the model can generate for each subtitle chunk.
        {isMaxCompletionTokensAuto ? " Currently set to auto." : ` (${MAX_COMPLETION_TOKENS_MIN}-${maxToken}).`}
      </p>
    </div>
  )
})

export const StructuredOutputSwitch = memo(() => {
  const modelDetail = useSettingsStore((state) => state.getModelDetail())
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel())
  const useStructuredOutput = useAdvancedSettingsStore((state) => state.getIsUseStructuredOutput())
  const setUseStructuredOutput = useAdvancedSettingsStore((state) => state.setIsUseStructuredOutput)

  const disabled = !isUseCustomModel && !modelDetail?.structuredOutput

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Structured Outputs</label>
        <Switch
          disabled={disabled}
          checked={useStructuredOutput}
          onCheckedChange={setUseStructuredOutput}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Enables structured JSON output. You can turn this option off if the model doesn't support it.
      </p>
    </div>
  )
})

export const FullContextMemorySwitch = memo(() => {
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.getIsUseFullContextMemory())
  const setIsUseFullContextMemory = useAdvancedSettingsStore((state) => state.setIsUseFullContextMemory)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      setIsConfirmDialogOpen(true)
    } else {
      setIsUseFullContextMemory(false)
    }
  }

  const handleConfirm = () => {
    setIsUseFullContextMemory(true)
    setIsConfirmDialogOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Full Context Memory</label>
        <Switch
          checked={isUseFullContextMemory}
          onCheckedChange={handleCheckedChange}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        When enabled, it's using all previous chunks to improve translation
        consistency and accuracy, but drastically increases token usage and the risk of hitting
        input token limits. Only for models with large context windows (128k+ tokens).
        When disabled, it's only including the last previous chunk.
      </p>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Full Context Memory?</DialogTitle>
            <DialogDescription className="pt-2">
              Warning: This feature uses all previous chunks for context,
              which significantly increases token usage and costs. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})

export const BetterContextCachingSwitch = memo(() => {
  const isBetterContextCaching = useAdvancedSettingsStore((state) => state.getIsBetterContextCaching())
  const setIsBetterContextCaching = useAdvancedSettingsStore((state) => state.setIsBetterContextCaching)
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.getIsUseFullContextMemory())

  const isMinimalContextMode = !isBetterContextCaching

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Minimal Context Mode</label>
        <Switch
          checked={isUseFullContextMemory ? false : isMinimalContextMode}
          onCheckedChange={(value) => setIsBetterContextCaching(!value)}
          disabled={isUseFullContextMemory}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Uses minimal context to significantly reduce token usage and cost.
        When enabled, it will only use 5 dialogues from the previous chunk as context.
        When disabled, it maintains a balanced approach using the last previous chunk.
      </p>
    </div>
  )
})

export const AdvancedReasoningSwitch = memo(() => {
  // TODO: Remove isAdvancedReasoningEnabled state from advanced settings store, indexed db, and remove this switch
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Advanced Reasoning & Planning
          </span>
        </label>
        <TooltipProvider>
          <Tooltip delayDuration={10}>
            <TooltipTrigger asChild>
              <div>
                <Switch checked disabled />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This feature is always enabled for optimal translation quality</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-xs text-muted-foreground">
        Enable the AI follows a more structured & multi-step thinking process.
        It first understands the original text and context, then reviews its translations, drafts, critiques, and refines the translation.
        Great for reasoning/thinking models.
      </p>
    </div>
  )
})

export const SystemPromptInput = memo(() => {
  const prompt = ""
  const setPrompt = (val: string) => console.log(val)
  const { setHasChanges } = useUnsavedChanges()

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setPrompt(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">System Prompt</label>
      <Textarea
        disabled
        value={prompt}
        onChange={handlePromptChange}
        className="min-h-[150px] h-[150px] max-h-[80vh] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Enter translation instructions..."
        onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
      />
    </div>
  )
})

export const AdvancedSettingsResetButton = () => {
  const resetAdvancedSettings = useAdvancedSettingsStore((state) => state.resetAdvancedSettings)
  const [value, setValue] = useState("Reset Settings")
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const handleReset = () => {
    resetAdvancedSettings()
    setValue("✅ Reset Success")
    setTimeout(() => setValue("Reset Settings"), 2000)
  }

  return (
    <Button ref={buttonRef} onClick={handleReset} variant="outline">
      {value}
    </Button>
  )
}
