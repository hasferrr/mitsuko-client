import { describe, expect, test } from "bun:test"
import { getUnparsedOutput } from "./ai-stream-output"

describe("getUnparsedOutput", () => {
  test("hides incomplete structured output behind the pending placeholder", () => {
    expect(getUnparsedOutput({
      output: `{"subtitles":[{"index":1`,
      isProcessing: true,
      isThinkingOnly: false,
      hasParsedStructuredOutput: false,
      pendingStructuredOutputPlaceholder: "Translation output will appear here...",
    })).toBe("Translation output will appear here...")
  })

  test("hides the placeholder while the model is only producing thinking content", () => {
    expect(getUnparsedOutput({
      output: "",
      isProcessing: true,
      isThinkingOnly: true,
      hasParsedStructuredOutput: false,
      pendingStructuredOutputPlaceholder: "Translation output will appear here...",
    })).toBe("")
  })

  test("shows malformed output after processing finishes", () => {
    const output = `{"subtitles":[{"index":1`

    expect(getUnparsedOutput({
      output,
      isProcessing: false,
      isThinkingOnly: false,
      hasParsedStructuredOutput: false,
      pendingStructuredOutputPlaceholder: "Translation output will appear here...",
    })).toBe(output)
  })

  test("preserves raw streaming output for callers without a placeholder", () => {
    const output = `{"subtitles":[{"index":1`

    expect(getUnparsedOutput({
      output,
      isProcessing: true,
      isThinkingOnly: false,
      hasParsedStructuredOutput: false,
    })).toBe(output)
  })

  test("does not render fallback output after a structured item is parsed", () => {
    expect(getUnparsedOutput({
      output: `{"subtitles":[{"index":1,"translated":"Hola"}`,
      isProcessing: true,
      isThinkingOnly: false,
      hasParsedStructuredOutput: true,
      pendingStructuredOutputPlaceholder: "Translation output will appear here...",
    })).toBe("")
  })
})
