import { describe, expect, test } from 'bun:test'
import { buildTranslationTemplate } from '@/lib/translation/template'

describe('buildTranslationTemplate', () => {
  test('constructs a hidden disabled translation with empty operational data', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const template = buildTranslationTemplate({
      id: 'template-1',
      projectId: 'project-1',
      settingsId: 'settings-1',
      now,
    })

    expect(template).toEqual({
      id: 'template-1',
      projectId: 'project-1',
      title: '',
      subtitles: [],
      parsed: { type: 'srt', data: null },
      settingsId: 'settings-1',
      autoContextMode: 'disabled',
      autoContextExtractionId: null,
      autoContextPreviousMode: 'latest',
      autoContextPreviousExtractionId: null,
      response: { response: '', jsonResponse: [] },
      createdAt: now,
      updatedAt: now,
    })
  })

  test('normalizes unsupported default modes', () => {
    const template = buildTranslationTemplate({
      id: 'template-1',
      projectId: 'project-1',
      settingsId: 'settings-1',
      autoContextMode: 'use-existing',
    })

    expect(template.autoContextMode).toBe('disabled')
  })
})
