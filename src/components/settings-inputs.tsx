"use client"

import { memo, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/stores/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/use-advanced-settings-store"
import { useTranslationStore } from "@/stores/use-translation-store"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { useBeforeUnload } from "@/hooks/use-before-unload"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "./ui/button"
import { useSubtitleStore } from "@/stores/use-subtitle-store"


export const LanguageSelection = memo(() => {
  const sourceLanguage = useSettingsStore((state) => state.sourceLanguage)
  const setSourceLanguage = useSettingsStore((state) => state.setSourceLanguage)
  const targetLanguage = useSettingsStore((state) => state.targetLanguage)
  const setTargetLanguage = useSettingsStore((state) => state.setTargetLanguage)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Source Language</label>
        <Select defaultValue={sourceLanguage} onValueChange={setSourceLanguage}>
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
        <Select defaultValue={targetLanguage} onValueChange={setTargetLanguage}>
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
  const useCustomModel = useSettingsStore((state) => state.useCustomModel)
  const setUseCustomModel = useSettingsStore((state) => state.setUseCustomModel)
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
        <Select defaultValue="deepseek" disabled={useCustomModel}>
          <SelectTrigger className="bg-background dark:bg-muted/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deepseek">DeepSeek-R1</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="custom-model" checked={useCustomModel} onCheckedChange={setUseCustomModel} />
        <label htmlFor="custom-model" className="text-sm font-medium">
          Use Custom Model
        </label>
      </div>
      {useCustomModel && (
        <div className="space-y-4 pt-2">
          <Input
            value={customBaseUrl}
            onChange={(e) => setCustomBaseUrl(e.target.value)}
            placeholder="Base URL"
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
        Extract Context feature). This improves accuracy and relevance.
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
        max={1.3}
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
      num = Math.min(num, 500)
      setSplitSize(value === "" ? 0 : num)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSplitSize(Math.min(Math.max(parseInt(value, 10), 10), 500))
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
        min={10}
        max={1000}
        step={10}
        className="bg-background dark:bg-muted/30"
        inputMode="numeric"
      />
      <p className="text-xs text-muted-foreground">
        Determines the number of dialogues to process in each chunk.
        Smaller chunks can help with context management but may increase the token usage.
        Larger chunks increase efficiency but may result in truncation due to the maximum model output token limit. (10-500)
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
      num = Math.min(num, 164000)
      setMaxCompletionTokens(value === "" ? 0 : num)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMaxCompletionTokens(Math.min(Math.max(parseInt(value, 10), 512), 164000))
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
        min={512}
        max={164000}
        step={512}
        className="bg-background dark:bg-muted/30"
        inputMode="numeric"
      />
      <p className="text-xs text-muted-foreground">
        Sets the maximum number of tokens the model can generate for each subtitle chunk. (512-164,000)
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
  const response = useTranslationStore((state) => state.response)
  const jsonResponse = useTranslationStore((state) => state.jsonResponse)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  useAutoScroll(response, textareaRef)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [textareaRef])

  return (
    <div className="space-y-4">
      <Textarea
        ref={textareaRef}
        value={response.trim()}
        readOnly
        className="h-[420px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Translation output will appear here..."
      />
      <Textarea
        value={jsonResponse.length ? `[${jsonResponse.map(s => JSON.stringify(s, null, 2))}]` : ""}
        readOnly
        className="h-[270px] bg-background dark:bg-muted/30 resize-none overflow-y-auto font-mono text-sm"
        placeholder="Parsed JSON output will appear here..."
      />
    </div>
  )
})
