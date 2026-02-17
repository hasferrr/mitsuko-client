import { test, expect, describe } from "bun:test"
import { parseMitsukoTranscription, leadingTextExtractor, parseTranslationJson, parseTranslationJsonWithContent } from "@/lib/parser/parser"

describe("parseMitsukoTranscription", () => {
  describe("without timeFormatter", () => {
    test("parses basic transcription with hh:mm:ss,ms format", () => {
      const input = `
00:00:01,000 --> 00:00:03,500
Hello, world!
00:00:04,000 --> 00:00:06,500
This is a test.
`
      const result = parseMitsukoTranscription(input)
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        index: 1,
        timestamp: {
          start: { h: 0, m: 0, s: 1, ms: 0 },
          end: { h: 0, m: 0, s: 3, ms: 500 },
        },
        content: "Hello, world!",
      })
      expect(result[1]).toMatchObject({
        index: 2,
        timestamp: {
          start: { h: 0, m: 0, s: 4, ms: 0 },
          end: { h: 0, m: 0, s: 6, ms: 500 },
        },
        content: "This is a test.",
      })
    })

    test("parses transcription with mm:ss,ms format", () => {
      const input = `
01:30,500 --> 01:35,000
Short format test
02:00,000 --> 02:05,500
Another line
`
      const result = parseMitsukoTranscription(input)
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        index: 1,
        timestamp: {
          start: { h: 0, m: 1, s: 30, ms: 500 },
          end: { h: 0, m: 1, s: 35, ms: 0 },
        },
        content: "Short format test",
      })
      expect(result[1]).toMatchObject({
        index: 2,
        timestamp: {
          start: { h: 0, m: 2, s: 0, ms: 0 },
          end: { h: 0, m: 2, s: 5, ms: 500 },
        },
        content: "Another line",
      })
    })

    test("parses transcription wrapped in <think> tags", () => {
      const input = `<think>
Some thinking content here
</think>
00:00:00,000 --> 00:00:02,000
After think content
`
      const result = parseMitsukoTranscription(input)
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        index: 1,
        timestamp: {
          start: { h: 0, m: 0, s: 0, ms: 0 },
          end: { h: 0, m: 0, s: 2, ms: 0 },
        },
        content: "After think content",
      })
    })

    test("parses transcription wrapped in code blocks", () => {
      const input = `\`\`\`
00:00:01,000 --> 00:00:03,000
Code block content
\`\`\``
      const result = parseMitsukoTranscription(input)
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        index: 1,
        timestamp: {
          start: { h: 0, m: 0, s: 1, ms: 0 },
          end: { h: 0, m: 0, s: 3, ms: 0 },
        },
        content: "Code block content",
      })
    })

    test("parses transcription with multiline content", () => {
      const input = `
00:00:01,000 --> 00:00:05,000
First line
Second line of same subtitle
00:00:06,000 --> 00:00:10,000
Next subtitle
`
      const result = parseMitsukoTranscription(input)
      expect(result).toHaveLength(2)
      expect(result[0].content).toBe("First line\nSecond line of same subtitle")
      expect(result[1].content).toBe("Next subtitle")
    })

    test("handles mixed hh:mm:ss and mm:ss formats", () => {
      const input = `
00:01:00,000 --> 00:01:05,000
Full format
02:00,000 --> 02:05,000
Short format
`
      const result = parseMitsukoTranscription(input)
      expect(result).toHaveLength(2)
      expect(result[0].timestamp.start).toEqual({ h: 0, m: 1, s: 0, ms: 0 })
      expect(result[1].timestamp.start).toEqual({ h: 0, m: 2, s: 0, ms: 0 })
    })

    test("throws on invalid time format", () => {
      const input = `
invalid --> 00:00:05,000
Some content
`
      expect(() => parseMitsukoTranscription(input)).toThrow("Invalid time format in transcription text")
    })

    test("parses transcription with hours", () => {
      const input = `
01:30:00,000 --> 01:30:05,000
One and a half hours in
`
      const result = parseMitsukoTranscription(input)
      expect(result).toHaveLength(1)
      expect(result[0].timestamp.start).toEqual({ h: 1, m: 30, s: 0, ms: 0 })
      expect(result[0].timestamp.end).toEqual({ h: 1, m: 30, s: 5, ms: 0 })
    })
  })

  describe("with timeFormatter (leadingTextExtractor)", () => {
    test("extracts timestamp from leading text and appends it to previous subtitle", () => {
      const input = `
00:02,100 --> 00:04,000
hello
some text - 00:42,849 --> 00:45,500
Content after leading text
`
      const result = parseMitsukoTranscription(input, leadingTextExtractor)
      expect(result).toHaveLength(2)
      // Leading text "some text -" is appended to the previous subtitle's content
      expect(result[0].content).toBe("hello\nsome text -")
      expect(result[1]).toMatchObject({
        index: 2,
        timestamp: {
          start: { h: 0, m: 0, s: 42, ms: 849 },
          end: { h: 0, m: 0, s: 45, ms: 500 },
        },
        content: "Content after leading text",
      })
    })

    test("extracts timestamp from trailing text", () => {
      const input = `
01:42,849 --> 01:45,500 garbage
Clean content
`
      const result = parseMitsukoTranscription(input, leadingTextExtractor)
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        index: 1,
        timestamp: {
          start: { h: 0, m: 1, s: 42, ms: 849 },
          end: { h: 0, m: 1, s: 45, ms: 500 },
        },
        content: "Clean content",
      })
    })

    test("handles both leading and trailing text", () => {
      const input = `
00:01,000 --> 00:02,000
First line
leading text 02:00,000 --> 02:05,000 trailing text
Actual content
`
      const result = parseMitsukoTranscription(input, leadingTextExtractor)
      expect(result).toHaveLength(2)
      // Leading text is appended to the previous subtitle's content
      expect(result[0].content).toBe("First line\nleading text")
      expect(result[1]).toMatchObject({
        index: 2,
        timestamp: {
          start: { h: 0, m: 2, s: 0, ms: 0 },
          end: { h: 0, m: 2, s: 5, ms: 0 },
        },
        content: "Actual content",
      })
    })

    test("handles multiple entries with leading text", () => {
      const input = `
00:01,000 --> 00:05,000
Intro
leading1 00:10,000 --> 00:15,000
First content
leading2 00:20,000 --> 00:25,000
Second content
`
      const result = parseMitsukoTranscription(input, leadingTextExtractor)
      expect(result).toHaveLength(3)
      // Leading text is appended to the previous subtitle
      expect(result[0].content).toBe("Intro\nleading1")
      expect(result[1].content).toBe("First content\nleading2")
      expect(result[2].content).toBe("Second content")
    })

    test("handles clean input without modifications", () => {
      const input = `
00:00:01,000 --> 00:00:03,500
Clean subtitle
00:00:04,000 --> 00:00:06,500
Another clean one
`
      const result = parseMitsukoTranscription(input, leadingTextExtractor)
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        index: 1,
        timestamp: {
          start: { h: 0, m: 0, s: 1, ms: 0 },
          end: { h: 0, m: 0, s: 3, ms: 500 },
        },
        content: "Clean subtitle",
      })
      expect(result[1]).toMatchObject({
        index: 2,
        timestamp: {
          start: { h: 0, m: 0, s: 4, ms: 0 },
          end: { h: 0, m: 0, s: 6, ms: 500 },
        },
        content: "Another clean one",
      })
    })
  })

  describe("with custom timeFormatter", () => {
    test("uses custom formatter to transform timestamps", () => {
      const customFormatter = ({ start, end }: { start: string; end: string }) => {
        // Add 1 hour offset for testing
        return [`01:${start}`, `01:${end}`] as [string, string]
      }

      const input = `
00:01,000 --> 00:03,000
Custom formatted
`
      const result = parseMitsukoTranscription(input, customFormatter)
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        index: 1,
        timestamp: {
          start: { h: 1, m: 0, s: 1, ms: 0 },
          end: { h: 1, m: 0, s: 3, ms: 0 },
        },
        content: "Custom formatted",
      })
    })
  })
})

