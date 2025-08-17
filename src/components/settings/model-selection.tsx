"use client"

import { memo, useCallback, useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useLocalSettingsStore } from '@/stores/use-local-settings-store'
import { ModelSelector } from "@/components/model-selector"
import WhichModels from "@/components/pricing/which-models"
import { CustomApiConfigManager } from "./custom-api-config-manager"
import { SettingsParentType } from "@/types/project"

interface ModelSelectionProps {
  basicSettingsId: string
  advancedSettingsId: string
  parent: SettingsParentType
  showUseCustomModelSwitch?: boolean
}

export const ModelSelection = memo(({
  basicSettingsId,
  advancedSettingsId,
  parent,
  showUseCustomModelSwitch = true
}: ModelSelectionProps) => {
  // Settings Store
  const isUseCustomModel = useSettingsStore((state) => state.getIsUseCustomModel(basicSettingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setIsUseCustomModel = useCallback((value: boolean, parent: SettingsParentType) => {
    setBasicSettingsValue(basicSettingsId, "isUseCustomModel", value, parent)
  }, [basicSettingsId, setBasicSettingsValue])

  // API Settings Store
  const isThirdPartyModelEnabled = useLocalSettingsStore((state) => state.isThirdPartyModelEnabled)
  const [isWhichModelsDialogOpen, setIsWhichModelsDialogOpen] = useState(false)

  useEffect(() => {
    if (!isThirdPartyModelEnabled && isUseCustomModel) {
      setIsUseCustomModel(false, parent)
    }
  }, [isThirdPartyModelEnabled, isUseCustomModel, setIsUseCustomModel, parent])

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Model</label>
        <div className="flex items-center gap-2">
          <div className="flex-grow">
            <ModelSelector
              basicSettingsId={basicSettingsId}
              advancedSettingsId={advancedSettingsId}
              disabled={isUseCustomModel}
              type={parent}
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
          <Switch id="custom-model" checked={isUseCustomModel} onCheckedChange={(checked) => setIsUseCustomModel(checked, parent)} />
          <label htmlFor="custom-model" className="text-sm font-medium">
            Use Custom Model
          </label>
        </div>
      )}
      {isUseCustomModel && <CustomApiConfigManager />}
      <Dialog open={isWhichModelsDialogOpen} onOpenChange={setIsWhichModelsDialogOpen}>
        <DialogContent className="sm:max-w-2xl pt-2">
          <DialogTitle></DialogTitle>
          <WhichModels className="mt-0 p-2 border-0 shadow-none" />
        </DialogContent>
      </Dialog>
    </>
  )
})