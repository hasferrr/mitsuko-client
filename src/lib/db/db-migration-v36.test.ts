import { afterEach, describe, expect, test } from "bun:test"
import Dexie from "dexie"
import { IDBKeyRange, indexedDB } from "fake-indexeddb"
import { DEFAULT_EXTRACTION_BASIC_SETTINGS } from "@/constants/default"
import { GLOBAL_EXTRACTION_SETTINGS_ID } from "@/constants/global-settings"
import { MyDatabase } from "@/lib/db/db"

const databaseNames: string[] = []
Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange

afterEach(async () => {
  await Promise.all(databaseNames.splice(0).map(name => Dexie.delete(name)))
})

describe("version 36 extraction model migration", () => {
  test("replaces GLM 5.2 Free in global and project extraction defaults only", async () => {
    const name = `migration-v36-${crypto.randomUUID()}`
    databaseNames.push(name)
    const legacy = new Dexie(name)
    legacy.version(35).stores({
      projects: "id, name, createdAt, updatedAt, defaultTranslationSettingsId, defaultExtractionSettingsId",
      settings: "id, createdAt, updatedAt",
    })
    await legacy.open()
    await legacy.table("projects").add({
      id: "project-1",
      defaultExtractionSettingsId: "project-extraction-settings",
    })
    const glmFree = {
      name: "GLM 5.2",
      maxInput: 1_040_000,
      maxOutput: 131_072,
      structuredOutput: true,
      isPaid: false,
      usage: "N/A" as const,
    }
    const glmPaid = { ...glmFree, isPaid: true, usage: "medium" as const }
    await legacy.table("settings").bulkAdd([
      { id: GLOBAL_EXTRACTION_SETTINGS_ID, modelDetail: glmFree },
      { id: "project-extraction-settings", modelDetail: glmFree },
      { id: "item-extraction-settings", modelDetail: glmFree },
      { id: "paid-glm-settings", modelDetail: glmPaid },
    ])
    legacy.close()

    const upgraded = new MyDatabase(name)
    await upgraded.open()

    expect((await upgraded.settings.get(GLOBAL_EXTRACTION_SETTINGS_ID))?.modelDetail)
      .toEqual(DEFAULT_EXTRACTION_BASIC_SETTINGS.modelDetail)
    expect((await upgraded.settings.get("project-extraction-settings"))?.modelDetail)
      .toEqual(DEFAULT_EXTRACTION_BASIC_SETTINGS.modelDetail)
    expect((await upgraded.settings.get("item-extraction-settings"))?.modelDetail)
      .toEqual(glmFree)
    expect((await upgraded.settings.get("paid-glm-settings"))?.modelDetail)
      .toEqual(glmPaid)
    upgraded.close()
  })
})
