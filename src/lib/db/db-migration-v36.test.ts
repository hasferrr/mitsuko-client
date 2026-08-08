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

describe("version 36 shared Auto Context migration", () => {
  test("removes reverse Translation ownership from existing Extractions", async () => {
    const name = `migration-v36-${crypto.randomUUID()}`
    databaseNames.push(name)
    const legacy = new Dexie(name)
    legacy.version(35).stores({
      extractions: "id, projectId, settingsId, episodeNumber, createdAt, updatedAt",
    })
    await legacy.open()
    await legacy.table("extractions").add({
      id: "extraction-1",
      projectId: "project-1",
      ownerTranslationId: "translation-1",
    })
    legacy.close()

    const upgraded = new MyDatabase(name)
    await upgraded.open()
    const extraction = await upgraded.extractions.get("extraction-1") as unknown as Record<string, unknown>

    expect(extraction).not.toHaveProperty("ownerTranslationId")
    upgraded.close()
  })
})
