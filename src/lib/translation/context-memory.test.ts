import { describe, expect, test } from 'bun:test'
import { determineContextStrategy } from '@/lib/translation/context-memory'

describe('determineContextStrategy', () => {
  test('full context overrides minimal mode', () => {
    expect(determineContextStrategy(true, true)).toBe('full')
    expect(determineContextStrategy(true, false)).toBe('full')
  })

  test('uses minimal context when enabled', () => {
    expect(determineContextStrategy(false, true)).toBe('minimal')
  })

  test('uses split context when minimal mode is disabled', () => {
    expect(determineContextStrategy(false, false)).toBe('split')
  })
})
