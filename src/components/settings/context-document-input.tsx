"use client"

import { memo, useState, useCallback, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { FileText, ExternalLink, FolderDown, Settings2, WandSparkles, X, Ban, Plus, Link2, Clock, ListTree, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useProjectStore } from "@/stores/data/use-project-store"
import { AutoContextMode, AutoContextPreviousMode, Extraction, Translation } from "@/types/project"
import { getContent } from "@/lib/parser/parser"
import { removeDoneTag } from "@/lib/utils/done-tag"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { cleanExtractionResult, combineAutoContext, getExtractionProblem, findLatestExtraction } from "@/lib/translation/auto-context"
import { isAutoContextOwnedBy } from "@/lib/extraction/status"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExtractionBadges } from "@/components/extract-context/extraction-badges"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DEFAULT_TRANSLATION_SETTINGS } from "@/constants/default"

type AutoContextKey = "autoContextMode" | "autoContextExtractionId" | "autoContextPreviousMode" | "autoContextPreviousExtractionId"
type AutoContextSetterMap = { [K in AutoContextKey]: (id: string, value: Translation[K]) => void }

interface Props {
  basicSettingsId: string
  translationId?: string
  isTemplateTranslation?: boolean
  onOpenExtraction?: (extractionId: string) => void
  onOpenExtractionSettings?: () => void
}

function ModeCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors cursor-pointer",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:border-foreground/20 hover:bg-muted/50",
      )}
    >
      <div className={cn(
        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
        selected ? "bg-primary/10 text-sidebar-primary" : "bg-muted text-muted-foreground",
      )}>
        <Icon className="size-4" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className={cn("text-sm font-medium", selected && "text-sidebar-primary")}>{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </button>
  )
}

function StatusMessage({ variant, children }: { variant: "info" | "warning" | "muted"; children: React.ReactNode }) {
  return (
    <div className={cn(
      "flex items-start gap-2 rounded-md px-3 py-2 text-xs",
      variant === "info" && "bg-primary/5 text-sidebar-primary",
      variant === "warning" && "bg-destructive/5 text-destructive",
      variant === "muted" && "bg-muted/50 text-muted-foreground",
    )}>
      {children}
    </div>
  )
}

