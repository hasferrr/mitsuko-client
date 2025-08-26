"use client"

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

interface SettingsDialogueProps {
  isGlobal?: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  projectName: string
  basicSettingsId: string
  advancedSettingsId: string
}

export const SettingsDialogue: React.FC<SettingsDialogueProps> = ({
  isGlobal,
  isOpen,
  onOpenChange,
  projectName,
  basicSettingsId,
  advancedSettingsId,
}) => {
  return (
    <DialogCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modal={false}
      fadeDuration={50}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isGlobal ? "Global Settings" : "Project Settings"}</DialogTitle>
          <DialogDescription>
            {isGlobal ? "This is the default settings for all projects." : `Default settings for "${projectName}" will go here.`}
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </DialogCustom>
  )
}