describe("parseTranslationJson", () => {
  test("parses valid JSON with subtitles array", () => {
    const input = `{"subtitles":[{"index":1,"translated":"hallo"},{"index":2,"translated":"welt"}]}`
    const result = parseTranslationJson(input)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ index: 1, translated: "hallo" })
    expect(result[1]).toEqual({ index: 2, translated: "welt" })
  })

  test("parses JSON wrapped in code block", () => {
    const input = `\`\`\`json
{"subtitles":[{"index":1,"translated":"test"}]}
\`\`\``
    const result = parseTranslationJson(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ index: 1, translated: "test" })
  })

  test("strips error tag before parsing", () => {
    const input = `{"subtitles":[{"index":1,"translated":"hello"}]}

<error>[An error occurred: Something went wrong]</error>`
    const result = parseTranslationJson(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ index: 1, translated: "hello" })
  })

  test("handles stream error with JSON content", () => {
    const input = `{"subtitles":[{"index":401,"translated":"Tivoli's"}]}

<error>[Stream error occurred: {"error":{"code":429,"message":"Resource exhausted"}}]</error>`
    const result = parseTranslationJson(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ index: 401, translated: "Tivoli's" })
  })

  test("handles empty translated field", () => {
    const input = `{"subtitles":[{"index":1,"translated":""}]}`
    const result = parseTranslationJson(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ index: 1, translated: "" })
  })
})

describe("parseTranslationJsonWithContent", () => {
  test("parses valid JSON with content and translated fields", () => {
    const input = `{"subtitles":[{"index":1,"content":"hello","translated":"hallo"}]}`
    const result = parseTranslationJsonWithContent(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ index: 1, content: "hello", translated: "hallo" })
  })

  test("strips error tag before parsing", () => {
    const input = `{"subtitles":[{"index":1,"content":"test","translated":"uji"}]}

<error>[Generation stopped by user]</error>`
    const result = parseTranslationJsonWithContent(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ index: 1, content: "test", translated: "uji" })
  })

  test("handles missing translated field", () => {
    const input = `{"subtitles":[{"index":1,"content":"hello"}]}`
    const result = parseTranslationJsonWithContent(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ index: 1, content: "hello", translated: "" })
  })

  test("handles missing content field", () => {
    const input = `{"subtitles":[{"index":1,"translated":"hallo"}]}`
    const result = parseTranslationJsonWithContent(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ index: 1, content: "", translated: "hallo" })
  })
})
