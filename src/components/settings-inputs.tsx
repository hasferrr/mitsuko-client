"use client"

import { memo, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/use-advanced-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { ChevronsRight, Eye, EyeOff } from "lucide-react"
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
import { useInitRefStore } from "@/stores/use-init-store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


export const LanguageSelection = memo(() => {
  const sourceLanguage = useSettingsStore((state) => state.sourceLanguage)
  const setSourceLanguage = useSettingsStore((state) => state.setSourceLanguage)
  const targetLanguage = useSettingsStore((state) => state.targetLanguage)
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

export const ModelSelection = memo(() => {
  const isUseCustomModel = useSettingsStore((state) => state.isUseCustomModel)
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
        <ModelSelector disabled={isUseCustomModel} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="custom-model" checked={isUseCustomModel} onCheckedChange={setIsUseCustomModel} />
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
  const contextDocument = useSettingsStore((state) => state.contextDocument)
  const setContextDocument = useSettingsStore((state) => state.setContextDocument)
  const { setHasChanges } = useUnsavedChanges()

  const handleContextDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setContextDocument(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Context Document</label>
      <Textarea
        value={contextDocument}
        onChange={handleContextDocumentChange}
        className="min-h-[150px] h-[150px] max-h-[80vh] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Add context about the video..."
        onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
      />
      <p className="text-xs text-muted-foreground">
        Provide context from previous episodes (can be generated using the
        <span className="font-semibold"> Extract Context</span> feature). This improves accuracy and relevance.
      </p>
    </div>
  )
})

export const TemperatureSlider = memo(() => {
  const temperature = useAdvancedSettingsStore((state) => state.temperature)
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
        Controls the randomness of the output. Higher values produce more diverse results, lower values produce more consistent results.
      </p>
    </div>
  )
})

export const StartIndexInput = memo(() => {
  const startIndex = useAdvancedSettingsStore((state) => state.startIndex)
  const endIndex = useAdvancedSettingsStore((state) => state.endIndex)
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
  const startIndex = useAdvancedSettingsStore((state) => state.startIndex)
  const endIndex = useAdvancedSettingsStore((state) => state.endIndex)
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
  const splitSize = useAdvancedSettingsStore((state) => state.splitSize)
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
        Larger chunks increase efficiency but may result in truncation
        due to the model output token limit. ({SPLIT_SIZE_MIN}-{SPLIT_SIZE_MAX})
      </p>
    </div>
  )
})

export const MaxCompletionTokenInput = memo(() => {
  const modelDetail = useSettingsStore((state) => state.modelDetail)
  const isUseCustomModel = useSettingsStore((state) => state.isUseCustomModel)
  const maxCompletionTokens = useAdvancedSettingsStore((state) => state.maxCompletionTokens)
  const setMaxCompletionTokens = useAdvancedSettingsStore((state) => state.setMaxCompletionTokens)
  const isMaxCompletionTokensAuto = useAdvancedSettingsStore((state) => state.isMaxCompletionTokensAuto)
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
      setMaxCompletionTokens(value === "" ? 0 : num)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMaxCompletionTokens(Math.min(Math.max(parseInt(value, 10), MAX_COMPLETION_TOKENS_MIN), maxToken))
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Max Completion Token</label>
        <Switch
          checked={!isMaxCompletionTokensAuto}
          onCheckedChange={(checked) => setIsMaxCompletionTokensAuto(!checked)}
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
      {isMaxCompletionTokensAuto
        ? <p className="text-xs text-muted-foreground">
          Maximum number of tokens the model can generate for each subtitle chunk is set to auto.
        </p>
        : <p className="text-xs text-muted-foreground">
          Sets the maximum number of tokens the model can generate for each subtitle chunk. ({MAX_COMPLETION_TOKENS_MIN}-{maxToken})
        </p>}
    </div>
  )
})

export const StructuredOutputSwitch = memo(() => {
  const modelDetail = useSettingsStore((state) => state.modelDetail)
  const isUseCustomModel = useSettingsStore((state) => state.isUseCustomModel)
  const useStructuredOutput = useAdvancedSettingsStore((state) => state.isUseStructuredOutput)
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
        Enables structured JSON output. You can turn this option off if the model doesn't
        support it, but you may parse the output manually.
      </p>
    </div>
  )
})

export const FullContextMemorySwitch = memo(() => {
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.isUseFullContextMemory)
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
        input token limits. Best for models with large context windows (64k+ tokens).
        When disabled, it's only including the last previous chunk.
      </p>
    </div>
  )
})

export const BetterContextCachingSwitch = memo(() => {
  const isBetterContextCaching = useAdvancedSettingsStore((state) => state.isBetterContextCaching)
  const setIsBetterContextCaching = useAdvancedSettingsStore((state) => state.setIsBetterContextCaching)
  const isUseFullContextMemory = useAdvancedSettingsStore((state) => state.isUseFullContextMemory)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Better Context Caching</label>
        <Switch
          checked={isBetterContextCaching || isUseFullContextMemory}
          onCheckedChange={setIsBetterContextCaching}
          disabled={isUseFullContextMemory}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Hit the cache to reduce input token cost significantly.
        When <span className="font-semibold">Full Context Memory</span> is disabled
        AND when <span className="font-semibold">Better Context Caching</span> is enabled,
        it will use the last previous chunk as a context.
        Otherwise, it's only take the last 5 dialogues from the previous chunk.
      </p>
    </div>
  )
})

export const SystemPromptInput = memo(() => {
  const prompt = useAdvancedSettingsStore((state) => state.prompt)
  const setPrompt = useAdvancedSettingsStore((state) => state.setPrompt)
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
