import { describe, expect, test } from "bun:test"
import {
  buildBatchAutoContextPlan,
  findOwnedAutoContextExtraction,
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

  test("reruns the suffix when the previous extraction is newer", () => {
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

    expect(plan.items.map(item => item.action)).toEqual(["reuse", "rerun"])
  })

  test("reruns a failed owned extraction in place and repairs the suffix", () => {
    const first = translation("translation-1")
    const second = translation("translation-2", {
      autoContextPreviousExtractionId: "translation-1-extraction",
    })
    const extractions = {
      "translation-1-extraction": extraction("translation-1-extraction", first.id, {
        status: "failed",
        contextResult: "<error>failed</error>",
        completedAt: null,
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

    expect(plan.items).toEqual([
      { translationId: first.id, extractionId: "translation-1-extraction", action: "rerun" },
      { translationId: second.id, extractionId: "translation-2-extraction", action: "rerun" },
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
