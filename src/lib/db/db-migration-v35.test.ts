import { afterEach, describe, expect, test } from "bun:test"
import Dexie from "dexie"
import { IDBKeyRange, indexedDB } from "fake-indexeddb"
import { MyDatabase } from "@/lib/db/db"

const databaseNames: string[] = []
Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange

afterEach(async () => {
  await Promise.all(databaseNames.splice(0).map(name => Dexie.delete(name)))
})

describe("version 35 batch Auto Context migration", () => {
  test("defaults existing projects to disabled with no Starting Context", async () => {
    const name = `migration-v35-${crypto.randomUUID()}`
    databaseNames.push(name)
    const legacy = new Dexie(name)
    legacy.version(34).stores({
      projects: "id, name, createdAt, updatedAt, defaultTranslationSettingsId, defaultExtractionSettingsId",
    })
    await legacy.open()
    await legacy.table("projects").bulkAdd([
      { id: "batch-project", isBatch: true },
      { id: "single-project", isBatch: false },
    ])
    legacy.close()

    const upgraded = new MyDatabase(name)
    await upgraded.open()
    const projects = await upgraded.projects.toArray()

    expect(projects.map(project => ({
      id: project.id,
      enabled: project.isBatchAutoContextEnabled,
      startingId: project.batchAutoContextStartingExtractionId,
    }))).toEqual([
      { id: "batch-project", enabled: false, startingId: null },
      { id: "single-project", enabled: false, startingId: null },
    ])
    upgraded.close()
  })
})
