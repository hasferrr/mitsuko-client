import { test, expect, describe } from "bun:test"
import { keepOnlyWrapped, removeWrapped, cleanUpJsonResponse } from "@/lib/parser/cleaner"

describe("keepOnlyWrapped", () => {
  test("extracts content between wrappers", () => {
    const input = "prefix ```json\n{\"test\":1}\n``` suffix"
    const result = keepOnlyWrapped(input, "```json", "```")
    expect(result).toBe("```json\n{\"test\":1}\n```")
  })

  test("returns empty string if start tag not found", () => {
    const result = keepOnlyWrapped("no tags here", "```json", "```")
    expect(result).toBe("")
  })

  test("returns empty string if end tag not found", () => {
    const result = keepOnlyWrapped("```json but no end", "```json", "```")
    expect(result).toBe("")
  })
})

describe("removeWrapped", () => {
  test("removes wrapped content including tags", () => {
    const input = "before <error>error message</error> after"
    const result = removeWrapped(input, "<error>", "</error>")
    expect(result).toBe("before  after")
  })

  test("returns original string if start tag not found", () => {
    const result = removeWrapped("no error tags", "<error>", "</error>")
    expect(result).toBe("no error tags")
  })

  test("returns original string if end tag not found", () => {
    const result = removeWrapped("<error>unclosed error", "<error>", "</error>")
    expect(result).toBe("<error>unclosed error")
  })
})

describe("cleanUpJsonResponse", () => {
  describe("error tag handling", () => {
    test("removes error tag from response", () => {
      const input = `{"subtitles":[{"index":1,"content":"hello","translated":"hallo"}]}

<error>[An error occurred: Something went wrong]</error>`
      const result = cleanUpJsonResponse(input)
      expect(result).not.toContain("<error>")
      expect(result).not.toContain("</error>")
      expect(result).toContain("\"subtitles\"")
    })

    test("removes error tag with JSON content inside", () => {
      const input = `{"subtitles":[{"index":1,"content":"hello","translated":"hallo"}]}

<error>[Stream error occurred: {"error":{"code":429,"message":"Resource exhausted"}}]</error>`
      const result = cleanUpJsonResponse(input)
      expect(result).not.toContain("<error>")
      expect(result).not.toContain("</error>")
      expect(result).not.toContain("Stream error")
    })

    test("removes first error tag from response", () => {
      const input = `<error>[First error]</error>{"subtitles":[]}`
      const result = cleanUpJsonResponse(input)
      expect(result).not.toContain("<error>")
      expect(result).not.toContain("[First error]")
    })

    test("handles error tag before JSON", () => {
      const input = `<error>[Generation stopped by user]</error>

{"subtitles":[{"index":1,"content":"test","translated":"uji"}]}`
      const result = cleanUpJsonResponse(input)
      expect(result).not.toContain("<error>")
      expect(result).toContain("\"subtitles\"")
    })

    test("handles error tag with multiline content", () => {
      const input = `{"subtitles":[{"index":1,"content":"test","translated":"uji"}]}

<error>[An error occurred: 
Multiple line error
with details]</error>`
      const result = cleanUpJsonResponse(input)
      expect(result).not.toContain("<error>")
      expect(result).not.toContain("Multiple line error")
    })
  })

  describe("think tag handling", () => {
    test("removes think tags from response", () => {
      const input = `Some thinking content
{"subtitles":[{"index":1,"content":"hello","translated":"hallo"}]}`
      const result = cleanUpJsonResponse(input)
      expect(result).toContain("\"subtitles\"")
    })
  })

  describe("json code block handling", () => {
    test("extracts JSON from ```json code block", () => {
      const input = `\`\`\`json
{"subtitles":[{"index":1,"content":"hello","translated":"hallo"}]}
\`\`\``
      const result = cleanUpJsonResponse(input)
      expect(result.trim()).toBe(`{"subtitles":[{"index":1,"content":"hello","translated":"hallo"}]}`)
    })

    test("extracts JSON from ``` code block without json prefix", () => {
      const input = `\`\`\`
{"subtitles":[{"index":1,"content":"hello","translated":"hallo"}]}
\`\`\``
      const result = cleanUpJsonResponse(input)
      expect(result.trim()).toBe(`{"subtitles":[{"index":1,"content":"hello","translated":"hallo"}]}`)
    })
  })

  describe("combined scenarios", () => {
    test("handles error tag with think block and JSON", () => {
      const input = `Thinking process here
{"subtitles":[{"index":1,"content":"test","translated":"uji"}]}

<error>[Failed to parse]</error>`
      const result = cleanUpJsonResponse(input)
      expect(result).not.toContain("<error>")
      expect(result).not.toContain("[Failed to parse]")
    })
  })
})