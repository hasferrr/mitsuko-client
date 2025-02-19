"use client"

import { memo, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { SubtitleMinimal } from "@/types/types"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { useAdvancedSettingsStore } from "@/stores/useAdvancedSettingsStore"

interface ProcessOutputProps {
  response: string
  jsonResponse: SubtitleMinimal[]
}


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
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API Key"
            className="bg-background dark:bg-muted/30"
          />
        </div>
      )}
    </>
  )
})

export const ContextDocumentInput = memo(() => {
  const contextDocument = useSettingsStore((state) => state.contextDocument)
  const setContextDocument = useSettingsStore((state) => state.setContextDocument)

  const handleContextDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    </div>
  )
})

export const TemperatureSlider = memo(() => {
  const temperature = useAdvancedSettingsStore((state) => state.temperature)
  const setTemperature = useAdvancedSettingsStore((state) => state.setTemperature)
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium">Temperature</label>
        <span className="text-sm text-muted-foreground">{temperature}</span>
      </div>
      <Slider
        value={[temperature]}
        onValueChange={([value]) => setTemperature(value)}
        max={1.3}
        step={0.1}
        className="py-2"
      />
    </div>
  )
})

export const SplitSizeInput = memo(() => {
  const splitSize = useAdvancedSettingsStore((state) => state.splitSize)
  const setSplitSize = useAdvancedSettingsStore((state) => state.setSplitSize)

  const handleSplitSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setSplitSize(Math.max(0, Math.min(500, value)))
  }
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Split Size</label>
      <Input
        disabled
        type="number"
        value={splitSize}
        onChange={handleSplitSizeChange}
        min={0}
        max={500}
        className="bg-background dark:bg-muted/30"
      />
    </div>
  )
})

export const SystemPromptInput = memo(() => {
  const prompt = useAdvancedSettingsStore((state) => state.prompt)
  const setPrompt = useAdvancedSettingsStore((state) => state.setPrompt)

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

export const ProcessOutput = memo(({ response, jsonResponse }: ProcessOutputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (textareaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = textareaRef.current
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100

      if (isAtBottom) {
        textareaRef.current.scrollTop = scrollHeight
      }
    }
  }, [response])

  return (
    <div className="space-y-4">
      <Textarea
        ref={textareaRef}
        value={response.trim()}
        readOnly
        className="h-[400px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Translation output will appear here..."
      />
      <Textarea
        value={jsonResponse.length ? `[${jsonResponse.map(s => JSON.stringify(s, null, 2))}]` : ""}
        readOnly
        className="h-[200px] bg-background dark:bg-muted/30 resize-none overflow-y-auto font-mono text-sm"
        placeholder="Parsed JSON output will appear here..."
      />
    </div>
  )
})
