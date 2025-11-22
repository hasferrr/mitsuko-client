"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { useCustomInstructionStore } from "@/stores/data/use-custom-instruction-store"

interface CustomInstructionsSaveDialogProps {
  customInstructions: string
}

export function CustomInstructionsSaveDialog({ customInstructions }: CustomInstructionsSaveDialogProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [newInstructionName, setNewInstructionName] = useState("")

  const {
    loading: instructionsLoading,
    create: createInstruction,
  } = useCustomInstructionStore()

  const handleSaveToLibrary = async () => {
    if (!newInstructionName.trim() || !customInstructions.trim()) return
    await createInstruction(newInstructionName, customInstructions)
    setIsSaveDialogOpen(false)
    setNewInstructionName("")
  }

  return (
    <>
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
    </>
  )
}
