"use client"

import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProjectStore } from "@/stores/data/use-project-store"
import { ProjectMain } from "./project-main"

export const Project = () => {
  const projects = useProjectStore(state => state.projects)
  const currentProject = useProjectStore(state => state.currentProject)
  const createProject = useProjectStore(state => state.createProject)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)

  const handleCreateProject = async () => {
    const newProject = await createProject(`Project ${new Date().toLocaleDateString()}`)
    setCurrentProject(newProject)
  }

  if (!currentProject) {
    return (
      <div className="flex flex-col gap-4 mx-auto container p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Select a Project</h2>
          <Button onClick={handleCreateProject}>
            <Plus size={18} className="mr-2" />
            Create New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2 text-center">No Projects Found</h2>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Create a new project to start working.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => {
              const totalItems = p.translations.length + p.transcriptions.length + p.extractions.length
              return (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:border-primary transition-colors overflow-hidden border border-muted h-full flex flex-col"
                  onClick={() => setCurrentProject(p.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle>{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 flex flex-col flex-1">
                    <div className="flex-1" />
                    <div className="flex flex-col gap-1 mt-auto">
                      <p className="text-sm text-muted-foreground">
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(p.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return <ProjectMain />
}
