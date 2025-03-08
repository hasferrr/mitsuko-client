import { describe, test, expect } from "bun:test"
import { parseSRT } from './parse'
import { Subtitle } from "@/types/types"

const expected: Subtitle[] = [
  {
    index: 1,
    timestamp: {
      start: { h: 0, m: 0, s: 16, ms: 50 },
      end: { h: 0, m: 0, s: 16, ms: 930 }
    },
    actor: '',
    content: 'おはよう',
  },
  {
    index: 2,
    timestamp: {
      start: { h: 0, m: 0, s: 17, ms: 550 },
      end: { h: 0, m: 0, s: 19, ms: 260 }
    },
    actor: '',
    content: 'おはようございます',
  },
  {
    index: 3,
    timestamp: {
      start: { h: 0, m: 0, s: 19, ms: 350 },
      end: { h: 0, m: 0, s: 21, ms: 350 }
    },
    actor: '',
    content: '相変わらず早起きだね',
  }
]

const copyExpect = () => JSON.parse(JSON.stringify(expected)) as Subtitle[]

describe('parseSRT', () => {
  test('empty string returns empty array', () => {
    expect(parseSRT('')).toEqual([])
  })

  test('well formatted srt parses correctly', () => {
    const srt = `
1
00:00:16,050 --> 00:00:16,930
おはよう

2
00:00:17,550 --> 00:00:19,260
おはようございます

3
00:00:19,350 --> 00:00:21,350
相変わらず早起きだね
`
    const result = parseSRT(srt)
    expect(result).toMatchObject(expected)
  })

  test('handles missing empty lines between blocks', () => {
    const srt = `
1
00:00:16,050 --> 00:00:16,930
おはよう
2
00:00:17,550 --> 00:00:19,260
おはようございます
3
00:00:19,350 --> 00:00:21,350
相変わらず早起きだね
`
    const result = parseSRT(srt)
    expect(result).toMatchObject(expected)
  })

  test('handles empty content blocks', () => {
    const srt = `
1
00:00:16,050 --> 00:00:16,930
おはよう
2
00:00:17,550 --> 00:00:19,260
3
00:00:19,350 --> 00:00:21,350
相変わらず早起きだね
`
    const result = parseSRT(srt)
    const exp = copyExpect()
    exp[1].content = ''
    expect(result).toMatchObject(exp)
  })

  test('handles non-sequential indexes', () => {
    const srt = `
1
00:00:16,050 --> 00:00:16,930
おはよう

5
00:00:17,550 --> 00:00:19,260
おはようございます

9
00:00:19,350 --> 00:00:21,350
相変わらず早起きだね
`
    const result = parseSRT(srt)
    expect(result).toMatchObject(expected)
  })

  test('handles no space timestamp arrows', () => {
    const srt = `
1
00:00:16,050-->00:00:16,930
おはよう
2
00:00:17,550-->00:00:19,260
おはようございます
3
00:00:19,350-->00:00:21,350
相変わらず早起きだね
`
    const result = parseSRT(srt)
    expect(result).toMatchObject(expected)
  })

  test('handles multiline and trailing spaces in content', () => {
    const srt = "   " + `
1
00:00:16,050 --> 00:00:16,930
おはよう


2
00:00:17,550 --> 00:00:19,260


おはよう

ございます

3
00:00:19,350 --> 00:00:21,350
相変
わらず早起


きだね
` + "   "
    const result = parseSRT(srt)
    const exp = copyExpect()
    exp[1].content = "おはよう\n\nございます"
    exp[2].content = "相変\nわらず早起\n\n\nきだね"
    expect(result).toMatchObject(exp)
  })

  test('handles multiline after index', () => {
    const srt = `
1
00:00:16,050 --> 00:00:16,930
おはよう

2
00:00:17,550 --> 00:00:19,260
おはようございます

3

00:00:19,350 --> 00:00:21,350

相変わらず早起きだね
`
    const result = parseSRT(srt)
    expect(result).toMatchObject(expected)
  })
})
