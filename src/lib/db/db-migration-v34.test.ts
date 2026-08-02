import { afterEach, describe, expect, test } from 'bun:test'
import Dexie from 'dexie'
import { IDBKeyRange, indexedDB } from 'fake-indexeddb'
import { GLOBAL_TRANSCRIPTION_SETTINGS_ID } from '@/constants/global-settings'
import { MyDatabase } from '@/lib/db/db'

const databaseNames: string[] = []
Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange

afterEach(async () => {
  await Promise.all(databaseNames.splice(0).map(name => Dexie.delete(name)))
})

describe('version 34 transcription mode migration', () => {
  test('changes sentence mode only for global and project settings', async () => {
    const name = `migration-v34-${crypto.randomUUID()}`
    databaseNames.push(name)
    const legacy = new Dexie(name)
    legacy.version(33).stores({
      projects: 'id, name, createdAt, updatedAt, defaultTranslationSettingsId, defaultExtractionSettingsId',
      transcriptions: 'id, projectId, title, createdAt, updatedAt',
    })
    await legacy.open()
    await legacy.table('projects').add({
      id: 'project-1',
      defaultTranscriptionId: 'project-settings',
    })
    await legacy.table('transcriptions').bulkAdd([
      { id: GLOBAL_TRANSCRIPTION_SETTINGS_ID, selectedMode: 'sentence' },
      { id: 'project-settings', projectId: 'project-1', selectedMode: 'sentence' },
      { id: 'ordinary-transcription', projectId: 'project-1', selectedMode: 'sentence' },
      { id: 'existing-clause-settings', projectId: 'project-1', selectedMode: 'clause' },
    ])
    legacy.close()

    const upgraded = new MyDatabase(name)
    await upgraded.open()
    const records = await upgraded.transcriptions.toArray()
    const values = Object.fromEntries(records.map(item => [item.id, item.selectedMode]))

    expect(values).toEqual({
      [GLOBAL_TRANSCRIPTION_SETTINGS_ID]: 'clause',
      'project-settings': 'clause',
      'ordinary-transcription': 'sentence',
      'existing-clause-settings': 'clause',
    })
    upgraded.close()
  })
})
