import { afterEach, describe, expect, test } from 'bun:test'
import Dexie from 'dexie'
import { IDBKeyRange, indexedDB } from 'fake-indexeddb'
import { MyDatabase } from '@/lib/db/db'

const databaseNames: string[] = []
Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange

afterEach(async () => {
  await Promise.all(databaseNames.splice(0).map(name => Dexie.delete(name)))
})

describe('version 33 context mode migration', () => {
  test('inverts legacy values, preserves new values, defaults missing values, and removes the old field', async () => {
    const name = `migration-v33-${crypto.randomUUID()}`
    databaseNames.push(name)
    const legacy = new Dexie(name)
    legacy.version(32).stores({ settings: 'id, createdAt, updatedAt' })
    await legacy.open()
    await legacy.table('settings').bulkAdd([
      { id: 'old-true', isBetterContextCaching: true },
      { id: 'old-false', isBetterContextCaching: false },
      { id: 'new-true', isMinimalContextMode: true },
      { id: 'new-false', isMinimalContextMode: false },
      { id: 'missing' },
      { id: 'both', isMinimalContextMode: true, isBetterContextCaching: true },
    ])
    legacy.close()

    const upgraded = new MyDatabase(name)
    await upgraded.open()
    const records = await upgraded.settings.toArray()
    const values = Object.fromEntries(records.map(item => [item.id, item.isMinimalContextMode]))
    expect(values).toEqual({
      'old-true': false,
      'old-false': true,
      'new-true': true,
      'new-false': false,
      missing: false,
      both: false,
    })
    for (const record of records) expect(record).not.toHaveProperty('isBetterContextCaching')
    upgraded.close()
  })
})
