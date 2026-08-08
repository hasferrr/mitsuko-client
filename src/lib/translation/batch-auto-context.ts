import {
  getEffectiveExtractionStatus,
  getExtractionValidationProblem,
  isExtractionUsable,
} from "@/lib/extraction/status"
import { BatchTranslationStage } from "@/types/batch"
import { Extraction, Translation } from "@/types/project"

export type BatchAutoContextAction = "create" | "rerun" | "reuse"

export interface BatchAutoContextPlanItem {
  translationId: string
  extractionId: string | null
  action: BatchAutoContextAction
}

export interface BatchAutoContextPlan {
  items: BatchAutoContextPlanItem[]
  createCount: number
  rerunCount: number
  reuseCount: number
  startingContextProblem: string | null
}

export function getEffectiveBatchTranslationStage({
  translation,
  linkedExtraction,
  runningExtractionIds,
  isTranslating,
  autoContextEnabled,
  recordedStage,
}: {
  translation: Translation | undefined
  linkedExtraction: Extraction | null
  runningExtractionIds: Set<string>
  isTranslating: boolean
  autoContextEnabled: boolean
  recordedStage?: BatchTranslationStage
}): BatchTranslationStage | undefined {
  if (isTranslating) return "translating"
  if (!autoContextEnabled) return undefined
  if (translation && linkedExtraction?.id === translation.autoContextExtractionId) {
    const extractionStatus = getEffectiveExtractionStatus(linkedExtraction, runningExtractionIds)
    if (extractionStatus === "running") return "extracting-context"
    if (extractionStatus === "failed" || extractionStatus === "stopped") return "context-error"
  }
  return recordedStage
}

interface BatchAutoContextPlanInput {
  projectId: string
  translationIds: string[]
  translations: Record<string, Translation>
  extractions: Record<string, Extraction>
  startingExtractionId: string | null
  runningIds?: Set<string>
  regenerate?: boolean
}

export function findLinkedAutoContextExtraction(
  translation: Translation,
  extractions: Record<string, Extraction>,
): Extraction | null {
  return translation.autoContextExtractionId
    ? extractions[translation.autoContextExtractionId]
      ?? null
    : null
}

export function getRunningBatchAutoContextExtractionIds({
  translationIds,
  translations,
  runningIds,
}: {
  translationIds: string[]
  translations: Record<string, Translation>
  runningIds: Set<string>
}): string[] {
  const linkedRunningIds = translationIds.flatMap((translationId) => {
    const extractionId = translations[translationId]?.autoContextExtractionId
    if (!extractionId || !runningIds.has(extractionId)) return []
    return [extractionId]
  })
  return [...new Set(linkedRunningIds)]
}

export function getBatchAutoContextPreparationIds(
  translationIds: string[],
  completedTranslationIds?: Set<string>,
): string[] {
  if (!completedTranslationIds) return translationIds
  const lastIncompleteIndex = translationIds.findLastIndex(id => !completedTranslationIds.has(id))
  return lastIncompleteIndex === -1 ? [] : translationIds.slice(0, lastIncompleteIndex + 1)
}

export function getBatchAutoContextAction({
  extraction,
  expectedPreviousExtraction,
  recordedPreviousExtractionId,
  projectId,
  runningIds,
  upstreamChanged,
  regenerate,
}: {
  extraction: Extraction | null
  expectedPreviousExtraction: Extraction | null
  recordedPreviousExtractionId: string | null
  projectId: string
  runningIds: Set<string>
  upstreamChanged: boolean
  regenerate: boolean
}): BatchAutoContextAction {
  if (!extraction) return "create"
  if (extraction.projectId !== projectId) return "create"
  if (regenerate || upstreamChanged) return "rerun"
  if (recordedPreviousExtractionId !== (expectedPreviousExtraction?.id ?? null)) return "rerun"
  if (!isExtractionUsable(extraction, projectId, runningIds)) return "rerun"
  return "reuse"
}

export function buildBatchAutoContextPlan({
  projectId,
  translationIds,
  translations,
  extractions,
  startingExtractionId,
  runningIds = new Set(),
  regenerate = false,
}: BatchAutoContextPlanInput): BatchAutoContextPlan {
  const startingExtraction = startingExtractionId ? extractions[startingExtractionId] : null
  let startingContextProblem = startingExtractionId
    ? getExtractionValidationProblem(startingExtraction ?? undefined, projectId, runningIds, "Starting Context")
    : null

  const linkedExtractionIds = new Set(translationIds.flatMap(translationId => {
    const extractionId = translations[translationId]?.autoContextExtractionId
    return extractionId ? [extractionId] : []
  }))
  if (startingExtractionId && linkedExtractionIds.has(startingExtractionId)) {
    startingContextProblem = "Starting Context is also linked to a Translation in this batch."
  }

  let expectedPreviousExtraction = startingExtraction
  let upstreamChanged = false
  const items: BatchAutoContextPlanItem[] = []
  const preparedExtractionIds = new Set<string>()

  for (const translationId of translationIds) {
    const translation = translations[translationId]
    if (!translation) continue
    const extraction = findLinkedAutoContextExtraction(translation, extractions)
    const isAlreadyPrepared = !!extraction && preparedExtractionIds.has(extraction.id)
    const action: BatchAutoContextAction = isAlreadyPrepared
      ? "reuse"
      : getBatchAutoContextAction({
          extraction,
          expectedPreviousExtraction,
          recordedPreviousExtractionId: translation.autoContextPreviousExtractionId,
          projectId,
          runningIds,
          upstreamChanged,
          regenerate,
        })

    items.push({
      translationId,
      extractionId: extraction?.id ?? null,
      action,
    })
    if (extraction) preparedExtractionIds.add(extraction.id)
    upstreamChanged = upstreamChanged || action !== "reuse"
    expectedPreviousExtraction = extraction
  }

  return {
    items,
    createCount: items.filter(item => item.action === "create").length,
    rerunCount: items.filter(item => item.action === "rerun").length,
    reuseCount: items.filter(item => item.action === "reuse").length,
    startingContextProblem,
  }
}
