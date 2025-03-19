import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "../ui/dialog"

interface DeleteDialogueProps {
  handleDelete: () => void
  isDeleteModalOpen: boolean
  setIsDeleteModalOpen: (open: boolean) => void
  isProcessing?: boolean
}

export const DeleteDialogue = ({
  handleDelete,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  isProcessing = false
}: DeleteDialogueProps) => (
  <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
      </DialogHeader>
      <DialogDescription className="hidden" />
      <p className="text-sm">
        Are you sure you want to delete this item?
      </p>
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isProcessing}
        >
          {isProcessing ? "Deleting..." : "Delete"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
