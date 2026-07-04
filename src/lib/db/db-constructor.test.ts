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

  test("migrates done tag to completed extraction metadata", () => {
    const data = databaseExportConstructor({
      extractions: [{
        id: "extraction-1",
        contextResult: "usable context\n\n<done>",
      } as Partial<Extraction> as Extraction],
    })

    expect(data.extractions[0].status).toBe("completed")
    expect(data.extractions[0].contextResult).toBe("usable context")
    expect(data.extractions[0].completedAt).toBeInstanceOf(Date)
  })

  test("treats legacy single non-empty extraction as completed", () => {
    const data = databaseExportConstructor({
      projects: [{
        id: "project-1",
        isBatch: false,
        extractions: ["extraction-1"],
      } as Partial<Project> as Project],
      extractions: [{
        id: "extraction-1",
        projectId: "project-1",
        contextResult: "usable context",
      } as Partial<Extraction> as Extraction],
    })

    expect(data.extractions[0].status).toBe("completed")
  })

  test("does not treat legacy batch partial extraction as completed", () => {
    const data = databaseExportConstructor({
      projects: [{
        id: "project-1",
        isBatch: true,
        extractions: ["extraction-1"],
      } as Partial<Project> as Project],
      extractions: [{
        id: "extraction-1",
        projectId: "project-1",
        contextResult: "partial context",
      } as Partial<Extraction> as Extraction],
    })

    expect(data.extractions[0].status).toBe("stopped")
  })

  test("infers owner for linked auto-created extraction", () => {
    const data = databaseExportConstructor({
      projects: [{
        id: "project-1",
        translations: ["translation-1"],
        extractions: ["extraction-1"],
      } as Partial<Project> as Project],
      translations: [{
        id: "translation-1",
        projectId: "project-1",
        autoContextExtractionId: "extraction-1",
      } as Partial<Translation> as Translation],
      extractions: [{
        id: "extraction-1",
        title: "[Auto Context] Episode 1",
        projectId: "project-1",
      } as Partial<Extraction> as Extraction],
    })

    expect(data.extractions[0].ownerTranslationId).toBe("translation-1")
  })
})

describe("generateNewIds", () => {
  test("remaps a hidden default translation", () => {
    const data = databaseExportConstructor({
      projects: [{
        id: "project-1",
        defaultTranslationId: "template-1",
      } as Partial<Project> as Project],
      translations: [{
        id: "template-1",
        projectId: "project-1",
        autoContextMode: "create-new",
      } as Partial<Translation> as Translation],
    })

    const remapped = generateNewIds(data)
    const project = remapped.projects[0]
    const template = remapped.translations.find(item => item.id === project.defaultTranslationId)

    expect(project.defaultTranslationId).not.toBe("template-1")
    expect(template?.projectId).toBe(project.id)
    expect(project.translations).not.toContain(project.defaultTranslationId)
  })

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

  test("remaps auto context extraction owner", () => {
    const data = databaseExportConstructor({
      projects: [{
        id: "project-1",
        translations: ["translation-1"],
        extractions: ["extraction-1"],
      } as Partial<Project> as Project],
      translations: [{
        id: "translation-1",
        projectId: "project-1",
        autoContextMode: "use-existing",
        autoContextExtractionId: "extraction-1",
      } as Partial<Translation> as Translation],
      extractions: [{
        id: "extraction-1",
        title: "[Auto Context] Episode 1",
        projectId: "project-1",
      } as Partial<Extraction> as Extraction],
    })

    const remapped = generateNewIds(data)
    const extraction = remapped.extractions[0]

    expect(extraction.ownerTranslationId).not.toBe("translation-1")
    expect(extraction.ownerTranslationId).toBe(remapped.translations[0].id)
  })
})
