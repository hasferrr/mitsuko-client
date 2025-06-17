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
  LanguageSelection,
  ModelSelection,
  TemperatureSlider,
  AdvancedReasoningSwitch
} from "@/components/settings-inputs"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface SettingsDialogueProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  projectName: string
}

export const SettingsDialogue: React.FC<SettingsDialogueProps> = ({
  isOpen,
  onOpenChange,
  projectName,
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
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Default settings for "{projectName}" will go here.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <LanguageSelection type="project" />
          <ModelSelection
            type="project"
            showUseCustomModelSwitch={false}
          />
          <Accordion type="single" collapsible className="border-none">
            <AccordionItem value="advanced-settings" className="border-none">
              <AccordionTrigger className="text-sm font-medium py-0">
                Advanced Settings
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-0">
                <div className="space-y-4">
                  <div className="border border-muted-foreground/20 rounded-md p-4">
                    <TemperatureSlider type="project" />
                  </div>
                  <div className="border border-muted-foreground/20 rounded-md p-4">
                    <AdvancedReasoningSwitch type="project" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {/* <Button type="submit">Save</Button> */}
        </DialogFooter>
      </DialogContent>
    </DialogCustom>
  )
}