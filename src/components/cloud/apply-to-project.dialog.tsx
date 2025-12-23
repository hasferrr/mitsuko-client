"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Project } from "@/types/project"

interface ApplyToProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  isProcessing: boolean
  onApply: (projectId: string) => void | Promise<void>
}

export function ApplyToProjectDialog({ open, onOpenChange, projects, isProcessing, onApply }: ApplyToProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to Project</DialogTitle>
          <DialogDescription>
            Select a project to add this transcription result
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-2">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No projects available. Create a project first.
              </p>
            ) : (
              projects
                .sort((a, b) => a.isBatch === b.isBatch ? 1 : a.isBatch ? 1 : -1)
                .map((project) => (
                  <Button
                    key={project.id}
                    variant="outline"
                    className="w-full justify-start"
                    disabled={isProcessing}
                    onClick={() => onApply(project.id)}
                  >
                    {project.name}
                    {project.isBatch && (
                      <Badge className="ml-2 h-5 px-2">Batch</Badge>
                    )}
                  </Button>
                ))
            )}
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
