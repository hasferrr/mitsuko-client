"use client"

import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  PlusCircle,
  Trash,
  Upload,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Project } from "@/types/project"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useProjectActions } from "@/hooks/project/use-project-actions"
import { redirect, usePathname } from "next/navigation"
import { DeleteDialogue } from "../ui-custom/delete-dialogue"
import { ArchiveDialog } from "../ui-custom/archive-dialog"
import { ExportImportDialogue } from "../ui-custom/export-import-dialogue"
import { useState } from "react"

interface AppSidebarProjectsProps {
  projects: Project[],
  label?: string,
  addButton?: boolean,
  addButtonFn?: () => void,
  addButtonLabel?: string,
  showExportImport?: boolean,
}

export function AppSidebarProjects({
  projects,
  label,
  addButton,
  addButtonFn,
  addButtonLabel = "Add Project",
  showExportImport = true,
}: AppSidebarProjectsProps) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  const currentProject = useProjectStore((state) => state.currentProject)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)

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

  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isProcessingArchive, setIsProcessingArchive] = useState(false)
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null)

  const handleOpenArchiveDialog = (projectId: string) => {
    if (checkActiveOperations(projectId)) {
      return
    }
    setArchiveTargetId(projectId)
    setIsArchiveDialogOpen(true)
  }

  const handleConfirmArchive = async () => {
    if (!archiveTargetId) return
    setIsProcessingArchive(true)
    await handleArchive(archiveTargetId, true)
    setIsProcessingArchive(false)
    setIsArchiveDialogOpen(false)
    setArchiveTargetId(null)
  }

  return (
    <SidebarGroup translate="no" className="notranslate group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label ? label : "Projects"}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.id}>
            <SidebarMenuButton
              isActive={
                currentProject?.id === project.id && (
                  (project.isBatch
                    ? (pathname.startsWith("/batch") || pathname.startsWith("/project"))
                    : pathname.startsWith("/project"))
                  || pathname.startsWith("/translate")
                  || pathname.startsWith("/transcribe")
                  || pathname.startsWith("/extract-context")
                )
              }
              onClick={() => {
                setCurrentProject(project)
                redirect(project.isBatch ? "/batch" : "/project")
              }}
            >
              <span>{project.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleExport(project.id)}>
                  <Upload className="size-4" />
                  Export
                </DropdownMenuItem>
                {project.isArchived ? (
                  <DropdownMenuItem onClick={() => handleArchive(project.id, false)}>
                    <ArchiveRestore className="size-4" />
                    Unarchive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleOpenArchiveDialog(project.id)}>
                    <Archive className="size-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => promptDelete(project.id)}
                  className="text-destructive"
                >
                  <Trash className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {!addButton && (
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70"
              onClick={addButtonFn}
            >
              <PlusCircle className="text-sidebar-foreground/70" />
              <span>{addButtonLabel}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        {showExportImport && (
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70"
              onClick={() => setIsExportImportModalOpen(true)}
            >
              <Upload className="text-sidebar-foreground/70" />
              <span>Export/Import</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
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
        <ExportImportDialogue
          isOpen={isExportImportModalOpen}
          setIsOpen={setIsExportImportModalOpen}
        />
      </SidebarMenu>
    </SidebarGroup>
  )
}