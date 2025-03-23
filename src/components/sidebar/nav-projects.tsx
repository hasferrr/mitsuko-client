"use client"

import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
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
import { useProjectStore } from "@/stores/use-project-store"
import { redirect } from "next/navigation"
import { DeleteDialogue } from "../ui-custom/delete-dialogue"
import { useState } from "react"

interface NavProjectsProps {
  projects: Project[],
  label?: string,
  addButton?: boolean,
  addButtonFn?: () => void,
}

export function NavProjects({
  projects,
  label,
  addButton,
  addButtonFn,
}: NavProjectsProps) {
  const { isMobile } = useSidebar()
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState("")

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label ? label : "Projects"}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.id}>
            <SidebarMenuButton onClick={() => {
              setCurrentProject(project)
              redirect("/project")
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
                <DropdownMenuItem onClick={() => {
                  setIdToDelete(project.id)
                  setIsDeleteModalOpen(true)
                }}>
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
              <span>Add Project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <DeleteDialogue
          handleDelete={() => {
            deleteProject(idToDelete)
            setIsDeleteModalOpen(false)
          }}
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
        />
      </SidebarMenu>
    </SidebarGroup>
  )
}
