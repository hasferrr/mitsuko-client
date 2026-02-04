"use client"

import { useState, useMemo } from "react"
import { ChevronUp, LayoutGrid, LayoutList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ProjectItem } from "./project-item"
import { useProjectStore } from "@/stores/data/use-project-store"

export function RecentProjects() {
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [isHorizontal, setIsHorizontal] = useState(false)

  const projects = useProjectStore((state) => state.projects)
  const deleteProject = useProjectStore((state) => state.deleteProject)

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [projects])

  const displayedProjects = showAllProjects ? sortedProjects : sortedProjects.slice(0, 6)
  const hasMoreProjects = sortedProjects.length > 6

  return (
    <div className="mt-12 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          Recent Projects
          <span className="text-muted-foreground ml-2 text-sm">
            ({showAllProjects ? sortedProjects.length : Math.min(sortedProjects.length, 6)} of {sortedProjects.length})
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsHorizontal(!isHorizontal)}>
            {isHorizontal ? <LayoutGrid className="h-4 w-4" /> : <LayoutList className="h-4 w-4" />}
            {isHorizontal ? "Grid View" : "List View"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAllProjects(!showAllProjects)}>
            {showAllProjects ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              "View All"
            )}
          </Button>
        </div>
      </div>

      <div
        translate="no"
        className={cn(
          isHorizontal ? "flex flex-col space-y-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        )}
      >
        {displayedProjects.map((project) => (
          <ProjectItem key={project.id} project={project} isHorizontal={isHorizontal} onDelete={deleteProject} />
        ))}
      </div>

      {!showAllProjects && hasMoreProjects && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => setShowAllProjects(true)}>
            View All Projects ({sortedProjects.length})
          </Button>
        </div>
      )}
    </div>
  )
}
