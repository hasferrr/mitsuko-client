"use client"

import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
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
import { redirect } from "next/navigation"
import { DeleteDialogue } from "../ui-custom/delete-dialogue"
import { ExportImportDialogue } from "../ui-custom/export-import-dialogue"
import { useState } from "react"
import { exportProject } from "@/lib/db/db-io"
import { toast } from "sonner"

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
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState("")

  const handleExportProject = async (projectId: string) => {
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

  const handleDeleteProject = async () => {
    setIsDeleteModalOpen(false)
    await deleteProject(idToDelete)
  }

  return (
    <SidebarGroup translate="no" className="notranslate group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label ? label : "Projects"}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.id}>
            <SidebarMenuButton onClick={() => {
              setCurrentProject(project)
              redirect(project.isBatch ? "/batch" : "/project")
            }}>
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
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleExportProject(project.id)}>
                  <Upload className="text-muted-foreground" />
                  <span>Export Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIdToDelete(project.id)
                    setIsDeleteModalOpen(true)
                  }}
                >
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Project</span>
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
          handleDelete={handleDeleteProject}
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
        />
        <ExportImportDialogue
          isOpen={isExportImportModalOpen}
          setIsOpen={setIsExportImportModalOpen}
        />
      </SidebarMenu>
    </SidebarGroup>
  )
}