import { describe, expect, test } from "bun:test"
import {
  cleanExtractionResult,
  combineAutoContext,
  findLatestExtraction,
  getAutoContextCreatedTranslationPatch,
  getBatchAutoContextPreview,
  getExtractionProblem,
  getStoppedAutoContextExtractionPatch,
} from "@/lib/translation/auto-context"
import { Extraction } from "@/types/project"
import { getAutoContextExtractionTitle, isAutoContextOwnedBy } from "@/lib/extraction/status"

const extraction = (id: string, contextResult: string, overrides: Partial<Extraction> = {}): Extraction => ({
  id,
  title: id,
  episodeNumber: id,
  subtitleContent: "",
  previousContext: "",
  contextResult,
  status: "completed",
  ownerTranslationId: null,
  completedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  projectId: "project-1",
  settingsId: `${id}-settings`,
  ...overrides,
})

test("owned Auto Context titles name their Translation", () => {
  expect(getAutoContextExtractionTitle("Episode 4")).toBe("Auto Context for Episode 4")
  expect(getAutoContextExtractionTitle("   ")).toBe("Auto Context for Untitled Translation")
})

describe("findLatestExtraction", () => {
  test("returns the latest usable extraction", () => {
    const latest = extraction("episode-3", "<error>failed</error>", { status: "failed" })
    const previous = extraction("episode-2", "usable context")

    expect(findLatestExtraction([latest, previous], "project-1")).toBe(previous)
  })

  test("includes a linked auto-context extraction when it is latest and usable", () => {
    const latest = extraction("episode-3", "latest context", {
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
        ownerTranslationId: "translation-1",
      }),
      "translation-1",
    )).toBe(true)
  })
})

describe("combineAutoContext", () => {
  test("appends cleaned auto-context to the manual context document", () => {
    const autoContext = cleanExtractionResult("  Generated context\n\n<done>  ")
    const manualContext = "Manual context"

    expect(combineAutoContext(autoContext, manualContext)).toBe("Manual context\n\n---\n\nGenerated context")
  })
})

describe("getBatchAutoContextPreview", () => {
  test("combines manual context with a completed owned extraction", () => {
    expect(getBatchAutoContextPreview({
      contextDocument: "Manual context",
      enabled: true,
      extraction: extraction("episode-1", "Generated context\n\n<done>", {
        ownerTranslationId: "translation-1",
      }),
      isOwned: true,
      isRunning: false,
      extractionProblem: null,
    })).toBe("Manual context\n\n---\n\nGenerated context")
  })

  test("previews only manual context when Batch Auto Context is off", () => {
    expect(getBatchAutoContextPreview({
      contextDocument: "Manual context",
      enabled: false,
      extraction: extraction("episode-1", "Generated context"),
      isOwned: true,
      isRunning: false,
      extractionProblem: null,
    })).toBe("Manual context")
  })

  test("explains when an owned extraction still needs to be created", () => {
    expect(getBatchAutoContextPreview({
      contextDocument: "",
      enabled: true,
      extraction: null,
      isOwned: false,
      isRunning: false,
      extractionProblem: null,
    })).toBe("[Extraction has not run yet — it will be created when batch translation starts]")
  })

  test("explains when an invalid owned extraction will be regenerated", () => {
    expect(getBatchAutoContextPreview({
      contextDocument: "Manual context",
      enabled: true,
      extraction: extraction("episode-1", "partial", { status: "stopped" }),
      isOwned: true,
      isRunning: false,
      extractionProblem: "Selected context extraction was stopped.",
    })).toBe("Manual context\n\n---\n\n[Extraction will be regenerated when batch translation starts]")
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
