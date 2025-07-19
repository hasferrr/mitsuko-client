"use client"

import { memo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { List, LibraryBig, Save } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { customInstructionPresets } from "@/constants/custom-instructions"
import { useCustomInstructionStore } from "@/stores/data/use-custom-instruction-store"
import { SettingsParentType } from "@/types/project"

interface Props {
  parent: SettingsParentType
}

export const CustomInstructionsInput = memo(({ parent }: Props) => {
  const customInstructions = useSettingsStore((state) => state.getCustomInstructions())
  const setCustomInstructions = useSettingsStore((state) => state.setCustomInstructions)
  const [isPresetsDialogOpen, setIsPresetsDialogOpen] = useState(false)
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false)
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false)
  const [librarySearch, setLibrarySearch] = useState("")
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [newInstructionName, setNewInstructionName] = useState("")
  const { setHasChanges } = useUnsavedChanges()
  const {
    customInstructions: libraryInstructions,
    load: loadInstructions,
    loading: instructionsLoading,
    create: createInstruction,
  } = useCustomInstructionStore()

  const handleCustomInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setCustomInstructions(e.target.value, parent)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
  }

  const handlePresetSelect = (instruction: string) => {
    setHasChanges(true)
    setCustomInstructions(instruction, parent)
    setIsPresetsDialogOpen(false)
  }

  const handleLibrarySelect = (instruction: string) => {
    setHasChanges(true)
    setCustomInstructions(instruction, parent)
    setIsLibraryDialogOpen(false)
  }

  const handleSaveToLibrary = async () => {
    if (!newInstructionName.trim() || !customInstructions.trim()) return
    await createInstruction(newInstructionName, customInstructions)
    setIsSaveDialogOpen(false)
    setNewInstructionName("")
  }

  const openLibraryDialog = () => {
    loadInstructions()
    setLibrarySearch("")
    setIsLibraryDialogOpen(true)
  }

  const filteredLibraryInstructions = libraryInstructions.filter((item) =>
    item.name.toLowerCase().includes(librarySearch.toLowerCase())
  )

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
          <Button
            variant="outline"
            size="sm"
            onClick={openLibraryDialog}
            className="h-8 px-2"
          >
            <LibraryBig className="h-4 w-4" />
            Library
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewInstructionName("")
              setIsSaveDialogOpen(true)
            }}
            className="h-8 px-2"
          >
            <Save className="h-4 w-4" />
          </Button>
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
        Guide the model's translation style, tone, or specific terminology usage. This is passed directly to the system prompt.
        {" "}
        <span
          className="hover:underline cursor-pointer"
          onClick={() => setIsHelpDialogOpen(true)}
        >
          (Help)
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

      <Dialog open={isLibraryDialogOpen} onOpenChange={setIsLibraryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select from Library</DialogTitle>
            <DialogDescription>
              Choose a custom instruction from your library.
            </DialogDescription>
          </DialogHeader>
          {libraryInstructions.length > 0 && (
            <Input
              placeholder="Search by name..."
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
            />
          )}
          <div className="max-h-[350px] overflow-y-auto">
            {instructionsLoading ? (
              <div className="py-6 text-center text-muted-foreground">
                Loading...
              </div>
            ) : libraryInstructions.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No custom instructions found in your library.
              </div>
            ) : (
              <div className="space-y-2 mr-1">
                {filteredLibraryInstructions.length > 0 ? (
                  filteredLibraryInstructions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-md cursor-pointer hover:bg-muted"
                      onClick={() => handleLibrarySelect(item.content)}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {item.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    No instructions found.
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save to Library</DialogTitle>
            <DialogDescription>
              Give a name to this custom instruction to save it for later use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="instruction-name" className="text-sm font-medium">Name</Label>
            <Input
              id="instruction-name"
              value={newInstructionName}
              onChange={(e) => setNewInstructionName(e.target.value)}
              placeholder="e.g., Formal Translation Style"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveToLibrary} disabled={!newInstructionName.trim() || instructionsLoading}>
              {instructionsLoading ? "Saving..." : "Save to Library"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About Custom Instructions</DialogTitle>
          </DialogHeader>
          <div className="pt-2 text-base text-foreground space-y-2">
            <div>Generally, it's not necessary to use additional instructions.</div>
            <div>The model is <span className="italic">smart</span> enough to determine how the translation style should be, especially the latest model.</div>
            <div>However, if you really need it, please be concise, direct, and specific to avoid confusing the model.</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})