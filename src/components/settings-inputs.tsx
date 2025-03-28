"use client"

import { memo, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/use-advanced-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { ChevronsRight, Eye, EyeOff, FolderDown } from "lucide-react"
import { Button } from "./ui/button"
import { useTranslationDataStore } from "@/stores/use-translation-data-store"
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
import { ProjectType } from "@/types/project"
import { useProjectStore } from "@/stores/use-project-store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Extraction } from "@/types/project"
import { db } from "@/lib/db/db"

export const LanguageSelection = memo(() => {
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
          setValue={setSourceLanguage}
          name="language"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Language</label>
        <ComboBox
          data={LANGUAGES}
          value={targetLanguage}
          setValue={setTargetLanguage}
          name="language"
        />
      </div>
    </div>
  )
})

export const ModelSelection = memo(({ type }: { type: ProjectType }) => {
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel())
  const setIsUseCustomModel = useSettingsStore((state) => state.setIsUseCustomModel)
  const customBaseUrl = useSettingsStore((state) => state.customBaseUrl)
  const setCustomBaseUrl = useSettingsStore((state) => state.setCustomBaseUrl)
  const customModel = useSettingsStore((state) => state.customModel)
  const setCustomModel = useSettingsStore((state) => state.setCustomModel)
  const apiKey = useSettingsStore((state) => state.apiKey)
  const setApiKey = useSettingsStore((state) => state.setApiKey)

  const [showApiKey, setShowApiKey] = useState(false)

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Model</label>
        <ModelSelector disabled={isUseCustomModel} type={type} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="custom-model" checked={isUseCustomModel} onCheckedChange={(checked) => setIsUseCustomModel(checked, type)} />
        <label htmlFor="custom-model" className="text-sm font-medium">
          Use Custom Model
        </label>
      </div>
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

  useEffect(() => {
    if (!currentProject) return

    const loadExtractions = async () => {
      const extractionsData = await db.extractions.bulkGet(currentProject.extractions)
      setProjectExtractions(extractionsData.filter((e): e is Extraction => !!e))
    }

    loadExtractions()
  }, [currentProject])

  const handleContextDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setContextDocument(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }

  const handleContextSelect = (contextResult: string) => {
    setHasChanges(true)
    setContextDocument(contextResult)
    setIsContextDialogOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Context Document</label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsContextDialogOpen(true)}
          className="h-8 px-2"
        >
          <FolderDown className="h-4 w-4" />
          Import
        </Button>
      </div>
      <Textarea
        value={contextDocument}
        onChange={handleContextDocumentChange}
        className="min-h-[150px] h-[150px] max-h-[70vh] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Add context about the video..."
        onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
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
            ) : (
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})

export const TemperatureSlider = memo(() => {
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
        onValueChange={([value]) => setTemperature(value)}
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

export const MaxCompletionTokenInput = memo(({ type }: { type: ProjectType }) => {
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
        Enables structured JSON output. You can turn this option off if you want
        to see the thinking process of reasoning model or if the model doesn't support it.
      </p>
    </div>
  )
})

export const FullContextMemorySwitch = memo(() => {
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.getIsUseFullContextMemory())
  const setIsUseFullContextMemory = useAdvancedSettingsStore((state) => state.setIsUseFullContextMemory)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Full Context Memory</label>
        <Switch
          checked={isUseFullContextMemory}
          onCheckedChange={setIsUseFullContextMemory}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        When enabled, it's using all previous chunks to improve translation
        consistency and accuracy, but increases token usage and the risk of hitting
        input token limits. Best for models with large context windows (128k+ tokens).
        When disabled, it's only including the last previous chunk.
      </p>
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

export const SystemPromptInput = memo(() => {
  const prompt = ""
  const setPrompt = (val: string) => { }
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
