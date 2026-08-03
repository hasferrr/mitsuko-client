import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test'
import Dexie from 'dexie'
import { IDBKeyRange, indexedDB } from 'fake-indexeddb'
import {
  DEFAULT_ADVANCED_SETTINGS,
  DEFAULT_BASIC_SETTINGS,
  DEFAULT_EXTRACTION_SETTINGS,
  DEFAULT_SETTINGS,
  DEFAULT_TRANSLATION_SETTINGS,
} from '@/constants/default'
import { db } from '@/lib/db/db'
import { createProject, deleteProject } from '@/lib/db/project'
import { createExtraction, deleteExtraction } from '@/lib/db/extraction'
import { createTranslation, deleteTranslation, moveTranslation, updateTranslation } from '@/lib/db/translation'
import { getSettings, updateSettings } from '@/lib/db/settings'
import { exportDatabase, exportProject, exportProjects, importDatabase } from '@/lib/db/db-io'
import { useSettingsStore } from '@/stores/settings/use-settings-store'
import { useTranslationDataStore } from '@/stores/data/use-translation-data-store'
import { useExtractionDataStore } from '@/stores/data/use-extraction-data-store'
import { GLOBAL_EXTRACTION_SETTINGS_ID, GLOBAL_TRANSLATION_SETTINGS_ID } from '@/constants/global-settings'

Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange

const dependencies = db as unknown as {
  _deps: { indexedDB: IDBFactory; IDBKeyRange: typeof globalThis.IDBKeyRange }
}
dependencies._deps = { indexedDB, IDBKeyRange: IDBKeyRange as unknown as typeof globalThis.IDBKeyRange }

beforeAll(async () => {
  await db.open()
})

beforeEach(async () => {
  await Promise.all(db.tables.map(table => table.clear()))
})

afterAll(async () => {
  db.close()
  await Dexie.delete(db.name)
})

async function seedCurrentDatabase() {
  const project = await createProject('Exported Project')
  const translation = await createTranslation(project.id, {
    title: 'Episode 1',
    subtitles: [],
    parsed: { ...DEFAULT_TRANSLATION_SETTINGS.parsed },
  })
  return { project, translation }
}

