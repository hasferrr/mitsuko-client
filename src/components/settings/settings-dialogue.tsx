"use client"

import { Settings2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import { SettingsParentType } from "@/types/project"

interface BaseSettingsDialogueProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  basicSettingsId: string
  advancedSettingsId: string
  settingsParentType: SettingsParentType
}

interface GlobalSettingsDialogueProps extends BaseSettingsDialogueProps {
  mode: 'global'
}

interface ProjectSettingsDialogueProps extends BaseSettingsDialogueProps {
  mode: 'project'
  projectName: string
  resetFromBasicSettingsId?: string
  resetFromAdvancedSettingsId?: string
  isDefaultEnabled?: boolean
  onDefaultEnabledChange?: (enabled: boolean) => void
  onOpenGlobalSettings?: () => void
}

type SettingsDialogueProps = GlobalSettingsDialogueProps | ProjectSettingsDialogueProps

export const SettingsDialogue: React.FC<SettingsDialogueProps> = (props) => {
  const {
    isOpen,
    onOpenChange,
    basicSettingsId,
    advancedSettingsId,
    settingsParentType,
  } = props

  const isGlobal = props.mode === 'global'
  const projectName = props.mode === 'project' ? props.projectName : ''
  const resetFromBasicSettingsId = props.mode === 'project' ? props.resetFromBasicSettingsId : undefined
  const resetFromAdvancedSettingsId = props.mode === 'project' ? props.resetFromAdvancedSettingsId : undefined
  const isDefaultEnabled = props.mode === 'project' ? props.isDefaultEnabled : undefined
  const onDefaultEnabledChange = props.mode === 'project' ? props.onDefaultEnabledChange : undefined
  const onOpenGlobalSettings = props.mode === 'project' ? props.onOpenGlobalSettings : undefined
  const resetBasicSettings = useSettingsStore((s) => s.resetBasicSettings)
  const resetAdvancedSettings = useAdvancedSettingsStore((s) => s.resetAdvancedSettings)
  const resetBasicSettingsToGlobal = useSettingsStore((s) => s.resetBasicSettingsToGlobal)
  const resetAdvancedSettingsToGlobal = useAdvancedSettingsStore((s) => s.resetAdvancedSettingsToGlobal)
  const resetBasicSettingsFrom = useSettingsStore((s) => s.resetBasicSettingsFrom)
  const resetAdvancedSettingsFrom = useAdvancedSettingsStore((s) => s.resetAdvancedSettingsFrom)

  const dialogTitle = isGlobal
    ? "Global Settings"
    : settingsParentType === 'translation'
      ? "Translation Settings"
      : settingsParentType === 'extraction'
        ? "Extraction Settings"
        : "Project Settings"

  const dialogDescription = isGlobal
    ? settingsParentType === 'translation'
      ? "This is the default translation settings for all projects."
      : settingsParentType === 'extraction'
        ? "This is the default extraction settings for all projects."
        : "This is the default settings for all projects."
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

    const basicResetPromise = resetFromBasicSettingsId
      ? resetBasicSettingsFrom(resetFromBasicSettingsId, basicSettingsId)
      : resetBasicSettingsToGlobal(basicSettingsId)

    const advancedResetPromise = resetFromAdvancedSettingsId
      ? resetAdvancedSettingsFrom(resetFromAdvancedSettingsId, advancedSettingsId)
      : resetAdvancedSettingsToGlobal(advancedSettingsId)

    await Promise.all([
      basicResetPromise,
      advancedResetPromise,
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

        {!isGlobal && settingsParentType !== 'project' && isDefaultEnabled !== undefined && onDefaultEnabledChange && (
          <div className="flex items-center justify-between gap-2 p-4 border rounded-md mb-4 bg-muted/20">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`enable-default-${settingsParentType}`}>
                Enable Settings
              </Label>
              <p className="text-xs text-muted-foreground">
                When enabled, new {settingsParentType}s will use these custom default settings. When disabled, they will use your Global settings.
              </p>
            </div>
            <Switch
              id={`enable-default-${settingsParentType}`}
              checked={isDefaultEnabled}
              onCheckedChange={onDefaultEnabledChange}
            />
          </div>
        )}

        <div className={`space-y-4 ${!isGlobal && settingsParentType !== 'project' && isDefaultEnabled === false ? 'opacity-50 pointer-events-none' : ''}`}>
          {settingsParentType === 'extraction' ? (
            <div className="space-y-4">
              <ModelSelection
                basicSettingsId={basicSettingsId}
                advancedSettingsId={advancedSettingsId}
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
          {!isGlobal && settingsParentType !== 'project' && onOpenGlobalSettings && (
            <Button variant="outline" className="mr-auto" onClick={onOpenGlobalSettings}>
              <Settings2 className="size-4" />
              Global Settings
            </Button>
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
                  {isGlobal
                    ? "This will reset settings to defaults."
                    : "This will reset to global settings."
                  }
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