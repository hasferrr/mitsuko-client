"use client"

import { memo, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, HelpCircle } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useLocalSettingsStore } from '@/stores/use-local-settings-store'
import { ModelSelector } from "@/components/model-selector"
import WhichModels from "@/components/pricing/which-models"
import { SettingsParentType } from "@/types/project"

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