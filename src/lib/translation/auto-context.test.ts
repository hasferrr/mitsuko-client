import { describe, expect, test } from "bun:test"
import {
  cleanExtractionResult,
  combineAutoContext,
  findLatestExtraction,
  getAutoContextCreatedTranslationPatch,
  getExtractionProblem,
  getStoppedAutoContextExtractionPatch,
} from "@/lib/translation/auto-context"
import { Extraction } from "@/types/project"
import { isAutoContextOwnedBy } from "@/lib/extraction/status"

const extraction = (id: string, contextResult: string, overrides: Partial<Extraction> = {}): Extraction => ({
  id,
  title: id,
  episodeNumber: id,
  subtitleContent: "",
  previousContext: "",
  contextResult,
  status: "completed",
  origin: "manual",
  ownerTranslationId: null,
  completedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  projectId: "project-1",
  basicSettingsId: `${id}-basic`,
  advancedSettingsId: `${id}-advanced`,
  ...overrides,
})

describe("findLatestExtraction", () => {
  test("returns the latest usable extraction", () => {
    const latest = extraction("episode-3", "<error>failed</error>", { status: "failed" })
    const previous = extraction("episode-2", "usable context")

    expect(findLatestExtraction([latest, previous], "project-1")).toBe(previous)
  })

  test("includes a linked auto-context extraction when it is latest and usable", () => {
    const latest = extraction("episode-3", "latest context", {
      origin: "auto-context",
      ownerTranslationId: "translation-1",
    })
    const previous = extraction("episode-2", "previous context")

    expect(findLatestExtraction([latest, previous], "project-1")).toBe(latest)
  })
})

describe("getExtractionProblem", () => {
  test("accepts completed extraction without done marker", () => {
    expect(getExtractionProblem(
      extraction("episode-1", "usable context"),
      "project-1",
      new Set(),
    )).toBeNull()
  })

  test("rejects stopped extraction even when partial content exists", () => {
    expect(getExtractionProblem(
      extraction("episode-1", "partial context", { status: "stopped", completedAt: null }),
      "project-1",
      new Set(),
    )).toBe("Selected context extraction was stopped.")
  })

  test("rejects completed extraction that contains an error", () => {
    expect(getExtractionProblem(
      extraction("episode-1", "usable context\n\n<error>failed</error>"),
      "project-1",
      new Set(),
    )).toBe("Selected context extraction contains an error.")
  })

  test("uses the provided subject in validation messages", () => {
    const runningIds = new Set(["episode-3"])

    expect(getExtractionProblem(
      extraction("episode-3", "partial context"),
      "project-1",
      runningIds,
      "Latest previous context",
    )).toBe("Latest previous context is still running.")
  })

  test("formats selected previous context validation messages", () => {
    expect(getExtractionProblem(
      extraction("episode-2", ""),
      "project-1",
      new Set(),
      "Selected previous context",
    )).toBe("Selected previous context is empty.")
  })

  test("identifies auto-context owner", () => {
    expect(isAutoContextOwnedBy(
      extraction("episode-1", "context", {
        origin: "auto-context",
        ownerTranslationId: "translation-1",
      }),
      "translation-1",
    )).toBe(true)
  })
})

describe("combineAutoContext", () => {
  test("prepends cleaned auto-context to the manual context document", () => {
    const autoContext = cleanExtractionResult("  Generated context\n\n<done>  ")
    const manualContext = "Manual context"

    expect(combineAutoContext(autoContext, manualContext)).toBe("Generated context\n\nManual context")
  })
})

describe("auto context creation patches", () => {
  test("links a created extraction as the selected existing extraction", () => {
    expect(getAutoContextCreatedTranslationPatch("extraction-1", "previous-1")).toEqual({
      autoContextMode: "use-existing",
      autoContextExtractionId: "extraction-1",
      autoContextPreviousExtractionId: "previous-1",
    })
  })

  test("normalizes missing previous extraction links to null", () => {
    expect(getAutoContextCreatedTranslationPatch("extraction-1", undefined)).toEqual({
      autoContextMode: "use-existing",
      autoContextExtractionId: "extraction-1",
      autoContextPreviousExtractionId: null,
    })
  })

  test("marks a created extraction stopped when cancellation happens before start", () => {
    expect(getStoppedAutoContextExtractionPatch()).toEqual({
      status: "stopped",
      completedAt: null,
    })
  })
})
