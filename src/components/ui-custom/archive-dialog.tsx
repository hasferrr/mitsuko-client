import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "../ui/dialog"

interface ArchiveDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isProcessing?: boolean
  title?: string
  description?: string
}

export const ArchiveDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isProcessing = false,
  title = "Archive Project",
  description = "Are you sure you want to archive this project? It will be moved to the Archived section.",
}: ArchiveDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogDescription className="hidden" />
      <p className="text-sm">{description}</p>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? "Archiving..." : "Archive"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
