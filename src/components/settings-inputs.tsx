"use client"

import { memo, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/use-advanced-settings-store"
import { useTranslationStore } from "@/stores/use-translation-store"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { useBeforeUnload } from "@/hooks/use-before-unload"
import { Currency, Eye, EyeOff } from "lucide-react"
import { Button } from "./ui/button"
import { useSubtitleStore } from "@/stores/use-subtitle-store"
import {
  SPLIT_SIZE_MIN,
  SPLIT_SIZE_MAX,
  MAX_COMPLETION_TOKENS_MIN,
  MAX_COMPLETION_TOKENS_MAX,
  TEMPERATURE_MIN,
  TEMPERATURE_MAX,
} from "@/constants/limits"
import { FREE_MODELS } from "@/constants/model"
import { parseTranslationJson } from "@/lib/parser"
import { cn } from "@/lib/utils"


export const LanguageSelection = memo(() => {
  const sourceLanguage = useSettingsStore((state) => state.sourceLanguage)
  const setSourceLanguage = useSettingsStore((state) => state.setSourceLanguage)
  const targetLanguage = useSettingsStore((state) => state.targetLanguage)
  const setTargetLanguage = useSettingsStore((state) => state.setTargetLanguage)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Source Language</label>
        <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
          <SelectTrigger className="bg-background dark:bg-muted/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="japanese">Japanese</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="korean">Korean</SelectItem>
            <SelectItem value="chinese">Chinese</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Language</label>
        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
          <SelectTrigger className="bg-background dark:bg-muted/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="indonesian">Indonesian</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="japanese">Japanese</SelectItem>
            <SelectItem value="korean">Korean</SelectItem>
            <SelectItem value="chinese">Chinese</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
})

export const ModelSelection = memo(() => {
  const selectedModel = useSettingsStore((state) => state.selectedModel)
  const setSelectedModel = useSettingsStore((state) => state.setSelectedModel)
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
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
          disabled={isUseCustomModel}
        >
          <SelectTrigger className="bg-background dark:bg-muted/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>
                Free Models (Limited)
              </SelectLabel>
              {FREE_MODELS.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
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
  const { setHasChanges } = useBeforeUnload()

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
        Smaller chunks can help with context management but may increase the token usage.
        Larger chunks increase efficiency but may result in truncation due to the maximum model output token limit. ({SPLIT_SIZE_MIN}-{SPLIT_SIZE_MAX})
      </p>
    </div>
  )
})

export const MaxCompletionTokenInput = memo(() => {
  const maxCompletionTokens = useAdvancedSettingsStore((state) => state.maxCompletionTokens)
  const setMaxCompletionTokens = useAdvancedSettingsStore((state) => state.setMaxCompletionTokens)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Allow only numbers, and handle empty string
    if (/^\d*$/.test(value)) {
      let num = parseInt(value, 10) // Prevent NaN
      num = Math.min(num, MAX_COMPLETION_TOKENS_MAX)
      setMaxCompletionTokens(value === "" ? 0 : num)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMaxCompletionTokens(Math.min(Math.max(parseInt(value, 10), MAX_COMPLETION_TOKENS_MIN), MAX_COMPLETION_TOKENS_MAX))
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Max Completion Token</label>
      </div>
      <Input
        type="text"
        value={maxCompletionTokens}
        onBlur={handleBlur}
        onChange={handleChange}
        min={MAX_COMPLETION_TOKENS_MIN}
        max={MAX_COMPLETION_TOKENS_MAX}
        step={512}
        className="bg-background dark:bg-muted/30"
        inputMode="numeric"
      />
      <p className="text-xs text-muted-foreground">
        Sets the maximum number of tokens the model can generate for each subtitle chunk. ({MAX_COMPLETION_TOKENS_MIN}-{MAX_COMPLETION_TOKENS_MAX})
      </p>
    </div>
  )
})

export const SystemPromptInput = memo(() => {
  const prompt = useAdvancedSettingsStore((state) => state.prompt)
  const setPrompt = useAdvancedSettingsStore((state) => state.setPrompt)
  const { setHasChanges } = useBeforeUnload()

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

export const StartIndexInput = memo(() => {
  const startIndex = useAdvancedSettingsStore((state) => state.startIndex)
  const setStartIndex = useAdvancedSettingsStore((state) => state.setStartIndex)
  const subtitles = useSubtitleStore((state) => state.subtitles)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (/^\d*$/.test(value)) {
      let num = parseInt(value, 10)
      num = Math.min(num, subtitles.length)
      setStartIndex(value === "" ? 0 : num)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setStartIndex(Math.min(Math.max(parseInt(value, 10), 1), subtitles.length))
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Start Index</label>
      </div>
      <Input
        type="text"
        value={startIndex}
        onBlur={handleBlur}
        onChange={handleChange}
        min={1}
        max={subtitles.length}
        step={1}
        className="bg-background dark:bg-muted/30"
        inputMode="numeric"
      />
      <p className="text-xs text-muted-foreground">
        Start translation from this subtitle index. Useful for resuming translations. (1-{subtitles.length})
      </p>
    </div>
  )
})

export const ProcessOutput = memo(() => {
  // Translation store
  const response = useTranslationStore((state) => state.response)
  const jsonResponse = useTranslationStore((state) => state.jsonResponse)
  const setJsonResponse = useTranslationStore((state) => state.setJsonResponse)
  const isTranslating = useTranslationStore((state) => state.isTranslating)

  // Subtitle store
  const subtitles = useSubtitleStore((state) => state.subtitles)
  const setSubtitles = useSubtitleStore((state) => state.setSubtitles)

  // State
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [isParseError, setIsParseError] = useState(false)
  const topTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const bottomTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const jsonText = jsonResponse.length ? `[${jsonResponse.map(s => JSON.stringify(s, null, 2))}]` : ""

  useAutoScroll(response, topTextareaRef)

  useEffect(() => {
    if (isParseError) {
      setIsParseError(false)
    }
  }, [editValue])

  useEffect(() => {
    setEditValue(jsonText)
    if (isParseError) {
      setIsParseError(false)
    }
  }, [isEditing])

  useEffect(() => {
    if (isTranslating) {
      setIsEditing(false)
    }
  }, [isTranslating])

  useEffect(() => {
    if (topTextareaRef.current) {
      topTextareaRef.current.scrollTop = topTextareaRef.current.scrollHeight
    }
  }, [topTextareaRef])

  const handleChangeJSONInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value)
  }

  const handleEditText = () => {
    bottomTextareaRef.current?.focus()
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleParseAndSave = () => {
    try {
      const parsed = parseTranslationJson(editValue)
      setJsonResponse(parsed)
      setIsParseError(false)
    } catch {
      console.log("Failed to parse JSON. Please check the format.")
      setIsParseError(true)
      bottomTextareaRef?.current?.focus()
      return
    }
    setIsEditing(false)
  }

  const handleApply = () => {
    const tlChunk = jsonResponse
    if (!tlChunk.length) {
      return
    }

    const merged = [...subtitles]
    for (let i = 0; i < tlChunk.length; i++) {
      const index = tlChunk[i].index - 1
      merged[index] = {
        ...merged[index],
        translated: tlChunk[i].translated || merged[index].translated,
      }
    }
    setSubtitles(merged)
  }

  return (
    <div className="space-y-4">
      <Textarea
        ref={topTextareaRef}
        value={response.trim()}
        readOnly
        className="h-[390px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Translation output will appear here..."
      />
      <Textarea
        ref={bottomTextareaRef}
        value={isEditing ? editValue : jsonText}
        readOnly={!isEditing}
        onChange={handleChangeJSONInput}
        className={cn(
          "h-[257px] bg-background dark:bg-muted/30 resize-none overflow-y-auto font-mono text-sm",
          isParseError && "focus-visible:ring-red-600",
        )}
        placeholder="Parsed JSON output will appear here..."
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={isEditing ? "default" : "outline"}
          onClick={isEditing ? handleParseAndSave : handleEditText}
          disabled={isTranslating}
          className="w-full"
        >
          {isEditing ? "Parse & Save" : "Edit Text"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={isEditing ? handleCancelEdit : handleApply}
          disabled={isTranslating}
          className="w-full"
        >
          {isEditing ? "Cancel" : "Apply to Subtitles"}
        </Button>

      </div>
    </div>
  )
})
