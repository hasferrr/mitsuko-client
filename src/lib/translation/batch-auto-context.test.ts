import { describe, expect, test } from "bun:test"
import {
  buildBatchAutoContextPlan,
  findOwnedAutoContextExtraction,
  getEffectiveBatchTranslationStage,
  getRunningBatchAutoContextExtractionIds,
} from "@/lib/translation/batch-auto-context"
import { Extraction, Translation } from "@/types/project"

const completedAt = new Date("2026-01-01T00:00:00.000Z")

const translation = (id: string, overrides: Partial<Translation> = {}): Translation => ({
  id,
  title: id,
  subtitles: [],
  parsed: { type: "srt", data: null },
  projectId: "project-1",
  settingsId: `${id}-settings`,
  autoContextMode: "use-existing",
  autoContextExtractionId: `${id}-extraction`,
  autoContextPreviousMode: "selected",
  autoContextPreviousExtractionId: null,
  response: { response: "", jsonResponse: [] },
  createdAt: completedAt,
  updatedAt: completedAt,
  ...overrides,
})

const extraction = (id: string, ownerTranslationId: string | null, overrides: Partial<Extraction> = {}): Extraction => ({
  id,
  title: id,
  episodeNumber: id,
  subtitleContent: "subtitle",
  previousContext: "",
  contextResult: "usable context",
  status: "completed",
  ownerTranslationId,
  completedAt,
  createdAt: completedAt,
  updatedAt: completedAt,
  projectId: "project-1",
  settingsId: `${id}-settings`,
  ...overrides,
})

describe("findOwnedAutoContextExtraction", () => {
  test("does not treat a manually selected extraction as owned", () => {
    const item = translation("translation-1", { autoContextExtractionId: "manual" })
    const extractions = {
      manual: extraction("manual", null),
      owned: extraction("owned", "translation-1"),
    }

    expect(findOwnedAutoContextExtraction(item, ["manual", "owned"], extractions)?.id).toBe("owned")
  })
})

describe("getEffectiveBatchTranslationStage", () => {
  test("restores the extracting stage from the active linked extraction after a remount", () => {
    const item = translation("translation-1")
    const linkedExtraction = extraction("translation-1-extraction", item.id, {
      status: "idle",
      contextResult: "",
      completedAt: null,
    })

    expect(getEffectiveBatchTranslationStage({
      translation: item,
      linkedExtraction,
      runningExtractionIds: new Set([linkedExtraction.id]),
      isTranslating: false,
    })).toBe("extracting-context")
  })

  test("does not attribute an active manually linked extraction to the batch item", () => {
    const item = translation("translation-1", { autoContextExtractionId: "manual" })
    const linkedExtraction = extraction("manual", null)

    expect(getEffectiveBatchTranslationStage({
      translation: item,
      linkedExtraction,
      runningExtractionIds: new Set([linkedExtraction.id]),
      isTranslating: false,
    })).toBeUndefined()
  })

  test.each([
    "waiting-context",
    "queued-translation",
  ] as const)("restores the recorded %s stage after a remount", (recordedStage) => {
    const item = translation("translation-1")

    expect(getEffectiveBatchTranslationStage({
      translation: item,
      linkedExtraction: extraction("translation-1-extraction", item.id),
      runningExtractionIds: new Set(),
      isTranslating: false,
      recordedStage,
    })).toBe(recordedStage)
  })

  test("prefers authoritative translation activity over a recorded waiting stage", () => {
    const item = translation("translation-1")

    expect(getEffectiveBatchTranslationStage({
      translation: item,
      linkedExtraction: extraction("translation-1-extraction", item.id),
      runningExtractionIds: new Set(),
      isTranslating: true,
      recordedStage: "queued-translation",
    })).toBe("translating")
  })

  test("prefers authoritative extraction activity over a recorded waiting stage", () => {
    const item = translation("translation-1")
    const linkedExtraction = extraction("translation-1-extraction", item.id)

    expect(getEffectiveBatchTranslationStage({
      translation: item,
      linkedExtraction,
      runningExtractionIds: new Set([linkedExtraction.id]),
      isTranslating: false,
      recordedStage: "waiting-context",
    })).toBe("extracting-context")
  })
})

describe("getRunningBatchAutoContextExtractionIds", () => {
  test("finds an active owned extraction without relying on runtime refs", () => {
    const item = translation("translation-1")
    const linkedExtraction = extraction("translation-1-extraction", item.id)

    expect(getRunningBatchAutoContextExtractionIds({
      translationIds: [item.id],
      translations: { [item.id]: item },
      extractions: { [linkedExtraction.id]: linkedExtraction },
      runningIds: new Set([linkedExtraction.id]),
    })).toEqual([linkedExtraction.id])
  })

  test("does not stop an active manually linked extraction", () => {
    const item = translation("translation-1", { autoContextExtractionId: "manual" })
    const manuallyLinked = extraction("manual", null)

    expect(getRunningBatchAutoContextExtractionIds({
      translationIds: [item.id],
      translations: { [item.id]: item },
      extractions: { [manuallyLinked.id]: manuallyLinked },
      runningIds: new Set([manuallyLinked.id]),
    })).toEqual([])
  })
})

