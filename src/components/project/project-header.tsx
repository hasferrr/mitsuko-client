"use client"

import { useState } from "react"
import { ArrowLeft, Edit, Upload, ArrowLeftRight, Trash, Archive, ArchiveRestore } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { EditDialogue } from "@/components/ui-custom/edit-dialogue"
import { DeleteDialogue } from "@/components/ui-custom/delete-dialogue"
import { ArchiveDialog } from "@/components/ui-custom/archive-dialog"
import { Project } from "@/types/project"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useProjectActions } from "@/hooks/project/use-project-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProjectHeaderProps {
  currentProject: Project
}

export function ProjectHeader({ currentProject }: ProjectHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [isProcessingConvert, setIsProcessingConvert] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isProcessingArchive, setIsProcessingArchive] = useState(false)

  const router = useRouter()
  const renameProject = useProjectStore((state) => state.renameProject)
  const updateProjectStore = useProjectStore(state => state.updateProject)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)

  const {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    promptDelete,
    handleConfirmDelete,
    handleExport,
    handleArchive,
    checkActiveOperations,
  } = useProjectActions()

  const handleBack = () => {
    if (currentProject.isBatch) router.push("/batch")
    else setCurrentProject(null)
  }

  const handleSave = async (newName: string) => {
    await renameProject(currentProject.id, newName.trim())
    setIsEditModalOpen(false)
  }

  const handleToggleArchive = async (archive: boolean) => {
    await handleArchive(currentProject.id, archive)
  }

  const handleOpenArchiveDialog = () => {
    if (checkActiveOperations(currentProject.id)) {
      return
    }
    setIsArchiveDialogOpen(true)
  }

  const handleConfirmArchive = async () => {
    setIsProcessingArchive(true)
    const updated = await handleArchive(currentProject.id, true)
    setIsProcessingArchive(false)
    if (updated) {
      setCurrentProject(null)
      if (currentProject.isBatch) router.push("/batch")
    }
    setIsArchiveDialogOpen(false)
  }

  const handleToggleBatch = async (): Promise<"project" | "batch" | false> => {
    try {
      const updated = await updateProjectStore(currentProject.id, { isBatch: !currentProject.isBatch })
      if (updated) {
        setCurrentProject(updated)
        toast.success(`Converted to ${updated.isBatch ? 'Batch' : 'Normal'} project`)
        return updated.isBatch ? "batch" : "project"
      }
    } catch (error) {
      console.error('Failed to toggle batch mode', error)
      toast.error('Failed to convert project')
    }
    return false
  }

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-medium mb-4 sm:mb-2 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="size-5" />
            </Button>
            <h1>{currentProject.name}</h1>
            {currentProject.isBatch && <Badge className="ml-2">Batch Project</Badge>}
            {currentProject.isArchived && <Badge variant="secondary" className="ml-2">Archived</Badge>}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 hover:underline"
            >
              <Edit size={20} />
              Rename
            </button>
            <button
              onClick={() => handleExport(currentProject.id)}
              className="flex items-center gap-2 hover:underline"
            >
              <Upload size={20} />
              Export
            </button>
            <button
              onClick={() => setIsConvertModalOpen(true)}
              className="flex items-center gap-2 hover:underline"
            >
              <ArrowLeftRight size={20} />
              Convert
            </button>
            {currentProject.isArchived ? (
              <button
                onClick={() => handleToggleArchive(false)}
                className="flex items-center gap-2 hover:underline"
              >
                <ArchiveRestore size={20} />
                Unarchive
              </button>
            ) : (
              <button
                onClick={handleOpenArchiveDialog}
                className="flex items-center gap-2 hover:underline"
              >
                <Archive size={20} />
                Archive
              </button>
            )}
            <button
              onClick={() => promptDelete(currentProject.id)}
              className="flex items-center gap-2 hover:underline"
            >
              <Trash size={20} />
              Delete
            </button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Last updated: {currentProject.updatedAt.toLocaleDateString()}
        </p>
      </div>

      <EditDialogue
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialValue={currentProject.name}
        onSave={handleSave}
      />

      <DeleteDialogue
        handleDelete={handleConfirmDelete}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        isProcessing={isDeleting}
      />

      <ArchiveDialog
        isOpen={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        onConfirm={handleConfirmArchive}
        isProcessing={isProcessingArchive}
      />

      <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Project</DialogTitle>
          </DialogHeader>
          <DialogDescription className="hidden" />
          <p className="text-sm">
            {`Are you sure you want to convert this project to ${currentProject.isBatch ? 'Normal' : 'Batch'} project?`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIsProcessingConvert(true)
                const ok = await handleToggleBatch()
                setIsProcessingConvert(false)
                if (ok) setIsConvertModalOpen(false)
                if (ok === "batch") router.push("/batch")
              }}
              disabled={isProcessingConvert}
            >
              {isProcessingConvert ? 'Converting...' : 'Convert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
