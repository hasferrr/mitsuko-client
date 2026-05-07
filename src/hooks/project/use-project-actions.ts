import { useState } from "react"
import { toast } from "sonner"
import { useProjectStore } from "@/stores/data/use-project-store"
import { hasActiveOperations } from "@/stores/utils/active-operations"
import { exportProject } from "@/lib/db/db-io"

export function useProjectActions() {
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteProject = useProjectStore(state => state.deleteProject)
  const updateProject = useProjectStore(state => state.updateProject)
  const projects = useProjectStore(state => state.projects)

  const promptDelete = (projectId: string) => {
    setProjectToDelete(projectId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return
    setIsDeleting(true)
    try {
      await deleteProject(projectToDelete)
      setIsDeleteModalOpen(false)
      setProjectToDelete(null)
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Failed to delete project")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = async (projectId: string) => {
    try {
      const result = await exportProject(projectId)
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

  const handleArchive = async (projectId: string, archive: boolean) => {
    if (archive && checkActiveOperations(projectId)) {
      toast.error("Cannot archive — finish or cancel active operations first")
      return
    }
    try {
      const updated = await updateProject(projectId, { isArchived: archive })
      if (updated) {
        toast.success(archive ? "Project archived" : "Project unarchived")
      } else {
        toast.error(`Failed to ${archive ? "archive" : "unarchive"} project`)
      }
      return updated
    } catch (error) {
      console.error("Error archiving project:", error)
      toast.error(`Failed to ${archive ? "archive" : "unarchive"} project`)
    }
  }

  const checkActiveOperations = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return false
    return hasActiveOperations(project)
  }

  return {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    projectToDelete,
    promptDelete,
    handleConfirmDelete,
    handleExport,
    handleArchive,
    checkActiveOperations,
  }
}
