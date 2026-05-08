import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Project } from "@/types/project"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "../ui/badge"

interface BulkMoveDialogueProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  currentProjectId: string
  selectedCounts: { translations: number; transcriptions: number; extractions: number }
  onMove: (targetProjectId: string) => Promise<void>
  isProcessing: boolean
}

export function BulkMoveDialogue({
  isOpen,
  onOpenChange,
  projects,
  currentProjectId,
  selectedCounts,
  onMove,
  isProcessing,
}: BulkMoveDialogueProps) {
  const parts: string[] = []
  if (selectedCounts.translations > 0) parts.push(`${selectedCounts.translations} translation${selectedCounts.translations > 1 ? "s" : ""}`)
  if (selectedCounts.transcriptions > 0) parts.push(`${selectedCounts.transcriptions} transcription${selectedCounts.transcriptions > 1 ? "s" : ""}`)
  if (selectedCounts.extractions > 0) parts.push(`${selectedCounts.extractions} extraction${selectedCounts.extractions > 1 ? "s" : ""}`)

  let descriptionText = "Move "
  if (parts.length === 0) {
    descriptionText = "Move these items to a project:"
  } else if (parts.length === 1) {
    descriptionText += `${parts[0]} to a project:`
  } else if (parts.length > 1) {
    const last = parts.pop()!
    descriptionText += `${parts.join(", ")} and ${last} to a project:`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Items to Project</DialogTitle>
          <DialogDescription>
            {descriptionText}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-2">
            {projects
              .sort((a, b) => a.isBatch === b.isBatch ? 1 : a.isBatch ? 1 : -1)
              .map((project) => (
                <Button
                  key={project.id}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isProcessing || project.id === currentProjectId}
                  onClick={() => onMove(project.id)}
                >
                  {project.name}
                  {project.isBatch && (
                    <Badge className="ml-2 h-5 px-2">Batch</Badge>
                  )}
                </Button>
              ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
