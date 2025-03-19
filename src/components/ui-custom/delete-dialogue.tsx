import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "../ui/dialog"

interface DeleteDialogueProps {
  isDeleteModalOpen: boolean
  setIsDeleteModalOpen: (open: boolean) => void
  handleDelete: () => void
}

export const DeleteDialogue = ({
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  handleDelete,
}: DeleteDialogueProps) => {
  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete this project?</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
