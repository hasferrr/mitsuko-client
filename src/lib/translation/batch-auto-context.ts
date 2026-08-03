import { getExtractionValidationProblem, isExtractionUsable } from "@/lib/extraction/status"
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

interface BatchAutoContextPlanInput {
  projectId: string
  translationIds: string[]
  extractionIds: string[]
  translations: Record<string, Translation>
  extractions: Record<string, Extraction>
  startingExtractionId: string | null
  runningIds?: Set<string>
  regenerate?: boolean
}

export function findOwnedAutoContextExtraction(
  translation: Translation,
  extractionIds: string[],
  extractions: Record<string, Extraction>,
): Extraction | null {
  const linked = translation.autoContextExtractionId
    ? extractions[translation.autoContextExtractionId]
    : undefined
  if (linked?.ownerTranslationId === translation.id) return linked

  for (let index = extractionIds.length - 1; index >= 0; index--) {
    const extraction = extractions[extractionIds[index]]
    if (extraction?.ownerTranslationId === translation.id) return extraction
  }
  return null
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
  if (regenerate || upstreamChanged) return "rerun"
  if (recordedPreviousExtractionId !== (expectedPreviousExtraction?.id ?? null)) return "rerun"
  if (!isExtractionUsable(extraction, projectId, runningIds)) return "rerun"
  return "reuse"
}

export function buildBatchAutoContextPlan({
  projectId,
  translationIds,
  extractionIds,
  translations,
  extractions,
  startingExtractionId,
  runningIds = new Set(),
  regenerate = false,
}: BatchAutoContextPlanInput): BatchAutoContextPlan {
  const batchTranslationIds = new Set(translationIds)
  const startingExtraction = startingExtractionId ? extractions[startingExtractionId] : null
  let startingContextProblem = startingExtractionId
    ? getExtractionValidationProblem(startingExtraction ?? undefined, projectId, runningIds, "Starting Context")
    : null

  if (startingExtraction?.ownerTranslationId && batchTranslationIds.has(startingExtraction.ownerTranslationId)) {
    startingContextProblem = "Starting Context is owned by a Translation in this batch."
  }

  let expectedPreviousExtraction = startingExtraction
  let upstreamChanged = false
  const items: BatchAutoContextPlanItem[] = []

  for (const translationId of translationIds) {
    const translation = translations[translationId]
    if (!translation) continue
    const extraction = findOwnedAutoContextExtraction(translation, extractionIds, extractions)
    const action = getBatchAutoContextAction({
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
    upstreamChanged = upstreamChanged || action === "create"
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
