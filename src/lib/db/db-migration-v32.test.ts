import { afterEach, describe, expect, test } from 'bun:test'
import Dexie from 'dexie'
import { IDBKeyRange, indexedDB } from 'fake-indexeddb'
import { MyDatabase } from '@/lib/db/db'
import { DEFAULT_ADVANCED_SETTINGS, DEFAULT_EXTRACTION_BASIC_SETTINGS, DEFAULT_SETTINGS } from '@/constants/default'
import {
  LEGACY_GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID,
  LEGACY_GLOBAL_EXTRACTION_BASIC_SETTINGS_ID,
  GLOBAL_EXTRACTION_SETTINGS_ID,
  LEGACY_GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID,
  LEGACY_GLOBAL_TRANSLATION_BASIC_SETTINGS_ID,
  GLOBAL_TRANSLATION_SETTINGS_ID,
} from '@/constants/global-settings'

const databaseNames: string[] = []
Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange

afterEach(async () => {
  await Promise.all(databaseNames.splice(0).map(name => Dexie.delete(name)))
})

describe('version 32 settings migration', () => {
  test('preserves versions 6 through 31 byte-for-byte', async () => {
    const source = await Bun.file(new URL('./db.ts', import.meta.url)).text()
    const historical = source.slice(source.indexOf('    this.version(6)'), source.indexOf('    this.version(32)'))
    const digest = new Bun.CryptoHasher('sha256').update(historical).digest('hex')
    expect(historical.length).toBe(17627)
    expect(digest).toBe('5ff2b865b03989fdc59eb1f0659dc72c23d9e676f29612faff948e70f86cda54')
  })

  test('merges referenced pairs, isolates empty references, fills missing halves, and migrates globals', async () => {
    const name = `migration-v32-${crypto.randomUUID()}`
    databaseNames.push(name)
    const legacy = new Dexie(name)
    legacy.version(31).stores({
      projects: 'id, name, createdAt, updatedAt',
      translations: 'id, projectId, title, createdAt, updatedAt',
      transcriptions: 'id, projectId, title, createdAt, updatedAt',
      extractions: 'id, projectId, episodeNumber, createdAt, updatedAt',
      projectOrders: 'id',
      basicSettings: 'id, createdAt, updatedAt',
      advancedSettings: 'id, createdAt, updatedAt',
      customInstructions: 'id, name',
      customInstructionOrders: 'id',
    })
    await legacy.open()
    const now = new Date('2026-01-01T00:00:00Z')
    await legacy.table('basicSettings').bulkAdd([
      { ...DEFAULT_SETTINGS, id: 'shared-basic', createdAt: now, updatedAt: now },
      { ...DEFAULT_SETTINGS, id: LEGACY_GLOBAL_TRANSLATION_BASIC_SETTINGS_ID, createdAt: now, updatedAt: now },
      { ...DEFAULT_EXTRACTION_BASIC_SETTINGS, id: LEGACY_GLOBAL_EXTRACTION_BASIC_SETTINGS_ID, createdAt: now, updatedAt: now },
    ])
    await legacy.table('advancedSettings').bulkAdd([
      { ...DEFAULT_ADVANCED_SETTINGS, id: 'shared-advanced', createdAt: now, updatedAt: now },
      { ...DEFAULT_ADVANCED_SETTINGS, id: LEGACY_GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID, createdAt: now, updatedAt: now },
      { ...DEFAULT_ADVANCED_SETTINGS, id: LEGACY_GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID, createdAt: now, updatedAt: now },
    ])
    await legacy.table('projects').add({
      id: 'project-1',
      defaultTranslationBasicSettingsId: 'shared-basic',
      defaultTranslationAdvancedSettingsId: 'shared-advanced',
      defaultExtractionBasicSettingsId: 'missing-basic',
      defaultExtractionAdvancedSettingsId: 'missing-advanced',
    })
    await legacy.table('translations').bulkAdd([
      {
        id: 'translation-1',
        projectId: 'project-1',
        basicSettingsId: 'shared-basic',
        advancedSettingsId: 'shared-advanced',
      },
      {
        id: 'translation-missing-advanced',
        projectId: 'project-1',
        basicSettingsId: 'shared-basic',
        advancedSettingsId: 'missing-advanced-only',
      },
      {
        id: 'translation-empty-1',
        projectId: 'project-1',
        basicSettingsId: '',
        advancedSettingsId: '',
      },
      {
        id: 'translation-missing-references',
        projectId: 'project-1',
      },
    ])
    await legacy.table('extractions').bulkAdd([
      {
        id: 'extraction-1',
        projectId: 'project-1',
        basicSettingsId: 'missing-basic',
        advancedSettingsId: 'missing-advanced',
      },
      {
        id: 'extraction-empty-1',
        projectId: 'project-1',
        basicSettingsId: '',
        advancedSettingsId: '',
      },
      {
        id: 'extraction-missing-references',
        projectId: 'project-1',
      },
    ])
    legacy.close()

    const upgraded = new MyDatabase(name)
    await upgraded.open()
    const project = await upgraded.projects.get('project-1')
    const translation = await upgraded.translations.get('translation-1')
    const translationMissingAdvanced = await upgraded.translations.get('translation-missing-advanced')
    const translationEmpty1 = await upgraded.translations.get('translation-empty-1')
    const translationMissingReferences = await upgraded.translations.get('translation-missing-references')
    const extraction = await upgraded.extractions.get('extraction-1')
    const extractionEmpty1 = await upgraded.extractions.get('extraction-empty-1')
    const extractionMissingReferences = await upgraded.extractions.get('extraction-missing-references')
    const tables = upgraded.tables.map(table => table.name)

    expect(tables).toContain('settings')
    expect(tables).not.toContain('basicSettings')
    expect(tables).not.toContain('advancedSettings')
    expect(upgraded.projects.schema.indexes.some(index => index.name === 'defaultTranslationSettingsId')).toBe(true)
    expect(upgraded.projects.schema.indexes.some(index => index.name === 'defaultExtractionSettingsId')).toBe(true)
    expect(upgraded.translations.schema.indexes.some(index => index.name === 'settingsId')).toBe(true)
    expect(upgraded.extractions.schema.indexes.some(index => index.name === 'settingsId')).toBe(true)
    expect(project?.defaultTranslationSettingsId).toBe(translation?.settingsId)
    expect(project?.defaultExtractionSettingsId).toBe(extraction?.settingsId)
    expect(project).not.toHaveProperty('defaultTranslationBasicSettingsId')
    expect(translation).not.toHaveProperty('basicSettingsId')
    expect(extraction).not.toHaveProperty('advancedSettingsId')
    expect(await upgraded.settings.get(GLOBAL_TRANSLATION_SETTINGS_ID)).toBeDefined()
    expect(await upgraded.settings.get(GLOBAL_EXTRACTION_SETTINGS_ID)).toBeDefined()
    expect((await upgraded.settings.get(extraction!.settingsId))?.modelDetail).toEqual(
      DEFAULT_EXTRACTION_BASIC_SETTINGS.modelDetail,
    )
    expect((await upgraded.settings.get(extraction!.settingsId))?.temperature).toBe(
      DEFAULT_ADVANCED_SETTINGS.temperature,
    )
    expect((await upgraded.settings.get(translationMissingAdvanced!.settingsId))?.modelDetail).toEqual(
      DEFAULT_SETTINGS.modelDetail,
    )
    expect((await upgraded.settings.get(translationMissingAdvanced!.settingsId))?.temperature).toBe(
      DEFAULT_ADVANCED_SETTINGS.temperature,
    )
    expect(translationEmpty1?.settingsId).not.toBe(translationMissingReferences?.settingsId)
    expect(extractionEmpty1?.settingsId).not.toBe(extractionMissingReferences?.settingsId)
    expect(await upgraded.settings.count()).toBe(9)
    upgraded.close()
  })
})
