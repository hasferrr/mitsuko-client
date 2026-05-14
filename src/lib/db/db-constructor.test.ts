import { describe, expect, test } from "bun:test"
import { databaseExportConstructor, generateNewIds } from "@/lib/db/db-constructor"
import { Extraction, Project, Translation } from "@/types/project"

describe("databaseExportConstructor", () => {
  test("adds auto context defaults to existing translations", () => {
    const data = databaseExportConstructor({
      translations: [{
        id: "translation-1",
        title: "Episode 1",
      } as Partial<Translation> as Translation],
    })

    expect(data.translations[0].autoContextMode).toBe("disabled")
    expect(data.translations[0].autoContextExtractionId).toBeNull()
    expect(data.translations[0].autoContextPreviousMode).toBe("latest")
    expect(data.translations[0].autoContextPreviousExtractionId).toBeNull()
  })
})

describe("generateNewIds", () => {
  test("remaps auto context extraction links", () => {
    const data = databaseExportConstructor({
      projects: [{
        id: "project-1",
        translations: ["translation-1"],
        extractions: ["extraction-1", "extraction-2"],
      } as Partial<Project> as Project],
      translations: [{
        id: "translation-1",
        projectId: "project-1",
        autoContextMode: "use-existing",
        autoContextExtractionId: "extraction-1",
        autoContextPreviousExtractionId: "extraction-2",
      } as Partial<Translation> as Translation],
      extractions: [
        { id: "extraction-1", projectId: "project-1" } as Partial<Extraction> as Extraction,
        { id: "extraction-2", projectId: "project-1" } as Partial<Extraction> as Extraction,
      ],
    })

    const remapped = generateNewIds(data)
    const translation = remapped.translations[0]
    const extractionIds = new Set(remapped.extractions.map(extraction => extraction.id))

    expect(translation.autoContextExtractionId).not.toBe("extraction-1")
    expect(translation.autoContextPreviousExtractionId).not.toBe("extraction-2")
    expect(extractionIds.has(translation.autoContextExtractionId ?? "")).toBe(true)
    expect(extractionIds.has(translation.autoContextPreviousExtractionId ?? "")).toBe(true)
  })
})