export const ContextDocumentInput = memo(({ basicSettingsId, translationId, isTemplateTranslation = false, onOpenExtraction, onOpenExtractionSettings }: Props) => {
  const currentProject = useProjectStore((state) => state.currentProject)
  const contextDocument = useSettingsStore((state) => state.getContextDocument(basicSettingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setContextDocument = (doc: string) => setBasicSettingsValue(basicSettingsId, "contextDocument", doc)
  const translation = useTranslationDataStore((state) => translationId ? state.data[translationId] : null)
  const saveTranslation = useTranslationDataStore((state) => state.saveData)
  const getTranslationDb = useTranslationDataStore((state) => state.getTranslationDb)
  const setAutoContextMode = useTranslationDataStore((state) => state.setAutoContextMode)
  const setAutoContextExtractionId = useTranslationDataStore((state) => state.setAutoContextExtractionId)
  const setAutoContextPreviousMode = useTranslationDataStore((state) => state.setAutoContextPreviousMode)
  const setAutoContextPreviousExtractionId = useTranslationDataStore((state) => state.setAutoContextPreviousExtractionId)
  const extractionData = useExtractionDataStore((state) => state.data)
  const getExtractionsDb = useExtractionDataStore((state) => state.getExtractionsDb)
  const getExtractionDb = useExtractionDataStore((state) => state.getExtractionDb)
  const setCurrentExtractionId = useExtractionDataStore((state) => state.setCurrentId)
  const isExtractingSet = useExtractionStore((state) => state.isExtractingSet)

  const [isContextDialogOpen, setIsContextDialogOpen] = useState(false)
  const [isAutoContextDialogOpen, setIsAutoContextDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [projectExtractions, setProjectExtractions] = useState<Extraction[]>([])

  const { setHasChanges } = useUnsavedChanges()

  useEffect(() => {
    if (translationId && !translation) getTranslationDb(translationId)
  }, [getTranslationDb, translation, translationId])

  const loadProjectExtractions = useCallback(async () => {
    if (!currentProject) return
    const extractions = await getExtractionsDb(currentProject.extractions)
    setProjectExtractions(extractions.toReversed())
  }, [currentProject, getExtractionsDb])

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
    if (translation.autoContextPreviousMode === "latest") {
      const latest = findLatestExtraction(projectExtractions, translation.projectId, isExtractingSet)
      if (latest && !extractionData[latest.id]) getExtractionDb(latest.id)
    }
    if (translation.autoContextPreviousExtractionId && !extractionData[translation.autoContextPreviousExtractionId]) {
      getExtractionDb(translation.autoContextPreviousExtractionId)
    }
  }, [extractionData, getExtractionDb, isAutoContextDialogOpen, isExtractingSet, projectExtractions, translation])

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

  const autoContextSetters: AutoContextSetterMap = {
    autoContextMode: setAutoContextMode,
    autoContextExtractionId: setAutoContextExtractionId,
    autoContextPreviousMode: setAutoContextPreviousMode,
    autoContextPreviousExtractionId: setAutoContextPreviousExtractionId,
  }

  const setAutoContextValue = async <K extends AutoContextKey>(
    key: K,
    value: Translation[K],
  ) => {
    if (!translationId) return
    setHasChanges(true)
    autoContextSetters[key](translationId, value)
    await saveTranslation(translationId)
  }

  const handleAutoModeChange = async (mode: AutoContextMode) => {
    if (!translationId) return
    setHasChanges(true)
    setAutoContextMode(translationId, mode)
    setAutoContextPreviousMode(translationId, "latest")
    await saveTranslation(translationId)
  }

  const handlePreviousModeChange = async (mode: AutoContextPreviousMode) => {
    await setAutoContextValue("autoContextPreviousMode", mode)
    if (mode === "none") {
      await setAutoContextValue("autoContextPreviousExtractionId", null)
    }
  }

  const handleOpenExtraction = async (extractionId: string | null) => {
    if (!extractionId) return
    const extraction = await getExtractionDb(extractionId)
    if (!extraction) return
    setCurrentExtractionId(extraction.id)
    onOpenExtraction?.(extraction.id)
  }

  const selectedExtraction = translation?.autoContextExtractionId ? extractionData[translation.autoContextExtractionId] : null
  const previousMode = translation?.autoContextPreviousMode ?? DEFAULT_TRANSLATION_SETTINGS.autoContextPreviousMode
  const latestPreviousExtraction = translation
    ? findLatestExtraction(projectExtractions, translation.projectId, isExtractingSet)
    : null
  const isLatestPreviousRunning = latestPreviousExtraction
    ? isExtractingSet.has(latestPreviousExtraction.id)
    : false
  const latestPreviousProblem = translation && latestPreviousExtraction && !isLatestPreviousRunning
    ? getExtractionProblem(latestPreviousExtraction, translation.projectId, isExtractingSet, "Latest previous context")
    : null
  const previousExtraction = previousMode === "selected" && translation?.autoContextPreviousExtractionId
    ? extractionData[translation.autoContextPreviousExtractionId]
    : null
  const isSelectedExtractionRunning = translation?.autoContextExtractionId
    ? isExtractingSet.has(translation.autoContextExtractionId)
    : false
  const previousProblem = translation && previousMode === "selected"
    ? getExtractionProblem(previousExtraction ?? undefined, translation.projectId, isExtractingSet, "Selected previous context")
    : null
  const selectedProblem = translation && translation.autoContextExtractionId && !isSelectedExtractionRunning
    ? getExtractionProblem(selectedExtraction ?? undefined, translation.projectId, isExtractingSet)
    : null
  const isSelectedAutoOwned = !!(translation && selectedExtraction && isAutoContextOwnedBy(selectedExtraction, translation.id))

  const previewCleanedExtraction = (() => {
    if (!translation || !selectedExtraction || translation.autoContextMode === "disabled") return ""
    if (isSelectedExtractionRunning) return ""
    if (selectedProblem && !isSelectedAutoOwned) return ""
    if (translation.autoContextMode === "create-new") return ""
    return cleanExtractionResult(selectedExtraction.contextResult)
  })()

  const previewCombinedContext = previewCleanedExtraction
    ? combineAutoContext(previewCleanedExtraction, contextDocument)
    : contextDocument

  const previewDisplayValue = (() => {
    if (!translation || translation.autoContextMode === "disabled") {
      return previewCombinedContext || ""
    }
    const extractionPlaceholder = isSelectedExtractionRunning
      ? "[Extraction is still running]"
      : selectedProblem && !isSelectedAutoOwned
        ? `[${selectedProblem}]`
        : translation.autoContextMode === "create-new"
          ? "[Extraction has not run yet — it will be created when translation starts]"
          : ""
    if (!extractionPlaceholder) return previewCombinedContext || ""
    return contextDocument
      ? `${extractionPlaceholder}\n\n${contextDocument}`
      : extractionPlaceholder
  })()

  const autoContextMode = translation?.autoContextMode ?? DEFAULT_TRANSLATION_SETTINGS.autoContextMode

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
          <DialogContent className="sm:max-w-[520px] max-h-[min(90dvh,800px)] flex flex-col">
            <DialogHeader>
              <DialogTitle>Auto Context</DialogTitle>
              <DialogDescription>
                Automatically attach extracted context when you start translating.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 overflow-y-auto -mx-4 px-4">
              <div className="flex flex-col gap-3">
                <ModeCard
                  selected={autoContextMode === "disabled"}
                  onClick={() => handleAutoModeChange("disabled")}
                  icon={Ban}
                  title="Off"
                  description="Only the manual context document will be used."
                />
                <ModeCard
                  selected={autoContextMode === "create-new"}
                  onClick={() => handleAutoModeChange("create-new")}
                  icon={Plus}
                  title="Extract & translate"
                  description="Get context from this subtitle, then start translating with it."
                />
                {!isTemplateTranslation && (
                  <ModeCard
                    selected={autoContextMode === "use-existing"}
                    onClick={() => handleAutoModeChange("use-existing")}
                    icon={Link2}
                    title="Use existing extraction"
                    description="Pick a finished context from this project to attach."
                  />
                )}
              </div>

              {!isTemplateTranslation && autoContextMode === "use-existing" && (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium">Extraction to use</label>
                    {translation.autoContextExtractionId && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setAutoContextValue("autoContextExtractionId", null)}
                      >
                        <X />
                        Clear
                      </Button>
                    )}
                  </div>
                  <Select
                    value={translation.autoContextExtractionId ?? ""}
                    onValueChange={(value) => setAutoContextValue("autoContextExtractionId", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose an extraction…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {projectExtractions.map((extraction) => (
                          <SelectItem key={extraction.id} value={extraction.id}>
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="truncate">{extraction.title || `Episode ${extraction.episodeNumber || "X"}`}</span>
                              <ExtractionBadges extraction={extraction} runningIds={isExtractingSet} size="compact" />
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {isSelectedExtractionRunning && (
                    <StatusMessage variant="info">
                      Translation will wait for this extraction to finish.
                    </StatusMessage>
                  )}
                  {!translation.autoContextExtractionId && (
                    <StatusMessage variant="warning">
                      No extraction selected. Pick one above to use as context.
                    </StatusMessage>
                  )}
                  {!isSelectedExtractionRunning && selectedProblem && (
                    <StatusMessage variant={isSelectedAutoOwned ? "info" : "warning"}>
                      {isSelectedAutoOwned
                        ? "This auto-context extraction will rerun when translation starts."
                        : selectedProblem}
                    </StatusMessage>
                  )}
                  {selectedExtraction && (
                    <Button variant="outline" size="sm" onClick={() => handleOpenExtraction(selectedExtraction.id)}>
                      <ExternalLink />
                      Open Extraction
                    </Button>
                  )}
                </div>
              )}

              {!isTemplateTranslation && autoContextMode === "create-new" && (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <label className="text-sm font-medium">Feed previous context into this extraction</label>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Optionally include context from an earlier extraction so the new one has continuity.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <ModeCard
                      selected={previousMode === "latest"}
                      onClick={() => handlePreviousModeChange("latest")}
                      icon={Clock}
                      title="Latest available"
                      description="Automatically use the most recent completed extraction."
                    />
                    <ModeCard
                      selected={previousMode === "selected"}
                      onClick={() => handlePreviousModeChange("selected")}
                      icon={ListTree}
                      title="Choose specific extraction"
                      description="Pick a particular extraction to feed as previous context."
                    />
                    <ModeCard
                      selected={previousMode === "none"}
                      onClick={() => handlePreviousModeChange("none")}
                      icon={Ban}
                      title="None"
                      description="Don't include any previous context."
                    />
                  </div>

                  {previousMode === "latest" && (
                    <div className="flex flex-col gap-2">
                      {latestPreviousExtraction ? (
                        <>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Resolved to:</span>
                            <span className="font-medium text-foreground truncate">
                              {latestPreviousExtraction.title || `Episode ${latestPreviousExtraction.episodeNumber || "X"}`}
                            </span>
                            <ExtractionBadges extraction={latestPreviousExtraction} runningIds={isExtractingSet} size="compact" />
                          </div>
                          {isLatestPreviousRunning && (
                            <StatusMessage variant="info">
                              Translation will wait for this extraction to finish first.
                            </StatusMessage>
                          )}
                          {!isLatestPreviousRunning && latestPreviousProblem && (
                            <StatusMessage variant="warning">{latestPreviousProblem}</StatusMessage>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleOpenExtraction(latestPreviousExtraction.id)}>
                            <ExternalLink />
                            View Extraction
                          </Button>
                        </>
                      ) : (
                        <StatusMessage variant="muted">
                          No completed extraction found — previous context will be skipped.
                        </StatusMessage>
                      )}
                    </div>
                  )}

                  {previousMode === "selected" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">Pick extraction</span>
                        {translation.autoContextPreviousExtractionId && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={async () => {
                              await setAutoContextValue("autoContextPreviousMode", "none")
                              await setAutoContextValue("autoContextPreviousExtractionId", null)
                            }}
                          >
                            <X />
                            Clear
                          </Button>
                        )}
                      </div>
                      <Select
                        value={translation.autoContextPreviousExtractionId ?? ""}
                        onValueChange={async (value) => {
                          await setAutoContextValue("autoContextPreviousExtractionId", value)
                          await setAutoContextValue("autoContextPreviousMode", "selected")
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose an extraction…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {projectExtractions.map((extraction) => (
                              <SelectItem key={extraction.id} value={extraction.id}>
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="truncate">{extraction.title || `Episode ${extraction.episodeNumber || "X"}`}</span>
                                  <ExtractionBadges extraction={extraction} runningIds={isExtractingSet} size="compact" />
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {previousProblem && (
                        <StatusMessage variant="warning">{previousProblem}</StatusMessage>
                      )}
                      {previousExtraction && (
                        <Button variant="outline" size="sm" onClick={() => handleOpenExtraction(previousExtraction.id)}>
                          <ExternalLink />
                          View Extraction
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!isTemplateTranslation && autoContextMode !== "disabled" && (
                <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        Preview final context
                      </span>
                      <ChevronDown className={cn("size-3.5 transition-transform", isPreviewOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-2">
                      {previewDisplayValue ? (
                        <Textarea
                          readOnly
                          value={previewDisplayValue}
                          className="font-mono text-xs min-h-[80px] max-h-[200px] resize-none overflow-y-auto bg-muted/30"
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground py-3 text-center">No context will be sent.</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            <DialogFooter>
              {!isTemplateTranslation && onOpenExtractionSettings && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAutoContextDialogOpen(false)
                    onOpenExtractionSettings()
                  }}
                >
                  <Settings2 />
                  Extraction Settings
                </Button>
              )}
              <Button size="sm" onClick={() => setIsAutoContextDialogOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
})
