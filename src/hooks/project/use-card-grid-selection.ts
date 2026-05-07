import { useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { useProjectStore } from "@/stores/data/use-project-store"
import { exportProjects } from "@/lib/db/db-io"

interface UseCardGridSelectionProps {
  activeItems: Array<{ id: string }>
  archivedItems: Array<{ id: string }>
  itemType: "project" | "batch"
}

export function useCardGridSelection({ activeItems, archivedItems, itemType }: UseCardGridSelectionProps) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const deleteProject = useProjectStore(state => state.deleteProject)
  const updateProject = useProjectStore(state => state.updateProject)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)

  const allIds = useMemo(() => [...activeItems.map(i => i.id), ...archivedItems.map(i => i.id)], [activeItems, archivedItems])
  const activeIds = useMemo(() => activeItems.map(i => i.id), [activeItems])
  const archivedIds = useMemo(() => archivedItems.map(i => i.id), [archivedItems])
  const activeSelectedCount = useMemo(() => activeItems.filter(i => selectedIds.has(i.id)).length, [activeItems, selectedIds])
  const archivedSelectedCount = useMemo(() => archivedItems.filter(i => selectedIds.has(i.id)).length, [archivedItems, selectedIds])

  const toggleSelectMode = useCallback(() => {
    setIsSelecting(prev => {
      if (prev) {
        setSelectedIds(new Set())
      }
      return !prev
    })
  }, [])

  const handleSelectToggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAllToggle = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === allIds.length && allIds.length > 0) {
        return new Set()
      }
      return new Set(allIds)
    })
  }, [allIds])

  const handleSelectActiveOnly = useCallback(() => {
    setSelectedIds(new Set(activeIds))
  }, [activeIds])

  const handleSelectArchivedOnly = useCallback(() => {
    setSelectedIds(new Set(archivedIds))
  }, [archivedIds])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleDeleteSelected = async () => {
    setIsProcessing(true)
    let errorCount = 0
    for (const id of Array.from(selectedIds)) {
      try {
        await deleteProject(id)
      } catch {
        errorCount++
      }
    }
    setIsProcessing(false)
    setIsDeleteDialogOpen(false)
    if (errorCount > 0) {
      toast.error(`Failed to delete ${errorCount} ${itemType}${errorCount > 1 ? "s" : ""}`)
    } else {
      toast.success(`${selectedIds.size} ${itemType}${selectedIds.size > 1 ? "s" : ""} deleted`)
    }
    const currentId = useProjectStore.getState().currentProject?.id
    if (currentId && selectedIds.has(currentId)) {
      setCurrentProject(null)
    }
    setSelectedIds(new Set())
    setIsSelecting(false)
  }

  const handleArchiveSelected = async () => {
    const activeSelectedIds = activeItems.filter(i => selectedIds.has(i.id)).map(i => i.id)
    setIsProcessing(true)
    let errorCount = 0
    for (let i = activeSelectedIds.length - 1; i >= 0; i--) {
      const id = activeSelectedIds[i]
      try {
        await updateProject(id, { isArchived: true })
      } catch {
        errorCount++
      }
    }
    setIsProcessing(false)
    setIsArchiveDialogOpen(false)
    if (errorCount > 0) {
      toast.error(`Failed to archive ${errorCount} ${itemType}${errorCount > 1 ? "s" : ""}`)
    } else {
      toast.success(`${activeSelectedIds.length} ${itemType}${activeSelectedIds.length > 1 ? "s" : ""} archived`)
    }
    const currentId = useProjectStore.getState().currentProject?.id
    if (currentId && activeSelectedIds.includes(currentId)) {
      setCurrentProject(null)
    }
    setSelectedIds(new Set())
    setIsSelecting(false)
  }

  const handleUnarchiveSelected = async () => {
    const archivedSelectedIds = archivedItems.filter(i => selectedIds.has(i.id)).map(i => i.id)
    setIsProcessing(true)
    let errorCount = 0
    for (let i = archivedSelectedIds.length - 1; i >= 0; i--) {
      const id = archivedSelectedIds[i]
      try {
        await updateProject(id, { isArchived: false })
      } catch {
        errorCount++
      }
    }
    setIsProcessing(false)
    setIsUnarchiveDialogOpen(false)
    if (errorCount > 0) {
      toast.error(`Failed to unarchive ${errorCount} ${itemType}${errorCount > 1 ? "s" : ""}`)
    } else {
      toast.success(`${archivedSelectedIds.length} ${itemType}${archivedSelectedIds.length > 1 ? "s" : ""} unarchived`)
    }
    setSelectedIds(new Set())
    setIsSelecting(false)
  }

  const handleExportSelected = async () => {
    setIsProcessing(true)
    try {
      const result = await exportProjects(Array.from(selectedIds))
      if (result) {
        const blob = new Blob([result.content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `mitsuko-${itemType}s-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success(`${selectedIds.size} ${itemType}${selectedIds.size > 1 ? "s" : ""} exported`)
      }
    } catch (error) {
      console.error("Error exporting:", error)
      toast.error("Failed to export")
    }
    setIsProcessing(false)
    setSelectedIds(new Set())
    setIsSelecting(false)
  }

  return {
    isSelecting,
    selectedIds,
    toggleSelectMode,
    handleSelectToggle,
    handleSelectAllToggle,
    handleSelectActiveOnly,
    handleSelectArchivedOnly,
    clearSelection,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isArchiveDialogOpen,
    setIsArchiveDialogOpen,
    isUnarchiveDialogOpen,
    setIsUnarchiveDialogOpen,
    isProcessing,
    handleDeleteSelected,
    handleArchiveSelected,
    handleUnarchiveSelected,
    handleExportSelected,
    allSelected: selectedIds.size === allIds.length && allIds.length > 0,
    activeSelectedCount,
    archivedSelectedCount,
    totalCount: allIds.length,
  }
}
