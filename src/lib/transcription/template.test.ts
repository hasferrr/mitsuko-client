import { describe, expect, test } from 'bun:test'
import { buildTranscriptionTemplate } from '@/lib/transcription/template'

describe('buildTranscriptionTemplate', () => {
  test('constructs a hidden transcription with empty operational data', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const template = buildTranscriptionTemplate({
      id: 'template-1',
      projectId: 'project-1',
      now,
    })

    expect(template).toEqual({
      id: 'template-1',
      projectId: 'project-1',
      title: '',
      transcriptionText: '',
      transcriptSubtitles: [],
      selectedMode: 'sentence',
      customInstructions: '',
      models: 'mitsuko-premium',
      language: 'auto',
      words: [],
      segments: [],
      selectedUploadId: null,
      createdAt: now,
      updatedAt: now,
    })
  })

  test('overrides settings without mutating empty operational data', () => {
    const template = buildTranscriptionTemplate({
      id: 'template-1',
      projectId: 'project-1',
      settings: {
        language: 'Japanese',
        selectedMode: 'clause',
        customInstructions: 'Use speaker labels',
        models: 'mitsuko-free',
      },
    })

    expect(template.language).toBe('Japanese')
    expect(template.selectedMode).toBe('clause')
    expect(template.customInstructions).toBe('Use speaker labels')
    expect(template.models).toBe('mitsuko-free')
    expect(template.transcriptionText).toBe('')
    expect(template.words).toEqual([])
  })
})
