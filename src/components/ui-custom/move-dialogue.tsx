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

interface MoveDialogueProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  currentProjectId: string
  onMove: (targetProjectId: string) => Promise<void>
  isProcessing: boolean
}

export function MoveDialogue({
  isOpen,
  onOpenChange,
  projects,
  currentProjectId,
  onMove,
  isProcessing,
}: MoveDialogueProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Project</DialogTitle>
          <DialogDescription>
            Select a project to move this item to
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-2">
            {projects
              .filter((project) => project.id !== currentProjectId)
              .sort((project) => project.isBatch ? 1 : -1)
              .map((project) => (
                <Button
                  key={project.id}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isProcessing}
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