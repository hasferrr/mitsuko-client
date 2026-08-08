import { describe, expect, test } from "bun:test"
import {
  buildBatchAutoContextPlan,
  findLinkedAutoContextExtraction,
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

const extraction = (id: string, overrides: Partial<Extraction> = {}): Extraction => ({
  id,
  title: id,
  episodeNumber: id,
  subtitleContent: "subtitle",
  previousContext: "",
  contextResult: "usable context",
  status: "completed",
  completedAt,
  createdAt: completedAt,
  updatedAt: completedAt,
  projectId: "project-1",
  settingsId: `${id}-settings`,
  ...overrides,
})

describe("findLinkedAutoContextExtraction", () => {
  test("returns the extraction selected by the Translation", () => {
    const item = translation("translation-1", { autoContextExtractionId: "shared" })
    const shared = extraction("shared")

    expect(findLinkedAutoContextExtraction(item, { shared })).toBe(shared)
  })
})

describe("getEffectiveBatchTranslationStage", () => {
  test("restores the extracting stage from an active linked extraction", () => {
    const item = translation("translation-1")
    const linkedExtraction = extraction("translation-1-extraction", {
      status: "idle",
      contextResult: "",
      completedAt: null,
    })

    expect(getEffectiveBatchTranslationStage({
      translation: item,
      linkedExtraction,
      runningExtractionIds: new Set([linkedExtraction.id]),
      isTranslating: false,
      autoContextEnabled: true,
    })).toBe("extracting-context")
  })

  test.each([
    "waiting-context",
    "queued-translation",
  ] as const)("restores the recorded %s stage after a remount", (recordedStage) => {
    const item = translation("translation-1")

    expect(getEffectiveBatchTranslationStage({
      translation: item,
      linkedExtraction: extraction("translation-1-extraction"),
      runningExtractionIds: new Set(),
      isTranslating: false,
      autoContextEnabled: true,
      recordedStage,
    })).toBe(recordedStage)
  })

  test("prefers authoritative translation activity over a recorded waiting stage", () => {
    const item = translation("translation-1")

    expect(getEffectiveBatchTranslationStage({
      translation: item,
      linkedExtraction: extraction("translation-1-extraction"),
      runningExtractionIds: new Set(),
      isTranslating: true,
      autoContextEnabled: true,
      recordedStage: "queued-translation",
    })).toBe("translating")
  })

  test("ignores linked extraction activity when batch Auto Context is disabled", () => {
    const item = translation("translation-1")
    const linkedExtraction = extraction("translation-1-extraction")

    expect(getEffectiveBatchTranslationStage({
      translation: item,
      linkedExtraction,
      runningExtractionIds: new Set([linkedExtraction.id]),
      isTranslating: false,
      autoContextEnabled: false,
      recordedStage: "extracting-context",
    })).toBeUndefined()
  })
})

describe("getRunningBatchAutoContextExtractionIds", () => {
  test("finds active linked extractions and removes duplicates", () => {
    const first = translation("translation-1", { autoContextExtractionId: "shared" })
    const second = translation("translation-2", { autoContextExtractionId: "shared" })

    expect(getRunningBatchAutoContextExtractionIds({
      translationIds: [first.id, second.id],
      translations: { [first.id]: first, [second.id]: second },
      runningIds: new Set(["shared"]),
    })).toEqual(["shared"])
  })
})

describe("buildBatchAutoContextPlan", () => {
  test("reuses a valid deterministic chain", () => {
    const first = translation("translation-1")
    const second = translation("translation-2", {
      autoContextPreviousExtractionId: "translation-1-extraction",
    })
    const extractions = {
      "translation-1-extraction": extraction("translation-1-extraction"),
      "translation-2-extraction": extraction("translation-2-extraction"),
    }

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id, second.id],
      translations: { [first.id]: first, [second.id]: second },
      extractions,
      startingExtractionId: null,
    })

    expect(plan.items.map(item => item.action)).toEqual(["reuse", "reuse"])
  })

  test("reruns the suffix after a missing extraction", () => {
    const first = translation("translation-1", { autoContextExtractionId: null })
    const second = translation("translation-2", { autoContextPreviousExtractionId: "missing" })
    const secondExtraction = extraction("translation-2-extraction")

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id, second.id],
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
      "translation-1-extraction": extraction("translation-1-extraction", {
        completedAt: new Date("2026-01-02T00:00:00.000Z"),
      }),
      "translation-2-extraction": extraction("translation-2-extraction"),
    }

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id, second.id],
      translations: { [first.id]: first, [second.id]: second },
      extractions,
      startingExtractionId: null,
    })

    expect(plan.items.map(item => item.action)).toEqual(["reuse", "reuse"])
  })

  test("reruns only the failed linked extraction when chain identity is unchanged", () => {
    const first = translation("translation-1")
    const second = translation("translation-2", {
      autoContextPreviousExtractionId: "translation-1-extraction",
    })
    const third = translation("translation-3", {
      autoContextPreviousExtractionId: "translation-2-extraction",
    })
    const extractions = {
      "translation-1-extraction": extraction("translation-1-extraction"),
      "translation-2-extraction": extraction("translation-2-extraction", {
        status: "failed",
        contextResult: "<error>failed</error>",
        completedAt: null,
      }),
      "translation-3-extraction": extraction("translation-3-extraction"),
    }

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id, second.id, third.id],
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

  test("regenerates every distinct linked extraction once on Restart", () => {
    const first = translation("translation-1", { autoContextExtractionId: "shared" })
    const second = translation("translation-2", {
      autoContextExtractionId: "shared",
      autoContextPreviousExtractionId: null,
    })
    const shared = extraction("shared")

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id, second.id],
      translations: { [first.id]: first, [second.id]: second },
      extractions: { shared },
      startingExtractionId: null,
      regenerate: true,
    })

    expect(plan.items.map(item => item.action)).toEqual(["rerun", "reuse"])
  })

  test("blocks a missing Starting Context without falling back", () => {
    const first = translation("translation-1")

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id],
      translations: { [first.id]: first },
      extractions: {},
      startingExtractionId: "missing",
    })

    expect(plan.startingContextProblem).toBe("Starting Context was not found.")
  })

  test("rejects a Starting Context linked inside the batch", () => {
    const first = translation("translation-1", { autoContextExtractionId: "starting" })
    const starting = extraction("starting")

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id],
      translations: { [first.id]: first },
      extractions: { [starting.id]: starting },
      startingExtractionId: starting.id,
    })

    expect(plan.startingContextProblem).toBe("Starting Context is also linked to a Translation in this batch.")
  })

  test("creates a local replacement for a foreign-project linked extraction", () => {
    const first = translation("translation-1")
    const foreign = extraction("translation-1-extraction", { projectId: "project-2" })

    const plan = buildBatchAutoContextPlan({
      projectId: "project-1",
      translationIds: [first.id],
      translations: { [first.id]: first },
      extractions: { [foreign.id]: foreign },
      startingExtractionId: null,
    })

    expect(plan.items).toEqual([
      { translationId: first.id, extractionId: foreign.id, action: "create" },
    ])
    expect(plan.createCount).toBe(1)
    expect(plan.rerunCount).toBe(0)
  })
})
