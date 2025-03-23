"use client"

import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/stores/use-project-store"

export const NoProjectSelected = () => {
  const createProject = useProjectStore((state) => state.createProject)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)

  return (
    <div className="grid m-auto max-w-5xl px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-medium mb-3">No Project Selected</h2>
        <p className="text-muted-foreground mb-6">
          Please select a project from the sidebar or create a new one to get started.
        </p>
        <Button
          onClick={async () => {
            const newProject = await createProject("Project " + crypto.randomUUID().slice(0, 3))
            setCurrentProject(newProject)
          }}
        >
          Create New Project
        </Button>
      </div>
    </div>
  )
}