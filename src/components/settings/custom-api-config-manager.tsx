"use client"

import { useState, useEffect } from "react"
import { useLocalSettingsStore, CustomApiConfig } from "@/stores/use-local-settings-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react"

export function CustomApiConfigManager() {
  const {
    customApiConfigs,
    selectedApiConfigIndex,
    addApiConfig,
    updateApiConfig,
    removeApiConfig,
    selectApiConfig,
  } = useLocalSettingsStore()

  const [apiKey, setApiKey] = useState("")
  const [customBaseUrl, setCustomBaseUrl] = useState("")
  const [customModel, setCustomModel] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    if (selectedApiConfigIndex !== null && customApiConfigs[selectedApiConfigIndex]) {
      const selectedConfig = customApiConfigs[selectedApiConfigIndex]
      setApiKey(selectedConfig.apiKey)
      setCustomBaseUrl(selectedConfig.customBaseUrl)
      setCustomModel(selectedConfig.customModel)
    } else {
      setApiKey("")
      setCustomBaseUrl("")
      setCustomModel("")
    }
  }, [selectedApiConfigIndex, customApiConfigs])

  const handleBlur = async () => {
    if (selectedApiConfigIndex !== null) {
      const config: Omit<CustomApiConfig, "name"> = { apiKey, customBaseUrl, customModel }
      await updateApiConfig(selectedApiConfigIndex, config)
    }
  }

  const handleAddNew = () => {
    const newConfig: Omit<CustomApiConfig, "name"> = {
      apiKey: "",
      customBaseUrl: "",
      customModel: "",
    }
    addApiConfig(newConfig)
    selectApiConfig(customApiConfigs.length)
  }

  const handleRemove = () => {
    if (selectedApiConfigIndex !== null) {
      removeApiConfig(selectedApiConfigIndex)
    }
  }


  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Select
          value={selectedApiConfigIndex !== null ? String(selectedApiConfigIndex) : ""}
          onValueChange={(value) => selectApiConfig(Number(value))}
        >
          <SelectTrigger className="w-0 flex-1 min-w-0">
            <SelectValue placeholder="Select a configuration" className="truncate" />
          </SelectTrigger>
          <SelectContent>
            {customApiConfigs.map((config, index) => (
              <SelectItem key={index} value={String(index)}>
                {config.customModel || `Untitled ${index + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="px-2" onClick={handleAddNew}>
          <Plus className="h-4 w-4" />
        </Button>
        {selectedApiConfigIndex !== null && (
          <Button variant="destructive" size="sm" className="px-2" onClick={handleRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Input
        value={customBaseUrl}
        onChange={(e) => setCustomBaseUrl(e.target.value)}
        onBlur={handleBlur}
        placeholder="Base URL (OpenAI compatibility)"
        className="bg-background dark:bg-muted/30"
        disabled={selectedApiConfigIndex === null}
      />
      <Input
        value={customModel}
        onChange={(e) => setCustomModel(e.target.value)}
        onBlur={handleBlur}
        placeholder="Model Name"
        className="bg-background dark:bg-muted/30"
        disabled={selectedApiConfigIndex === null}
      />
      <div className="relative">
        <Input
          type={showApiKey ? "text" : "password"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onBlur={handleBlur}
          placeholder="API Key"
          className="pr-12 sentry-block ph-no-capture"
          disabled={selectedApiConfigIndex === null}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
          onClick={() => setShowApiKey(!showApiKey)}
        >
          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}