"use client"

import { memo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { List } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { customInstructionPresets } from "@/constants/custom-instructions"
import { CustomInstructionsLibraryControls } from "@/components/settings/custom-instructions-library-controls"
import { CustomInstructionsSaveDialog } from "@/components/settings/custom-instructions-save-dialog"

interface Props {
  basicSettingsId: string
}

export const CustomInstructionsInput = memo(({ basicSettingsId }: Props) => {
  const customInstructions = useSettingsStore((state) => state.getCustomInstructions(basicSettingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setCustomInstructions = (instructions: string) => setBasicSettingsValue(basicSettingsId, "customInstructions", instructions)

  const [isPresetsDialogOpen, setIsPresetsDialogOpen] = useState(false)
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false)

  const { setHasChanges } = useUnsavedChanges()

  const handleCustomInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setCustomInstructions(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
  }

  const handlePresetSelect = (instruction: string) => {
    setHasChanges(true)
    setCustomInstructions(instruction)
    setIsPresetsDialogOpen(false)
  }

  const handleLibrarySelect = (instruction: string) => {
    setHasChanges(true)
    setCustomInstructions(instruction)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Custom Instructions</label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPresetsDialogOpen(true)}
            className="h-8 px-2"
          >
            <List className="h-4 w-4" />
            Presets
          </Button>
          <CustomInstructionsLibraryControls
            customInstructions={customInstructions}
            onSelectFromLibrary={handleLibrarySelect}
          />
          <CustomInstructionsSaveDialog customInstructions={customInstructions} />
        </div>
      </div>
      <Textarea
        value={customInstructions}
        onChange={handleCustomInstructionsChange}
        className="min-h-[120px] h-[120px] max-h-[300px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Provide specific instructions to guide the translation model..."
        onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`)}
      />
      <p className="text-xs text-muted-foreground">
        Guide the model's translation style, tone, or specific terminology usage.
        {" "}
        <span
          className="hover:underline cursor-pointer"
          onClick={() => setIsHelpDialogOpen(true)}
        >
          (Info)
        </span>
      </p>

      <Dialog open={isPresetsDialogOpen} onOpenChange={setIsPresetsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Custom Instruction Preset</DialogTitle>
            <DialogDescription>
              Choose a preset to guide the translation model.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="space-y-2 mr-1">
              {customInstructionPresets.map((preset) => (
                <div
                  key={preset.title}
                  className="p-3 border rounded-md cursor-pointer hover:bg-muted"
                  onClick={() => handlePresetSelect(preset.instruction)}
                >
                  <div className="font-medium">{preset.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {preset.instruction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tips for Custom Instructions</DialogTitle>
          </DialogHeader>
          <div className="pt-2 text-base text-foreground space-y-2">
            <p>Custom instructions help guide the model to follow specific patterns, maintain consistent terminology, or adopt particular styles.</p>
            <p>Be concise, direct, and specific to avoid confusing the model. Focus on clear examples and explicit rules.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})