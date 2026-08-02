"use client"

import { memo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { List } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { customInstructionPresets, extractionInstructionPresets } from "@/constants/custom-instructions"
import { CustomInstructionsLibraryControls } from "@/components/settings/custom-instructions-library-controls"
import { CustomInstructionsSaveDialog } from "@/components/settings/custom-instructions-save-dialog"

interface Props {
  settingsId: string
  presetType?: "translation" | "extraction"
}

export const CustomInstructionsInput = memo(({ settingsId, presetType = "translation" }: Props) => {
  const customInstructions = useSettingsStore((state) => state.getCustomInstructions(settingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setCustomInstructions = (instructions: string) => setBasicSettingsValue(settingsId, "customInstructions", instructions)

  const [isPresetsDialogOpen, setIsPresetsDialogOpen] = useState(false)
  const presets = presetType === "extraction" ? extractionInstructionPresets : customInstructionPresets

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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Custom Instructions</label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPresetsDialogOpen(true)}
          >
            <List data-icon="inline-start" />
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
        placeholder="Provide specific instructions to guide the model..."
        onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`)}
      />
      <p className="text-xs text-muted-foreground">
        Guide the model's style, tone, or specific terminology usage.
      </p>

      <Dialog open={isPresetsDialogOpen} onOpenChange={setIsPresetsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Custom Instruction Preset</DialogTitle>
            <DialogDescription>
              Choose a preset to guide the {presetType === "extraction" ? "context extraction" : "translation"} model.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="flex flex-col gap-2 mr-1">
              {presets.map((preset) => (
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

    </div>
  )
})
