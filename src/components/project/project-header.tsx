"use client"

import { useState } from "react"
import { ArrowLeft, Edit, Upload, ArrowLeftRight, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { EditDialogue } from "@/components/ui-custom/edit-dialogue"
import { DeleteDialogue } from "@/components/ui-custom/delete-dialogue"
import { Project } from "@/types/project"
import { useProjectStore } from "@/stores/data/use-project-store"
import { exportProject } from "@/lib/db/db-io"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProjectHeaderProps {
  currentProject: Project
}

export function ProjectHeader({ currentProject }: ProjectHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [isProcessingConvert, setIsProcessingConvert] = useState(false)

  const router = useRouter()
  const renameProject = useProjectStore((state) => state.renameProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const updateProjectStore = useProjectStore(state => state.updateProject)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)

  const handleBack = () => {
    if (currentProject.isBatch) router.push("/batch")
    else setCurrentProject(null)
  }

  const handleSave = async (newName: string) => {
    await renameProject(currentProject.id, newName.trim())
    setIsEditModalOpen(false)
  }

  const handleDelete = async () => {
    setIsDeleteModalOpen(false)
    await deleteProject(currentProject.id)
  }

  const handleExportProject = async () => {
    try {
      const result = await exportProject(currentProject.id)
      if (result) {
        const blob = new Blob([result.content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `mitsuko-project-${result.name.replace(/\s+/g, "_")}-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Project exported successfully")
      }
    } catch (error) {
      console.error("Error exporting project:", error)
      toast.error("Failed to export project")
    }
  }

  const handleToggleBatch = async (): Promise<boolean> => {
    try {
      const updated = await updateProjectStore(currentProject.id, { isBatch: !currentProject.isBatch })
      if (updated) {
        setCurrentProject(updated)
        toast.success(`Converted to ${updated.isBatch ? 'Batch' : 'Normal'} project`)
        return true
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
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1>{currentProject.name}</h1>
            {currentProject.isBatch && <Badge className="ml-2">Batch Project</Badge>}
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
              onClick={handleExportProject}
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
            <button
              onClick={() => setIsDeleteModalOpen(true)}
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
        handleDelete={handleDelete}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
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