describe('database import and export', () => {
  test('exports and imports format version 2 with unified settings only', async () => {
    await seedCurrentDatabase()
    const content = await exportDatabase()
    const exported = JSON.parse(content) as Record<string, unknown>
    expect(exported.formatVersion).toBe(2)
    expect(Array.isArray(exported.settings)).toBe(true)
    expect(exported).not.toHaveProperty('basicSettings')
    expect(exported).not.toHaveProperty('advancedSettings')

    await importDatabase(content, true)
    expect(await db.projects.count()).toBe(1)
    expect(await db.settings.filter(item => !item.id.startsWith('global-')).count()).toBeGreaterThan(0)
    const imported = await db.projects.toCollection().first()
    expect(await db.settings.get(imported!.defaultTranslationSettingsId)).toBeDefined()
  })

  test('imports a legacy split-settings backup', async () => {
    const now = new Date().toISOString()
    const legacy = {
      projects: [{
        id: 'legacy-project',
        name: 'Legacy Project',
        translations: ['legacy-translation'],
        transcriptions: [],
        extractions: [],
        defaultTranslationBasicSettingsId: 'legacy-basic',
        defaultTranslationAdvancedSettingsId: 'legacy-advanced',
        defaultExtractionBasicSettingsId: 'legacy-basic',
        defaultExtractionAdvancedSettingsId: 'legacy-advanced',
        createdAt: now,
        updatedAt: now,
      }],
      translations: [{
        id: 'legacy-translation',
        projectId: 'legacy-project',
        basicSettingsId: 'legacy-basic',
        advancedSettingsId: 'legacy-advanced',
      }],
      basicSettings: [{ ...DEFAULT_BASIC_SETTINGS, id: 'legacy-basic', createdAt: now, updatedAt: now }],
      advancedSettings: [{ ...DEFAULT_ADVANCED_SETTINGS, id: 'legacy-advanced', createdAt: now, updatedAt: now }],
    }
    await importDatabase(JSON.stringify(legacy), true)
    const project = await db.projects.get('legacy-project')
    const translation = await db.translations.get('legacy-translation')
    expect(project?.defaultTranslationSettingsId).toBe(translation?.settingsId)
    expect(project).not.toHaveProperty('defaultTranslationBasicSettingsId')
    expect(await db.settings.get(translation!.settingsId)).toBeDefined()
  })

  test('rejects malformed overwrite imports before clearing existing data', async () => {
    const { project } = await seedCurrentDatabase()
    const malformed = JSON.stringify({
      formatVersion: 2,
      settings: [],
      projects: [{ id: 'malformed-project', translations: 'not-an-array', isBatch: 'yes' }],
    })

    await expect(importDatabase(malformed, true)).rejects.toThrow()
    expect(await db.projects.get(project.id)).toBeDefined()
    expect(await db.projects.get('malformed-project')).toBeUndefined()
  })

  test.each([
    ['missing', undefined],
    ['dangling', 'missing-settings'],
  ])('repairs v2 imports with %s child settings before overwrite', async (_case, settingsId) => {
    await seedCurrentDatabase()
    const translation = {
      id: 'invalid-translation',
      projectId: 'invalid-project',
      ...(settingsId === undefined ? {} : { settingsId }),
    }
    const malformed = JSON.stringify({
      formatVersion: 2,
      settings: [],
      projects: [{ id: 'invalid-project', translations: [translation.id] }],
      translations: [translation],
    })

    await importDatabase(malformed, true)
    const imported = await db.translations.get(translation.id)
    expect(imported).toBeDefined()
    expect(await db.settings.get(imported!.settingsId)).toMatchObject({
      modelDetail: DEFAULT_SETTINGS.modelDetail,
    })
  })

  test('remaps unified IDs during merge import and preserves pair sharing', async () => {
    const { project } = await seedCurrentDatabase()
    const content = await exportDatabase()
    await importDatabase(content, false)
    const projects = await db.projects.toArray()
    expect(projects).toHaveLength(2)
    const imported = projects.find(item => item.id !== project.id)!
    expect(imported.defaultTranslationSettingsId).not.toBe(project.defaultTranslationSettingsId)
    const template = await db.translations.get(imported.defaultTranslationId)
    expect(template?.settingsId).toBe(imported.defaultTranslationSettingsId)
  })

  test('repairs extraction references with extraction defaults and feature-specific sharing', async () => {
    const content = JSON.stringify({
      formatVersion: 2,
      settings: [],
      projects: [{
        id: 'project',
        translations: ['translation-a', 'translation-b'],
        extractions: ['extraction'],
        defaultTranslationSettingsId: 'dangling',
        defaultExtractionSettingsId: 'dangling',
      }],
      translations: [
        { id: 'translation-a', projectId: 'project', settingsId: 'dangling' },
        { id: 'translation-b', projectId: 'project', settingsId: 'dangling' },
      ],
      extractions: [{ id: 'extraction', projectId: 'project', settingsId: 'dangling' }],
    })
    await importDatabase(content, true)
    const project = await db.projects.get('project')
    const translations = await db.translations.bulkGet(['translation-a', 'translation-b'])
    const extraction = await db.extractions.get('extraction')
    expect(translations[0]?.settingsId).toBe(translations[1]?.settingsId)
    expect(translations[0]?.settingsId).toBe(project?.defaultTranslationSettingsId)
    expect(extraction?.settingsId).toBe(project?.defaultExtractionSettingsId)
    expect(extraction?.settingsId).not.toBe(translations[0]?.settingsId)
    expect(await db.settings.get(extraction!.settingsId)).toMatchObject({
      modelDetail: DEFAULT_EXTRACTION_SETTINGS.modelDetail,
    })
  })

  test('keeps global references without creating replacement settings', async () => {
    await importDatabase(JSON.stringify({
      formatVersion: 2,
      settings: [],
      translations: [
        { id: 'translation', settingsId: GLOBAL_TRANSLATION_SETTINGS_ID },
      ],
      extractions: [
        { id: 'extraction', settingsId: GLOBAL_EXTRACTION_SETTINGS_ID },
      ],
    }), true)
    expect((await db.translations.get('translation'))?.settingsId).toBe(GLOBAL_TRANSLATION_SETTINGS_ID)
    expect((await db.extractions.get('extraction'))?.settingsId).toBe(GLOBAL_EXTRACTION_SETTINGS_ID)
    expect(await db.settings.count()).toBe(2)
  })

  test('keeps customized global settings when the final imported owner is deleted', async () => {
    await importDatabase(JSON.stringify({
      formatVersion: 2,
      settings: [],
      extractions: [
        { id: 'extraction', settingsId: GLOBAL_EXTRACTION_SETTINGS_ID },
      ],
    }), true)
    await updateSettings(GLOBAL_EXTRACTION_SETTINGS_ID, { customInstructions: 'Customized global settings' })
    await deleteExtraction('', 'extraction')
    expect(await db.settings.get(GLOBAL_EXTRACTION_SETTINGS_ID)).toMatchObject({
      customInstructions: 'Customized global settings',
    })
  })

  test('merge import remaps repaired shared settings', async () => {
    const content = JSON.stringify({
      formatVersion: 2,
      settings: [],
      translations: [
        { id: 'first', settingsId: 'missing' },
        { id: 'second', settingsId: 'missing' },
      ],
    })
    await importDatabase(content, false)
    const translations = await db.translations.toArray()
    expect(translations[0].settingsId).toBe(translations[1].settingsId)
    expect(translations[0].settingsId).not.toBe('missing')
  })
})

