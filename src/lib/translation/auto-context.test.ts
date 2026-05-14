import { describe, expect, test } from "bun:test"
import { findLatestExtraction, getExtractionProblem } from "@/lib/translation/auto-context"
import { Extraction } from "@/types/project"

const extraction = (id: string, contextResult: string): Extraction => ({
  id,
  title: id,
  episodeNumber: id,
  subtitleContent: "",
  previousContext: "",
  contextResult,
  createdAt: new Date(),
  updatedAt: new Date(),
  projectId: "project-1",
  basicSettingsId: `${id}-basic`,
  advancedSettingsId: `${id}-advanced`,
})

describe("findLatestExtraction", () => {
  test("returns the latest extraction without skipping invalid later entries", () => {
    const latest = extraction("episode-3", "<error>failed</error>")
    const previous = extraction("episode-2", "usable context")

    expect(findLatestExtraction([latest, previous])).toBe(latest)
  })
})

describe("getExtractionProblem", () => {
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
})
