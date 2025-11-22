"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LibraryBig } from "lucide-react"
import { useCustomInstructionStore } from "@/stores/data/use-custom-instruction-store"

interface CustomInstructionsLibraryControlsProps {
  customInstructions: string
  onSelectFromLibrary: (instruction: string) => void
}

export function CustomInstructionsLibraryControls({ customInstructions, onSelectFromLibrary }: CustomInstructionsLibraryControlsProps) {
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false)
  const [librarySearch, setLibrarySearch] = useState("")

  const {
    customInstructions: libraryInstructions,
    load: loadInstructions,
    loading: instructionsLoading,
  } = useCustomInstructionStore()

  const openLibraryDialog = () => {
    loadInstructions()
    setLibrarySearch("")
    setIsLibraryDialogOpen(true)
  }

  const handleLibrarySelect = (instruction: string) => {
    onSelectFromLibrary(instruction)
    setIsLibraryDialogOpen(false)
  }

  const filteredLibraryInstructions = libraryInstructions.filter((item) =>
    item.name.toLowerCase().includes(librarySearch.toLowerCase())
  )

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openLibraryDialog}
        className="h-8 px-2"
      >
        <LibraryBig className="h-4 w-4" />
        Library
      </Button>

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
    </>
  )
}
