"use client"

import { memo, useState, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { FolderDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useProjectStore } from "@/stores/data/use-project-store"
import { Extraction } from "@/types/project"
import { db } from "@/lib/db/db"
import { getContent } from "@/lib/parser/parser"

interface Props {
  basicSettingsId: string
}

export const ContextDocumentInput = memo(({ basicSettingsId }: Props) => {
  const currentProject = useProjectStore((state) => state.currentProject)
  const contextDocument = useSettingsStore((state) => state.getContextDocument(basicSettingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setContextDocument = (doc: string) => setBasicSettingsValue(basicSettingsId, "contextDocument", doc)

  const [isContextDialogOpen, setIsContextDialogOpen] = useState(false)
  const [projectExtractions, setProjectExtractions] = useState<Extraction[]>([])

  const { setHasChanges } = useUnsavedChanges()

  const loadProjectExtractions = useCallback(async () => {
    if (!currentProject) return
    const extractionsData = await db.extractions.bulkGet(currentProject.extractions)
    setProjectExtractions(extractionsData.filter((e): e is Extraction => !!e).toReversed())
  }, [currentProject])

  const handleContextDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setContextDocument(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
  }

  const handleContextSelect = (contextResult: string) => {
    setHasChanges(true)
    setContextDocument(getContent(contextResult).trim())
    setIsContextDialogOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Context Document</label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadProjectExtractions()
            setIsContextDialogOpen(true)
          }}
          className="h-8 px-2"
        >
          <FolderDown className="h-4 w-4" />
          Import
        </Button>
      </div>
      <Textarea
        value={contextDocument}
        onChange={handleContextDocumentChange}
        className="min-h-[120px] h-[120px] max-h-[300px] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Add context about the video..."
        onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`)}
      />
      <p className="text-xs text-muted-foreground">
        Provide context from previous episodes (can be generated using the
        <span className="font-semibold"> Extract Context</span> feature). This improves accuracy and relevance.
      </p>

      <Dialog open={isContextDialogOpen} onOpenChange={setIsContextDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Context Document</DialogTitle>
            <DialogDescription>
              Choose a context document from your project extractions
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {projectExtractions.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No context documents found in this project
              </div>
            ) : isContextDialogOpen ? (
              <div className="space-y-2 mr-1">
                {projectExtractions.map((extraction) => (
                  <div
                    key={extraction.id}
                    className="p-3 border rounded-md cursor-pointer hover:bg-muted"
                    onClick={() => handleContextSelect(extraction.contextResult)}
                  >
                    <div className="font-medium">Episode {extraction.episodeNumber || "X"}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {extraction.contextResult.length ? extraction.contextResult.substring(0, 150) + "..." : "No content"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (null)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})