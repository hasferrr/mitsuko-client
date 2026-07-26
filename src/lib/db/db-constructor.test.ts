import { describe, expect, test } from "bun:test"
import {
  convertLegacyDatabaseExport,
  databaseExportConstructor,
  generateNewIds,
} from "@/lib/db/db-constructor"
import { DEFAULT_ADVANCED_SETTINGS, DEFAULT_BASIC_SETTINGS, DEFAULT_EXTRACTION_BASIC_SETTINGS, DEFAULT_SETTINGS } from "@/constants/default"
import { Project, Settings, Translation } from "@/types/project"

const meta = { createdAt: new Date("2026-01-01T00:00:00Z"), updatedAt: new Date("2026-01-01T00:00:00Z") }
const setting = (id: string): Settings => ({ ...DEFAULT_SETTINGS, ...meta, id })

describe("database export conversion", () => {
  test("constructs format version 2 exports", () => {
    const data = databaseExportConstructor({ settings: [setting("settings-1")] })
    expect(data.formatVersion).toBe(2)
    expect(data.settings[0].id).toBe("settings-1")
    expect(data).not.toHaveProperty("basicSettings")
    expect(data).not.toHaveProperty("advancedSettings")
  })

  test("merges each shared legacy pair once", () => {
    const data = convertLegacyDatabaseExport({
      basicSettings: [{ ...DEFAULT_BASIC_SETTINGS, ...meta, id: "basic-1" }],
      advancedSettings: [{ ...DEFAULT_ADVANCED_SETTINGS, ...meta, id: "advanced-1" }],
      translations: [
        { id: "translation-1", basicSettingsId: "basic-1", advancedSettingsId: "advanced-1" },
        { id: "translation-2", basicSettingsId: "basic-1", advancedSettingsId: "advanced-1" },
      ] as never,
    })
    expect(data.settings).toHaveLength(1)
    expect(data.translations[0].settingsId).toBe(data.translations[1].settingsId)
  })

  test("keeps empty legacy references independent", () => {
    const data = convertLegacyDatabaseExport({
      translations: [
        { id: "translation-1", basicSettingsId: "", advancedSettingsId: "" },
        { id: "translation-2" },
      ] as never,
      extractions: [
        { id: "extraction-1", basicSettingsId: "", advancedSettingsId: "" },
        { id: "extraction-2" },
      ] as never,
    })
    expect(data.translations[0].settingsId).not.toBe(data.translations[1].settingsId)
    expect(data.extractions[0].settingsId).not.toBe(data.extractions[1].settingsId)
  })

  test("fills missing halves with feature defaults", () => {
    const data = convertLegacyDatabaseExport({
      projects: [{
        id: "project-1",
        defaultTranslationBasicSettingsId: "missing-translation",
        defaultTranslationAdvancedSettingsId: "missing-advanced",
        defaultExtractionBasicSettingsId: "missing-extraction",
        defaultExtractionAdvancedSettingsId: "missing-advanced",
      }] as never,
    })
    const project = data.projects[0]
    const translation = data.settings.find(item => item.id === project.defaultTranslationSettingsId)
    const extraction = data.settings.find(item => item.id === project.defaultExtractionSettingsId)
    expect(translation?.modelDetail).toEqual(DEFAULT_BASIC_SETTINGS.modelDetail)
    expect(extraction?.modelDetail).toEqual(DEFAULT_EXTRACTION_BASIC_SETTINGS.modelDetail)
    expect(translation?.temperature).toBe(DEFAULT_ADVANCED_SETTINGS.temperature)
  })

  test("applies extraction defaults after merging partial legacy settings", () => {
    const data = convertLegacyDatabaseExport({
      projects: [{
        id: "project-1",
        defaultTranslationBasicSettingsId: "missing-translation",
        defaultTranslationAdvancedSettingsId: "missing-translation-advanced",
        defaultExtractionBasicSettingsId: "extraction-basic",
        defaultExtractionAdvancedSettingsId: "extraction-advanced",
      }] as never,
      basicSettings: [{ id: "extraction-basic" }] as never,
      advancedSettings: [{ id: "extraction-advanced" }] as never,
    })
    const settings = data.settings.find(item => item.id === data.projects[0].defaultExtractionSettingsId)
    expect(settings?.modelDetail).toEqual(DEFAULT_EXTRACTION_BASIC_SETTINGS.modelDetail)
  })

  test("normalizes partial v2 settings from feature ownership", () => {
    const extractionOnly = databaseExportConstructor({
      extractions: [{ id: "extraction", settingsId: "settings" } as never],
      settings: [{ id: "settings", fewShot: { isEnabled: true } } as never],
    }).settings[0]
    expect(extractionOnly.modelDetail).toEqual(DEFAULT_EXTRACTION_BASIC_SETTINGS.modelDetail)
    expect(extractionOnly.fewShot.isEnabled).toBe(true)
    expect(extractionOnly.fewShot.type).toBe(DEFAULT_SETTINGS.fewShot.type)

    const shared = databaseExportConstructor({
      translations: [{ id: "translation", settingsId: "settings" } as never],
      extractions: [{ id: "extraction", settingsId: "settings" } as never],
      settings: [{ id: "settings" } as never],
    }).settings[0]
    expect(shared.modelDetail).toEqual(DEFAULT_SETTINGS.modelDetail)
  })

  test("uses earliest creation and latest update timestamps from legacy pairs", () => {
    const data = convertLegacyDatabaseExport({
      basicSettings: [{
        ...DEFAULT_BASIC_SETTINGS,
        id: "basic",
        createdAt: "2025-02-01T00:00:00Z",
        updatedAt: new Date("2025-03-01T00:00:00Z"),
      }] as never,
      advancedSettings: [{
        ...DEFAULT_ADVANCED_SETTINGS,
        id: "advanced",
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: "2025-04-01T00:00:00Z",
      }] as never,
      translations: [{
        id: "translation",
        basicSettingsId: "basic",
        advancedSettingsId: "advanced",
      }] as never,
    })
    expect(data.settings[0].createdAt).toEqual(new Date("2025-01-01T00:00:00Z"))
    expect(data.settings[0].updatedAt).toEqual(new Date("2025-04-01T00:00:00Z"))
  })

  test("infers legacy batch extraction status with project context", () => {
    const data = convertLegacyDatabaseExport({
      projects: [{
        id: "project-1",
        isBatch: true,
        defaultTranslationBasicSettingsId: "",
        defaultTranslationAdvancedSettingsId: "",
        defaultExtractionBasicSettingsId: "",
        defaultExtractionAdvancedSettingsId: "",
      }] as never,
      extractions: [{
        id: "extraction-1",
        projectId: "project-1",
        basicSettingsId: "",
        advancedSettingsId: "",
        contextResult: "partial result",
      }] as never,
    })
    expect(data.extractions[0].status).toBe("stopped")
  })

  test("infers completion before stripping legacy done tags", () => {
    const data = databaseExportConstructor({
      projects: [{ id: "project-1", isBatch: true } as Project],
      extractions: [{
        id: "extraction-1",
        projectId: "project-1",
        contextResult: "finished<done>",
      } as never],
    })
    expect(data.extractions[0].status).toBe("completed")
    expect(data.extractions[0].contextResult).toBe("finished")
  })
})

describe("generateNewIds", () => {
  test("remaps unified settings while preserving sharing", () => {
    const project = {
      id: "project-1",
      translations: ["translation-1"],
      defaultTranslationId: "translation-1",
      defaultTranslationSettingsId: "settings-1",
      defaultExtractionSettingsId: "settings-1",
    } as Partial<Project> as Project
    const translation = {
      id: "translation-1",
      projectId: "project-1",
      settingsId: "settings-1",
    } as Partial<Translation> as Translation
    const remapped = generateNewIds(databaseExportConstructor({
      projects: [project],
      translations: [translation],
      settings: [setting("settings-1")],
    }))
    expect(remapped.settings[0].id).not.toBe("settings-1")
    expect(remapped.projects[0].defaultTranslationSettingsId).toBe(remapped.settings[0].id)
    expect(remapped.projects[0].defaultExtractionSettingsId).toBe(remapped.settings[0].id)
    expect(remapped.translations[0].settingsId).toBe(remapped.settings[0].id)
  })
})
