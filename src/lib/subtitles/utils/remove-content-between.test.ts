import { test, expect, describe } from "bun:test"
import { removeContentBetween } from "./remove-content-between"
import type { SubtitleTranslated } from "@/types/subtitles"

describe("removeContentBetween", () => {
  const createSubtitle = (text: string): SubtitleTranslated => {
    const subtitleBase: Omit<SubtitleTranslated, "content" | "translated"> = {
      index: 1,
      timestamp: {
        start: { h: 0, m: 0, s: 0, ms: 0 },
        end: { h: 0, m: 0, s: 0, ms: 0 }
      },
      actor: "",
    }
    return {
      ...subtitleBase,
      content: text,
      translated: "",
    }
  }

  // Tests with empty input string
  test("should return empty for empty input string", () => {
    const subtitles = [createSubtitle("")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("")
  })

  test("should handle multiple spaces correctly", () => {
    const subtitles = [createSubtitle("   ")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("")
  })

  test("should handle multiple newlines correctly", () => {
    const subtitles = [createSubtitle("\n\n\n")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("")
  })

  test("should handle multiple newlines and spaces around content", () => {
    const subtitles = [createSubtitle("\n\nHello\n   ")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("Hello")
  })

  // Tests with simple delimiters
  test("should return original string if no delimiters are found", () => {
    const subtitles = [createSubtitle("Hello world")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("Hello world")
  })

  test("should remove content between simple delimiters", () => {
    const subtitles = [createSubtitle("Hello {to be removed} world")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("Hello world")
  })

  test("should handle unclosed delimiters", () => {
    const subtitles = [createSubtitle("Hello {unclosed world")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("Hello {unclosed world")
  })

  test("should handle unopened delimiters", () => {
    const subtitles = [createSubtitle("Hello }unopened} world")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("Hello }unopened} world")
  })

  test("should handle nested delimiters", () => {
    const subtitles = [createSubtitle("Hello {outer {inner} content} world")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("Hello world")
  })

  test("should handle multiple delimited sections with spaces", () => {
    const subtitles = [createSubtitle("First  {remove1}  Second  {remove2}  Third")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("First Second Third")
  })

  test("should handle complex string with all cases", () => {
    const subtitles = [createSubtitle("Start {nested {inner} content} middle {unclosed end {another} world")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("Start middle world")
  })

  test("should handle multiple opening delimiters", () => {
    const subtitles = [createSubtitle("{{{he}  llo")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("llo")
  })

  test("should handle delimiter at beginning of string", () => {
    const subtitles = [createSubtitle("{remove this} keep this")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("keep this")
  })

  test("should handle delimiter at end of string", () => {
    const subtitles = [createSubtitle("keep this {remove this}")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("keep this")
  })

  test("should handle delimiter in middle of string", () => {
    const subtitles = [createSubtitle("keep this {remove this} keep this")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("keep this keep this")
  })

  test("should handle delimiter at beginning and end of string", () => {
    const subtitles = [createSubtitle("{remove this}")]
    const result = removeContentBetween(subtitles, "content", "{", "}")
    expect(result[0].content).toBe("")
  })

  // Tests with multi-character delimiters
  test("should return empty for empty input string with multi-char delimiters", () => {
    const subtitles = [createSubtitle("")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("")
  })

  test("should handle multiple spaces correctly with multi-char delimiters", () => {
    const subtitles = [createSubtitle("   ")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("")
  })

  test("should return original string if no delimiters are found with multi-char delimiters", () => {
    const subtitles = [createSubtitle("Hello world")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("Hello world")
  })

  test("should remove content between simple delimiters with multi-char delimiters", () => {
    const subtitles = [createSubtitle("Hello <!--to be removed--> world")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("Hello world")
  })

  test("should handle unclosed delimiters with multi-char delimiters", () => {
    const subtitles = [createSubtitle("Hello <!--unclosed world")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("Hello <!--unclosed world")
  })

  test("should handle unopened delimiters with multi-char delimiters", () => {
    const subtitles = [createSubtitle("Hello -->unopened--> world")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("Hello -->unopened--> world")
  })

  test("should handle nested delimiters with multi-char delimiters", () => {
    const subtitles = [createSubtitle("Hello <!--outer <!--inner--> content--> world")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("Hello world")
  })

  test("should handle multiple delimited sections with spaces with multi-char delimiters", () => {
    const subtitles = [createSubtitle("First  <!--remove1-->  Second  <!--remove2-->  Third")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("First Second Third")
  })

  test("should handle complex string with all cases with multi-char delimiters", () => {
    const subtitles = [createSubtitle("Start <!--nested <!--inner--> content--> middle <!--unclosed end <!--another--> world")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("Start middle world")
  })

  test("should handle multiple opening delimiters with multi-char delimiters", () => {
    const subtitles = [createSubtitle("<!--<!--<!--he-->  llo")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("llo")
  })

  test("should handle multi-char delimiter at beginning of string", () => {
    const subtitles = [createSubtitle("<!--remove this--> keep this")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("keep this")
  })

  test("should handle multi-char delimiter at end of string", () => {
    const subtitles = [createSubtitle("keep this <!--remove this-->")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("keep this")
  })

  test("should handle multi-char delimiter in middle of string", () => {
    const subtitles = [createSubtitle("keep this <!--remove this--> keep this")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("keep this keep this")
  })

  test("should handle multi-char delimiter at beginning and end of string", () => {
    const subtitles = [createSubtitle("<!--remove this-->")]
    const result = removeContentBetween(subtitles, "content", "<!--", "-->")
    expect(result[0].content).toBe("")
  })

  test("should handle single-char delimiter with newlines at start and end", () => {
    const subtitles = [createSubtitle("\n<remove this>\n")]
    const result = removeContentBetween(subtitles, "content", "<", ">")
    expect(result[0].content).toBe("")
  })

  test("should handle single-char delimiter with newline before content", () => {
    const subtitles = [createSubtitle("keep this\n<remove this>")]
    const result = removeContentBetween(subtitles, "content", "<", ">")
    expect(result[0].content).toBe("keep this")
  })

  test("should handle single-char delimiter with newlines between content", () => {
    const subtitles = [createSubtitle("keep this\n<remove this>\nkeep this")]
    const result = removeContentBetween(subtitles, "content", "<", ">")
    expect(result[0].content).toBe("keep this\nkeep this")
  })

  test("should handle single-char delimiter with newline before content and space after", () => {
    const subtitles = [createSubtitle("keep this\n<remove this> keep this")]
    const result = removeContentBetween(subtitles, "content", "<", ">")
    expect(result[0].content).toBe("keep this\n keep this")
  })
})
