"use client"

import { Info } from "lucide-react"
import { DialogCustom } from "@/components/ui-custom/dialog-custom"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AdvancedSettingsResetButton,
  BetterContextCachingSwitch,
  ContextDocumentInput,
  CustomInstructionsInput,
  FewShotInput,
  FullContextMemorySwitch,
  LanguageSelection,
  MaxCompletionTokenInput,
  ModelSelection,
  SplitSizeInput,
  StructuredOutputSwitch,
  TemperatureSlider,
} from "@/components/settings"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { SettingsParentType } from "@/types/project"

interface SettingsDialogueProps {
  isGlobal?: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  projectName: string
  basicSettingsId: string
  advancedSettingsId: string
  settingsParentType?: SettingsParentType
}

export const SettingsDialogue: React.FC<SettingsDialogueProps> = ({
  isGlobal,
  isOpen,
  onOpenChange,
  projectName,
  basicSettingsId,
  advancedSettingsId,
  settingsParentType = 'project',
}) => {
  const resetBasicSettings = useSettingsStore((s) => s.resetBasicSettings)
  const resetAdvancedSettings = useAdvancedSettingsStore((s) => s.resetAdvancedSettings)
  const resetBasicSettingsToGlobal = useSettingsStore((s) => s.resetBasicSettingsToGlobal)
  const resetAdvancedSettingsToGlobal = useAdvancedSettingsStore((s) => s.resetAdvancedSettingsToGlobal)
  const isSeparateSettingsEnabled = useLocalSettingsStore((s) => s.isSeparateSettingsEnabled)

  const dialogTitle = isGlobal
    ? "Global Settings"
    : settingsParentType === 'translation'
      ? "Translation Settings"
      : settingsParentType === 'extraction'
        ? "Extraction Settings"
        : "Project Settings"

  const dialogDescription = isGlobal
    ? "This is the default settings for all projects."
    : settingsParentType === 'translation'
      ? `Default translation settings for "${projectName}" will go here.`
      : settingsParentType === 'extraction'
        ? `Default extraction settings for "${projectName}" will go here.`
        : `Default settings for "${projectName}" will go here.`

  const handleResetAll = async () => {
    if (isGlobal) {
      await Promise.all([
        resetBasicSettings(basicSettingsId),
        resetAdvancedSettings(advancedSettingsId, basicSettingsId),
      ])
      return
    }

    await Promise.all([
      resetBasicSettingsToGlobal(basicSettingsId),
      resetAdvancedSettingsToGlobal(advancedSettingsId),
    ])
  }

  return (
    <DialogCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modal={false}
      fadeDuration={50}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {settingsParentType === 'extraction' ? (
            <div className="space-y-4">
              <ModelSelection
                basicSettingsId={basicSettingsId}
                advancedSettingsId={advancedSettingsId}
                showUseCustomModelSwitch={false}
              />
              <Accordion type="multiple" className="border-none space-y-4">
                <AccordionItem value="advanced-settings" className="border-none">
                  <AccordionTrigger className="text-sm font-medium py-0">
                    Advanced Settings
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2">
                    <div className="border border-muted-foreground/20 rounded-md p-4 space-y-6">
                      <MaxCompletionTokenInput
                        basicSettingsId={basicSettingsId}
                        advancedSettingsId={advancedSettingsId}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ) : (
            <div className="space-y-4">
              <LanguageSelection
                basicSettingsId={basicSettingsId}
              />
              <ModelSelection
                basicSettingsId={basicSettingsId}
                advancedSettingsId={advancedSettingsId}
                showUseCustomModelSwitch={false}
              />
              <Accordion type="multiple" className="border-none space-y-4">
                <AccordionItem value="context-settings" className="border-none">
                  <AccordionTrigger className="text-sm font-medium py-0">
                    Context & Instruction Settings
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2">
                    <div className="border border-muted-foreground/20 rounded-md p-4 space-y-6">
                      <ContextDocumentInput
                        basicSettingsId={basicSettingsId}
                      />
                      <CustomInstructionsInput
                        basicSettingsId={basicSettingsId}
                      />
                      <FewShotInput
                        basicSettingsId={basicSettingsId}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="advanced-settings" className="border-none">
                  <AccordionTrigger className="text-sm font-medium py-0">
                    Advanced Settings
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2">
                    <div className="border border-muted-foreground/20 rounded-md p-4 space-y-6">
                      <TemperatureSlider
                        advancedSettingsId={advancedSettingsId}
                      />
                      <p className="text-sm font-semibold">Technical Options</p>
                      <SplitSizeInput
                        advancedSettingsId={advancedSettingsId}
                      />
                      <MaxCompletionTokenInput
                        basicSettingsId={basicSettingsId}
                        advancedSettingsId={advancedSettingsId}
                      />
                      <StructuredOutputSwitch
                        basicSettingsId={basicSettingsId}
                        advancedSettingsId={advancedSettingsId}
                      />
                      <FullContextMemorySwitch
                        advancedSettingsId={advancedSettingsId}
                      />
                      <BetterContextCachingSwitch
                        advancedSettingsId={advancedSettingsId}
                      />
                      <AdvancedSettingsResetButton
                        basicSettingsId={basicSettingsId}
                        advancedSettingsId={advancedSettingsId}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
        <DialogFooter>
          {!isGlobal && settingsParentType === 'project' && isSeparateSettingsEnabled && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-3 w-3">
                <Info className="h-3 w-3" />
              </div>
              This settings will not be used because "Separate Default Settings" is enabled.
            </div>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                Reset All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset Basic and Advanced settings to defaults for this project.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetAll}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </DialogCustom>
  )
}