describe('self-contained exports', () => {
  test('sanitizes external links without mutating database records', async () => {
    const { project, translation } = await seedCurrentDatabase()
    const externalTranslation = await createTranslation(project.id, {
      title: 'External',
      subtitles: [],
      parsed: { ...DEFAULT_TRANSLATION_SETTINGS.parsed },
    })
    const extractionId = crypto.randomUUID()
    await db.extractions.add({
      id: extractionId,
      title: 'Context',
      episodeNumber: '',
      subtitleContent: '',
      previousContext: '',
      contextResult: '',
      status: 'idle',
      ownerTranslationId: externalTranslation.id,
      completedAt: null,
      projectId: project.id,
      settingsId: project.defaultExtractionSettingsId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await updateSettings(translation.settingsId, {
      fewShot: {
        ...DEFAULT_SETTINGS.fewShot,
        type: 'linked',
        isEnabled: true,
        linkedId: externalTranslation.id,
      },
    })
    await updateTranslation(translation.id, {
      autoContextMode: 'use-existing',
      autoContextExtractionId: extractionId,
      autoContextPreviousMode: 'selected',
      autoContextPreviousExtractionId: extractionId,
    })

    const exported = await exportProject(project.id)
    const parsed = JSON.parse(exported!.content)
    expect(parsed.settings.find((item: { id: string }) => item.id === translation.settingsId).fewShot.linkedId)
      .toBe(externalTranslation.id)
    expect(parsed.translations.find((item: { id: string }) => item.id === translation.id).autoContextExtractionId)
      .toBe(extractionId)

    const isolatedProject = await createProject('Isolated')
    await db.settings.update(isolatedProject.defaultTranslationSettingsId, {
      fewShot: {
        ...DEFAULT_SETTINGS.fewShot,
        type: 'linked',
        isEnabled: true,
        linkedId: translation.id,
      },
    })
    const isolatedExport = JSON.parse((await exportProject(isolatedProject.id))!.content)
    const sanitized = isolatedExport.settings.find(
      (item: { id: string }) => item.id === isolatedProject.defaultTranslationSettingsId,
    )
    expect(sanitized.fewShot).toMatchObject({ type: 'linked', isEnabled: false, linkedId: '' })
    expect((await db.settings.get(isolatedProject.defaultTranslationSettingsId))?.fewShot.linkedId)
      .toBe(translation.id)

    const multi = JSON.parse((await exportProjects([project.id, isolatedProject.id]))!.content)
    expect(multi.settings.find(
      (item: { id: string }) => item.id === isolatedProject.defaultTranslationSettingsId,
    ).fewShot.linkedId).toBe(translation.id)
  })
})

describe('unified settings persistence', () => {
  test('copies basic and advanced groups through one record', async () => {
    const project = await createProject('Settings Project')
    const source = await getSettings(project.defaultTranslationSettingsId)
    const target = await getSettings(project.defaultExtractionSettingsId)
    useSettingsStore.setState({ data: {} })
    useSettingsStore.getState().upsertData(source!.id, {
      ...source!,
      sourceLanguage: 'English',
      temperature: 0.25,
    })
    useSettingsStore.getState().upsertData(target!.id, target!)
    await useSettingsStore.getState().copySettingsKeys(source!.id, target!.id, [
      'sourceLanguage',
      'temperature',
    ])
    const persisted = await getSettings(target!.id)
    expect(persisted?.sourceLanguage).toBe('English')
    expect(persisted?.temperature).toBe(0.25)
    expect(useSettingsStore.getState().getSourceLanguage(target!.id)).toBe('English')
    expect(useSettingsStore.getState().getTemperature(target!.id)).toBe(0.25)
    await useSettingsStore.getState().resetSettings(source!.id)
    const reset = await getSettings(source!.id)
    expect(reset?.sourceLanguage).toBe(DEFAULT_BASIC_SETTINGS.sourceLanguage)
    expect(reset?.temperature).toBe(DEFAULT_ADVANCED_SETTINGS.temperature)
  })

  test('keeps shared settings until the final owner is deleted', async () => {
    const project = await createProject('Shared Project')
    const first = await createTranslation(project.id, {
      title: 'First',
      subtitles: [],
      parsed: { ...DEFAULT_TRANSLATION_SETTINGS.parsed },
    })
    const second = await createTranslation(project.id, {
      title: 'Second',
      subtitles: [],
      parsed: { ...DEFAULT_TRANSLATION_SETTINGS.parsed },
    })
    const secondSettingsId = second.settingsId
    await updateTranslation(second.id, { settingsId: first.settingsId })
    await db.settings.delete(secondSettingsId)
    await deleteTranslation(project.id, first.id)
    expect(await db.settings.get(first.settingsId)).toBeDefined()
    await deleteTranslation(project.id, second.id)
    expect(await db.settings.get(first.settingsId)).toBeUndefined()
  })

  test('deletes project-owned unified settings', async () => {
    const project = await createProject('Disposable Project')
    const ids = [project.defaultTranslationSettingsId, project.defaultExtractionSettingsId]
    await deleteProject(project.id)
    expect((await db.settings.bulkGet(ids)).every(item => item === undefined)).toBe(true)
  })

  test('inherits project settings for batch translation and extraction items', async () => {
    const project = await createProject('Batch Project', true)
    await updateSettings(project.defaultTranslationSettingsId, { sourceLanguage: 'Batch Source' })
    await updateSettings(project.defaultExtractionSettingsId, { customInstructions: 'Batch Extraction' })
    const translation = await useTranslationDataStore.getState().createTranslationDb(project.id, {
      title: 'Batch Translation',
      subtitles: [],
      parsed: { ...DEFAULT_TRANSLATION_SETTINGS.parsed },
    })
    const extraction = await useExtractionDataStore.getState().createExtractionDb(project.id, {
      title: 'Batch Extraction',
      episodeNumber: '1',
      subtitleContent: '',
      previousContext: '',
      contextResult: '',
    })
    expect((await getSettings(translation.settingsId))?.sourceLanguage).toBe('Batch Source')
    expect((await getSettings(extraction.settingsId))?.customInstructions).toBe('Batch Extraction')
  })

  test('inherits global settings when project defaults are disabled', async () => {
    const project = await createProject('Global Inheritance Project')
    await updateSettings(GLOBAL_TRANSLATION_SETTINGS_ID, { contextDocument: 'Global Translation' })
    await updateSettings(GLOBAL_EXTRACTION_SETTINGS_ID, { customInstructions: 'Global Extraction' })
    const translation = await useTranslationDataStore.getState().createTranslationDb(project.id, {
      title: 'Translation',
      subtitles: [],
      parsed: { ...DEFAULT_TRANSLATION_SETTINGS.parsed },
    })
    const extraction = await useExtractionDataStore.getState().createExtractionDb(project.id, {
      title: 'Extraction',
      episodeNumber: '1',
      subtitleContent: '',
      previousContext: '',
      contextResult: '',
    })
    expect((await getSettings(translation.settingsId))?.contextDocument).toBe('Global Translation')
    expect((await getSettings(extraction.settingsId))?.customInstructions).toBe('Global Extraction')
  })
})

describe('owned Auto Context extraction lifecycle', () => {
  test('deleting a Translation cascades only to its owned extraction', async () => {
    const project = await createProject('Cascade Project')
    const translation = await createTranslation(project.id, {
      title: 'Episode 1',
      subtitles: [],
      parsed: { ...DEFAULT_TRANSLATION_SETTINGS.parsed },
    })
    const owned = await createExtraction(project.id, {
      title: 'Auto Context for Episode 1',
      episodeNumber: '1',
      subtitleContent: 'subtitle',
      previousContext: '',
      contextResult: 'owned context',
      ownerTranslationId: translation.id,
    })
    const used = await createExtraction(project.id, {
      title: 'Manually used context',
      episodeNumber: '0',
      subtitleContent: 'subtitle',
      previousContext: '',
      contextResult: 'manual context',
    })
    await updateTranslation(translation.id, { autoContextExtractionId: used.id })

    const deletedIds = await deleteTranslation(project.id, translation.id)
    const updatedProject = await db.projects.get(project.id)

    expect(deletedIds).toEqual([owned.id])
    expect(await db.translations.get(translation.id)).toBeUndefined()
    expect(await db.extractions.get(owned.id)).toBeUndefined()
    expect(await db.extractions.get(used.id)).toBeDefined()
    expect(updatedProject?.extractions).toEqual([used.id])
    expect(await db.settings.get(owned.settingsId)).toBeUndefined()
    expect(await db.settings.get(used.settingsId)).toBeDefined()
  })

  test('moving a Translation moves only its owned extraction', async () => {
    const source = await createProject('Source Project')
    const target = await createProject('Target Project')
    const translation = await createTranslation(source.id, {
      title: 'Episode 2',
      subtitles: [],
      parsed: { ...DEFAULT_TRANSLATION_SETTINGS.parsed },
    })
    const owned = await createExtraction(source.id, {
      title: 'Auto Context for Episode 2',
      episodeNumber: '2',
      subtitleContent: 'subtitle',
      previousContext: '',
      contextResult: 'owned context',
      ownerTranslationId: translation.id,
    })
    const used = await createExtraction(source.id, {
      title: 'Independent context',
      episodeNumber: '1',
      subtitleContent: 'subtitle',
      previousContext: '',
      contextResult: 'manual context',
    })
    await updateTranslation(translation.id, { autoContextExtractionId: used.id })

    const movedIds = await moveTranslation(source.id, target.id, translation.id)
    const [updatedSource, updatedTarget, movedTranslation, movedOwned, unmovedUsed] = await Promise.all([
      db.projects.get(source.id),
      db.projects.get(target.id),
      db.translations.get(translation.id),
      db.extractions.get(owned.id),
      db.extractions.get(used.id),
    ])

    expect(movedIds).toEqual([owned.id])
    expect(updatedSource?.translations).not.toContain(translation.id)
    expect(updatedSource?.extractions).toEqual([used.id])
    expect(updatedTarget?.translations).toContain(translation.id)
    expect(updatedTarget?.extractions).toContain(owned.id)
    expect(movedTranslation?.projectId).toBe(target.id)
    expect(movedTranslation?.autoContextExtractionId).toBe(used.id)
    expect(movedOwned?.projectId).toBe(target.id)
    expect(unmovedUsed?.projectId).toBe(source.id)
  })
})
