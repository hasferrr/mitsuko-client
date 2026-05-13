"use client"

import { memo, useState, useCallback, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { ExternalLink, FolderDown, WandSparkles, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useProjectStore } from "@/stores/data/use-project-store"
import { AutoContextMode, Extraction } from "@/types/project"
import { db } from "@/lib/db/db"
import { getContent } from "@/lib/parser/parser"
import { removeDoneTag } from "@/lib/utils"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { getExtractionProblem, findLatestUsableExtraction } from "@/lib/translation/auto-context"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContextExtractorMain } from "@/components/extract-context/context-extractor-main"

interface Props {
  basicSettingsId: string
  translationId?: string
}

export const ContextDocumentInput = memo(({ basicSettingsId, translationId }: Props) => {
  const currentProject = useProjectStore((state) => state.currentProject)
  const contextDocument = useSettingsStore((state) => state.getContextDocument(basicSettingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setContextDocument = (doc: string) => setBasicSettingsValue(basicSettingsId, "contextDocument", doc)
  const translation = useTranslationDataStore((state) => translationId ? state.data[translationId] : null)
  const mutateTranslation = useTranslationDataStore((state) => state.mutateData)
  const saveTranslation = useTranslationDataStore((state) => state.saveData)
  const extractionData = useExtractionDataStore((state) => state.data)
  const getExtractionsDb = useExtractionDataStore((state) => state.getExtractionsDb)
  const getExtractionDb = useExtractionDataStore((state) => state.getExtractionDb)
  const isExtractingSet = useExtractionStore((state) => state.isExtractingSet)

  const [isContextDialogOpen, setIsContextDialogOpen] = useState(false)
  const [isAutoContextDialogOpen, setIsAutoContextDialogOpen] = useState(false)
  const [previewExtractionId, setPreviewExtractionId] = useState<string | null>(null)
  const [projectExtractions, setProjectExtractions] = useState<Extraction[]>([])

  const { setHasChanges } = useUnsavedChanges()

  const loadProjectExtractions = useCallback(async () => {
    if (!currentProject) return
    const extractionsData = await db.extractions.bulkGet(currentProject.extractions)
    setProjectExtractions(extractionsData.filter((e): e is Extraction => !!e).toReversed())
  }, [currentProject])

  useEffect(() => {
    if (!isAutoContextDialogOpen || !currentProject) return
    getExtractionsDb(currentProject.extractions).then((extractions) => {
      setProjectExtractions(extractions.toReversed())
    })
  }, [currentProject, getExtractionsDb, isAutoContextDialogOpen])

  useEffect(() => {
    if (!isAutoContextDialogOpen || !translation) return
    if (translation.autoContextExtractionId && !extractionData[translation.autoContextExtractionId]) {
      getExtractionDb(translation.autoContextExtractionId)
    }
    if (translation.autoContextPreviousExtractionId && !extractionData[translation.autoContextPreviousExtractionId]) {
      getExtractionDb(translation.autoContextPreviousExtractionId)
    }
  }, [extractionData, getExtractionDb, isAutoContextDialogOpen, translation])

  const handleContextDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setContextDocument(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
  }

  const handleContextSelect = (contextResult: string) => {
    setHasChanges(true)
    setContextDocument(removeDoneTag(getContent(contextResult)).trim())
    setIsContextDialogOpen(false)
  }

  const setAutoContextValue = async <T extends "autoContextMode" | "autoContextExtractionId" | "autoContextPreviousExtractionId">(
    key: T,
    value: NonNullable<typeof translation>[T],
  ) => {
    if (!translationId) return
    setHasChanges(true)
    mutateTranslation(translationId, key, value)
    await saveTranslation(translationId)
  }

  const handleAutoModeChange = async (mode: AutoContextMode) => {
    await setAutoContextValue("autoContextMode", mode)
    if (mode === "create-new" && translation && !translation.autoContextPreviousExtractionId) {
      const latest = findLatestUsableExtraction(projectExtractions, translation.projectId, isExtractingSet)
      if (latest) await setAutoContextValue("autoContextPreviousExtractionId", latest.id)
    }
  }

  const handleOpenExtraction = async (extractionId: string | null) => {
    if (!extractionId) return
    await getExtractionDb(extractionId)
    setPreviewExtractionId(extractionId)
  }

  const selectedExtraction = translation?.autoContextExtractionId ? extractionData[translation.autoContextExtractionId] : null
  const previousExtraction = translation?.autoContextPreviousExtractionId ? extractionData[translation.autoContextPreviousExtractionId] : null
  const selectedProblem = translation && translation.autoContextExtractionId
    ? getExtractionProblem(selectedExtraction ?? undefined, translation.projectId, isExtractingSet)
    : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Context Document</label>
        <div className="flex items-center gap-1.5">
          {translationId && (
            <Button
              variant={translation?.autoContextMode && translation.autoContextMode !== "disabled" ? "default" : "outline"}
              onClick={() => {
                loadProjectExtractions()
                setIsAutoContextDialogOpen(true)
              }}
            >
              <WandSparkles />
              Auto
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              loadProjectExtractions()
              setIsContextDialogOpen(true)
            }}
          >
            <FolderDown />
            Import
          </Button>
        </div>
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
              <div className="flex flex-col gap-2 mr-1">
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

      {translation && (
        <Dialog open={isAutoContextDialogOpen} onOpenChange={setIsAutoContextDialogOpen}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Auto Context</DialogTitle>
              <DialogDescription>
                Generate or link extracted context when starting this translation.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Mode</label>
                <Select value={translation.autoContextMode ?? "disabled"} onValueChange={(value) => handleAutoModeChange(value as AutoContextMode)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="create-new">Create new before translation</SelectItem>
                      <SelectItem value="use-existing">Use existing extraction</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {translation.autoContextMode === "use-existing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium">Selected Extraction</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAutoContextValue("autoContextExtractionId", null)}
                      disabled={!translation.autoContextExtractionId}
                    >
                      <X />
                      Deselect
                    </Button>
                  </div>
                  <Select
                    value={translation.autoContextExtractionId ?? ""}
                    onValueChange={(value) => setAutoContextValue("autoContextExtractionId", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose an extraction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {projectExtractions.map((extraction) => (
                          <SelectItem key={extraction.id} value={extraction.id}>
                            {extraction.title || `Episode ${extraction.episodeNumber || "X"}`}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {selectedProblem && (
                    <p className="text-xs text-destructive">{selectedProblem}</p>
                  )}
                  {selectedExtraction && (
                    <Button variant="outline" size="sm" onClick={() => handleOpenExtraction(selectedExtraction.id)}>
                      <ExternalLink />
                      Open Extraction
                    </Button>
                  )}
                </div>
              )}

              {translation.autoContextMode === "create-new" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium">Previous Context</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAutoContextValue("autoContextPreviousExtractionId", null)}
                      disabled={!translation.autoContextPreviousExtractionId}
                    >
                      <X />
                      Deselect
                    </Button>
                  </div>
                  <Select
                    value={translation.autoContextPreviousExtractionId ?? ""}
                    onValueChange={(value) => setAutoContextValue("autoContextPreviousExtractionId", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No previous context" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {projectExtractions.map((extraction) => (
                          <SelectItem key={extraction.id} value={extraction.id}>
                            {extraction.title || `Episode ${extraction.episodeNumber || "X"}`}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {previousExtraction ? (
                    <Button variant="outline" size="sm" onClick={() => handleOpenExtraction(previousExtraction.id)}>
                      <ExternalLink />
                      Open Previous Context
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">No previous context will be sent.</p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {previewExtractionId && extractionData[previewExtractionId] && (
        <Dialog open={!!previewExtractionId} onOpenChange={(open) => !open && setPreviewExtractionId(null)}>
          <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[min(1100px,calc(100%-2rem))]">
            <DialogHeader>
              <DialogTitle>{extractionData[previewExtractionId].title || "Context Extraction"}</DialogTitle>
              <DialogDescription>
                Review, edit, or re-run this extraction.
              </DialogDescription>
            </DialogHeader>
            <ContextExtractorMain
              currentId={previewExtractionId}
              basicSettingsId={extractionData[previewExtractionId].basicSettingsId}
              advancedSettingsId={extractionData[previewExtractionId].advancedSettingsId}
              hideBackButton
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
})
