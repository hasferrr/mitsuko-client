"use client"

import { useEffect, useMemo } from "react"
import { RiSettings3Line } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { getExtractionValidationProblem, isExtractionUsable } from "@/lib/extraction/status"
import { useSetUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"

interface BatchAutoContextSettingsProps {
  isProcessing: boolean
  onOpenExtractionSettings: () => void
}

const NO_STARTING_CONTEXT = "none"

export function BatchAutoContextSettings({
  isProcessing,
  onOpenExtractionSettings,
}: BatchAutoContextSettingsProps) {
  const currentProject = useProjectStore(state => state.currentProject)
  const updateProject = useProjectStore(state => state.updateProject)
  const extractionData = useExtractionDataStore(state => state.data)
  const getExtractionsDb = useExtractionDataStore(state => state.getExtractionsDb)
  const isExtractingSet = useExtractionStore(state => state.isExtractingSet)
  const setHasChanges = useSetUnsavedChanges()

  useEffect(() => {
    if (!currentProject?.extractions.length) return
    void getExtractionsDb(currentProject.extractions)
  }, [currentProject?.extractions, getExtractionsDb])

  const eligibleExtractions = useMemo(() => {
    if (!currentProject) return []
    const batchTranslationIds = new Set(currentProject.translations)
    return currentProject.extractions
      .map(id => extractionData[id])
      .filter(extraction => {
        if (!isExtractionUsable(extraction, currentProject.id, isExtractingSet)) return false
        return !extraction.ownerTranslationId || !batchTranslationIds.has(extraction.ownerTranslationId)
      })
  }, [currentProject, extractionData, isExtractingSet])

  if (!currentProject) return null

  const enabled = currentProject.isBatchAutoContextEnabled
  const selectedId = currentProject.batchAutoContextStartingExtractionId
  const selectedExtraction = selectedId ? extractionData[selectedId] : null
  const selectedProblem = selectedId
    ? getExtractionValidationProblem(selectedExtraction ?? undefined, currentProject.id, isExtractingSet, "Starting Context")
      ?? (selectedExtraction?.ownerTranslationId && currentProject.translations.includes(selectedExtraction.ownerTranslationId)
        ? "Starting Context is owned by a Translation in this batch."
        : null)
    : null
  const selectedIsEligible = selectedId
    ? eligibleExtractions.some(extraction => extraction.id === selectedId)
    : true

  const updateAutoContext = async (changes: {
    isBatchAutoContextEnabled?: boolean
    batchAutoContextStartingExtractionId?: string | null
  }) => {
    setHasChanges(true)
    await updateProject(currentProject.id, changes)
  }

  return (
    <FieldGroup className="gap-4">
      <Field orientation="horizontal" data-disabled={isProcessing || undefined}>
        <FieldContent>
          <FieldTitle>Auto Context</FieldTitle>
          <FieldDescription>
            Build one linked context extraction per file in batch order.
          </FieldDescription>
        </FieldContent>
        <Switch
          id="batch-auto-context"
          checked={enabled}
          onCheckedChange={checked => void updateAutoContext({ isBatchAutoContextEnabled: checked })}
          disabled={isProcessing}
          aria-label="Enable batch Auto Context"
        />
      </Field>

      {enabled && (
        <Field data-invalid={!!selectedProblem || undefined} data-disabled={isProcessing || undefined}>
          <FieldLabel htmlFor="batch-auto-context-starting-context">Starting Context</FieldLabel>
          <Select
            value={selectedId ?? NO_STARTING_CONTEXT}
            onValueChange={value => void updateAutoContext({
              batchAutoContextStartingExtractionId: value === NO_STARTING_CONTEXT ? null : value,
            })}
            disabled={isProcessing}
          >
            <SelectTrigger id="batch-auto-context-starting-context" aria-invalid={!!selectedProblem}>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={NO_STARTING_CONTEXT}>None</SelectItem>
                {selectedId && !selectedIsEligible && (
                  <SelectItem value={selectedId} disabled>
                    {selectedExtraction?.title || "Unavailable extraction"}
                  </SelectItem>
                )}
                {eligibleExtractions.map(extraction => (
                  <SelectItem key={extraction.id} value={extraction.id}>
                    {extraction.title || extraction.episodeNumber || "Untitled extraction"}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>
            {selectedExtraction
              ? "Used by this batch as Starting Context. It remains independent and is not moved or deleted with a Translation."
              : "Optional existing extraction used before the first file. There is no implicit latest selection."}
          </FieldDescription>
          {selectedProblem && <FieldError>{selectedProblem}</FieldError>}
        </Field>
      )}

      <Field orientation="horizontal" data-disabled={isProcessing || undefined}>
        <FieldContent>
          <FieldTitle>Extraction Settings</FieldTitle>
          <FieldDescription>
            New linked extractions copy the project extraction defaults.
          </FieldDescription>
        </FieldContent>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenExtractionSettings}
          disabled={isProcessing}
        >
          <RiSettings3Line data-icon="inline-start" />
          Configure
        </Button>
      </Field>
    </FieldGroup>
  )
}
