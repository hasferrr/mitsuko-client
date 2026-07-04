import { describe, expect, test } from 'bun:test'
import {
  normalizeAutoContextDefault,
  resolveNewTranslationAutoContextMode,
} from '@/lib/translation/auto-context-defaults'

describe('normalizeAutoContextDefault', () => {
  test('accepts only create-new as an enabled default', () => {
    expect(normalizeAutoContextDefault('create-new')).toBe('create-new')
    expect(normalizeAutoContextDefault('disabled')).toBe('disabled')
    expect(normalizeAutoContextDefault('use-existing')).toBe('disabled')
    expect(normalizeAutoContextDefault('invalid')).toBe('disabled')
    expect(normalizeAutoContextDefault(undefined)).toBe('disabled')
  })
})

describe('resolveNewTranslationAutoContextMode', () => {
  test('prefers an explicit mode for non-batch translations', () => {
    expect(resolveNewTranslationAutoContextMode({
      explicitMode: 'use-existing',
      isBatch: false,
      templateMode: 'create-new',
    })).toBe('use-existing')
  })

  test('inherits create-new from a valid template', () => {
    expect(resolveNewTranslationAutoContextMode({
      isBatch: false,
      templateMode: 'create-new',
    })).toBe('create-new')
  })

  test('falls back to disabled for missing and unsupported templates', () => {
    expect(resolveNewTranslationAutoContextMode({ isBatch: false, templateMode: undefined })).toBe('disabled')
    expect(resolveNewTranslationAutoContextMode({ isBatch: false, templateMode: 'use-existing' })).toBe('disabled')
  })

  test('forces batch translations to disabled', () => {
    expect(resolveNewTranslationAutoContextMode({
      explicitMode: 'create-new',
      isBatch: true,
      templateMode: 'create-new',
    })).toBe('disabled')
  })
})