describe("buildBatchAutoContextPlan", () => {
  test("reuses a valid deterministic chain", () => {
    const first = translation("translation-1")
    const second = translation("translation-2", {
      autoContextPreviousExtractionId: "translation-1-extraction",
    })
    const extractions = {
      "translation-1-extraction": extraction("translation-1-extraction", first.id),
      "translation-2-extraction": extraction("translation-2-extraction", second.id),
    }

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id, second.id],
      extractionIds: Object.keys(extractions),
      translations: { [first.id]: first, [second.id]: second },
      extractions,
      startingExtractionId: null,
    })

    expect(plan.items.map(item => item.action)).toEqual(["reuse", "reuse"])
  })

  test("reruns the suffix after a missing extraction", () => {
    const first = translation("translation-1", { autoContextExtractionId: null })
    const second = translation("translation-2", { autoContextPreviousExtractionId: "missing" })
    const secondExtraction = extraction("translation-2-extraction", second.id)

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id, second.id],
      extractionIds: [secondExtraction.id],
      translations: { [first.id]: first, [second.id]: second },
      extractions: { [secondExtraction.id]: secondExtraction },
      startingExtractionId: null,
    })

    expect(plan.items.map(item => item.action)).toEqual(["create", "rerun"])
  })

  test("reuses linked completed extractions regardless of completion order", () => {
    const first = translation("translation-1")
    const second = translation("translation-2", {
      autoContextPreviousExtractionId: "translation-1-extraction",
    })
    const extractions = {
      "translation-1-extraction": extraction("translation-1-extraction", first.id, {
        completedAt: new Date("2026-01-02T00:00:00.000Z"),
      }),
      "translation-2-extraction": extraction("translation-2-extraction", second.id),
    }

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id, second.id],
      extractionIds: Object.keys(extractions),
      translations: { [first.id]: first, [second.id]: second },
      extractions,
      startingExtractionId: null,
    })

    expect(plan.items.map(item => item.action)).toEqual(["reuse", "reuse"])
  })

  test("reruns only the failed owned extraction when the chain identity is unchanged", () => {
    const first = translation("translation-1")
    const second = translation("translation-2", {
      autoContextPreviousExtractionId: "translation-1-extraction",
    })
    const third = translation("translation-3", {
      autoContextPreviousExtractionId: "translation-2-extraction",
    })
    const extractions = {
      "translation-1-extraction": extraction("translation-1-extraction", first.id),
      "translation-2-extraction": extraction("translation-2-extraction", second.id, {
        status: "failed",
        contextResult: "<error>failed</error>",
        completedAt: null,
      }),
      "translation-3-extraction": extraction("translation-3-extraction", third.id),
    }

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id, second.id, third.id],
      extractionIds: Object.keys(extractions),
      translations: { [first.id]: first, [second.id]: second, [third.id]: third },
      extractions,
      startingExtractionId: null,
    })

    expect(plan.items).toEqual([
      { translationId: first.id, extractionId: "translation-1-extraction", action: "reuse" },
      { translationId: second.id, extractionId: "translation-2-extraction", action: "rerun" },
      { translationId: third.id, extractionId: "translation-3-extraction", action: "reuse" },
    ])
  })

  test("regenerates every existing owned extraction on Restart", () => {
    const first = translation("translation-1")
    const second = translation("translation-2", {
      autoContextPreviousExtractionId: "translation-1-extraction",
    })
    const extractions = {
      "translation-1-extraction": extraction("translation-1-extraction", first.id),
      "translation-2-extraction": extraction("translation-2-extraction", second.id),
    }

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id, second.id],
      extractionIds: Object.keys(extractions),
      translations: { [first.id]: first, [second.id]: second },
      extractions,
      startingExtractionId: null,
      regenerate: true,
    })

    expect(plan.items.map(item => item.action)).toEqual(["rerun", "rerun"])
  })

  test("blocks a missing Starting Context without falling back", () => {
    const first = translation("translation-1")

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id],
      extractionIds: [],
      translations: { [first.id]: first },
      extractions: {},
      startingExtractionId: "missing",
    })

    expect(plan.startingContextProblem).toBe("Starting Context was not found.")
  })

  test("rejects a Starting Context owned inside the batch", () => {
    const first = translation("translation-1")
    const starting = extraction("starting", first.id)

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id],
      extractionIds: [starting.id],
      translations: { [first.id]: first },
      extractions: { [starting.id]: starting },
      startingExtractionId: starting.id,
    })

    expect(plan.startingContextProblem).toBe("Starting Context is owned by a Translation in this batch.")
  })
})
