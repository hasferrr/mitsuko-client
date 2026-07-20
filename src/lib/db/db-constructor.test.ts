import { describe, expect, test } from "bun:test"
import { databaseExportConstructor, generateNewIds } from "@/lib/db/db-constructor"
import { AdvancedSettings, BasicSettings, Extraction, Project, Transcription, Translation } from "@/types/project"
import { getOrphanedLegacySettingsIds } from "@/lib/db/legacy-settings"

describe("databaseExportConstructor", () => {
  test("defaults a legacy project's batch operation mode to translation", () => {
    const data = databaseExportConstructor({
      projects: [{ id: "project-1" } as Partial<Project> as Project],
    })

    expect(data.projects[0].lastBatchOperationMode).toBe("translation")
  })

  test.each(["transcription", "extraction"] as const)("preserves a valid imported %s mode", mode => {
    const data = databaseExportConstructor({
      projects: [{ id: "project-1", lastBatchOperationMode: mode } as Partial<Project> as Project],
    })

    expect(data.projects[0].lastBatchOperationMode).toBe(mode)
  })

  test("drops legacy generic project settings fields", () => {
    const project = {
      id: "project-1",
      defaultBasicSettingsId: "legacy-basic",
      defaultAdvancedSettingsId: "legacy-advanced",
    } as unknown as Project

    const data = databaseExportConstructor({ projects: [project] })

    expect(data.projects[0]).not.toHaveProperty("defaultBasicSettingsId")
    expect(data.projects[0]).not.toHaveProperty("defaultAdvancedSettingsId")
  })

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

  test("migrates removed free transcription models to premium", () => {
    const data = databaseExportConstructor({
      transcriptions: [{
        id: "transcription-1",
        models: "mitsuko-free",
      } as unknown as Transcription],
    })

    expect(data.transcriptions[0].models).toBe("mitsuko-premium")
  })
})

describe("generateNewIds", () => {
  test("preserves a project's batch operation mode", () => {
    const data = databaseExportConstructor({
      projects: [{
        id: "project-1",
        lastBatchOperationMode: "extraction",
      } as Partial<Project> as Project],
    })

    const remapped = generateNewIds(data)

    expect(remapped.projects[0].id).not.toBe("project-1")
    expect(remapped.projects[0].lastBatchOperationMode).toBe("extraction")
  })

  test("does not remap obsolete generic project settings", () => {
    const project = {
      id: "project-1",
      defaultBasicSettingsId: "legacy-basic",
      defaultAdvancedSettingsId: "legacy-advanced",
    } as unknown as Project
    const basicSettings = {
      id: "legacy-basic",
    } as Partial<BasicSettings> as BasicSettings
    const data = databaseExportConstructor({ projects: [project], basicSettings: [basicSettings] })

    const remapped = generateNewIds(data)

    expect(remapped.projects[0]).not.toHaveProperty("defaultBasicSettingsId")
    expect(remapped.projects[0]).not.toHaveProperty("defaultAdvancedSettingsId")
  })

  test("remaps feature-specific translation and extraction settings", () => {
    const data = databaseExportConstructor({
      projects: [{
        id: "project-1",
        defaultTranslationBasicSettingsId: "translation-basic",
        defaultTranslationAdvancedSettingsId: "translation-advanced",
        defaultExtractionBasicSettingsId: "extraction-basic",
        defaultExtractionAdvancedSettingsId: "extraction-advanced",
      } as Partial<Project> as Project],
      basicSettings: [
        { id: "translation-basic" } as Partial<BasicSettings> as BasicSettings,
        { id: "extraction-basic" } as Partial<BasicSettings> as BasicSettings,
      ],
      advancedSettings: [
        { id: "translation-advanced" } as Partial<AdvancedSettings> as AdvancedSettings,
        { id: "extraction-advanced" } as Partial<AdvancedSettings> as AdvancedSettings,
      ],
    })

    const remapped = generateNewIds(data)
    const project = remapped.projects[0]

    expect(project.defaultTranslationBasicSettingsId).not.toBe("translation-basic")
    expect(project.defaultTranslationAdvancedSettingsId).not.toBe("translation-advanced")
    expect(project.defaultExtractionBasicSettingsId).not.toBe("extraction-basic")
    expect(project.defaultExtractionAdvancedSettingsId).not.toBe("extraction-advanced")
    expect(remapped.basicSettings.map(settings => settings.id)).toContain(project.defaultTranslationBasicSettingsId)
    expect(remapped.basicSettings.map(settings => settings.id)).toContain(project.defaultExtractionBasicSettingsId)
    expect(remapped.advancedSettings.map(settings => settings.id)).toContain(project.defaultTranslationAdvancedSettingsId)
    expect(remapped.advancedSettings.map(settings => settings.id)).toContain(project.defaultExtractionAdvancedSettingsId)
  })

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

describe("legacy settings cleanup", () => {
  test("selects settings referenced only by obsolete project fields", () => {
    const orphaned = getOrphanedLegacySettingsIds({
      legacyProjects: [{
        defaultBasicSettingsId: "legacy-basic",
        defaultAdvancedSettingsId: "legacy-advanced",
      }],
      projects: [],
      translations: [],
      extractions: [],
    })

    expect(orphaned.basic).toEqual(new Set(["legacy-basic"]))
    expect(orphaned.advanced).toEqual(new Set(["legacy-advanced"]))
  })

  test("preserves legacy settings also referenced by active entities", () => {
    const orphaned = getOrphanedLegacySettingsIds({
      legacyProjects: [{
        defaultBasicSettingsId: "shared-basic",
        defaultAdvancedSettingsId: "shared-advanced",
      }],
      projects: [],
      translations: [{
        id: "translation-1",
        basicSettingsId: "shared-basic",
        advancedSettingsId: "shared-advanced",
      } as Partial<Translation> as Translation],
      extractions: [],
    })

    expect(orphaned.basic).toEqual(new Set())
    expect(orphaned.advanced).toEqual(new Set())
  })
})
