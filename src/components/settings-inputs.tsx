"use client"

import { memo, Dispatch, SetStateAction, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface LanguageSelectionProps {
  sourceLanguage: string
  setSourceLanguage: Dispatch<SetStateAction<string>>
  targetLanguage: string
  setTargetLanguage: Dispatch<SetStateAction<string>>
}

interface ModelSelectionProps {
  useCustomModel: boolean
  setUseCustomModel: Dispatch<SetStateAction<boolean>>
  customBaseUrl: string
  setCustomBaseUrl: Dispatch<SetStateAction<string>>
  customModel: string
  setCustomModel: Dispatch<SetStateAction<string>>
  apiKey: string
  setApiKey: Dispatch<SetStateAction<string>>
}

interface ContextDocumentInputProps {
  contextDocument: string
  setContextDocument: Dispatch<SetStateAction<string>>
}

interface TemperatureSliderProps {
  temperature: number
  setTemperature: Dispatch<SetStateAction<number>>
}

interface SplitSizeInputProps {
  splitSize: number
  setSplitSize: Dispatch<SetStateAction<number>>
}

interface SystemPromptInputProps {
  prompt: string
  setPrompt: Dispatch<SetStateAction<string>>
}

interface ProcessOutputProps {
  response: string
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export const LanguageSelection = memo(({ sourceLanguage, setSourceLanguage, targetLanguage, setTargetLanguage }: LanguageSelectionProps) => {
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

export const ModelSelection = memo(({ useCustomModel, setUseCustomModel, customBaseUrl, setCustomBaseUrl, customModel, setCustomModel, apiKey, setApiKey }: ModelSelectionProps) => {
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

export const ContextDocumentInput = memo(({ contextDocument, setContextDocument }: ContextDocumentInputProps) => {
  const handleContextDocumentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContextDocument(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }, [setContextDocument])

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

export const TemperatureSlider = memo(({ temperature, setTemperature }: TemperatureSliderProps) => {
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

export const SplitSizeInput = memo(({ splitSize, setSplitSize }: SplitSizeInputProps) => {
  const handleSplitSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setSplitSize(Math.max(0, Math.min(500, value)))
  }, [setSplitSize])

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

export const SystemPromptInput = memo(({ prompt, setPrompt }: SystemPromptInputProps) => {
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }, [setPrompt])

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

export const ProcessOutput = memo(({ response, textareaRef }: ProcessOutputProps) => {
  return (
    <Textarea
      ref={textareaRef}
      value={response.trim()}
      readOnly
      className="h-[500px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
      placeholder="Translation output will appear here..."
    />
  )
})
