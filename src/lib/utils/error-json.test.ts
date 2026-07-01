import { test, expect, describe } from "bun:test"
import { extractErrorJson } from "@/lib/utils/error-json"

describe("extractErrorJson", () => {
  test("returns null when there is no JSON", () => {
    expect(extractErrorJson("An error occurred: Something went wrong")).toBeNull()
    expect(extractErrorJson("[Generation stopped by user]")).toBeNull()
    expect(extractErrorJson("")).toBeNull()
  })

  test("extracts a plain JSON object", () => {
    const result = extractErrorJson('{"error":{"code":429,"message":"Resource exhausted"}}')
    expect(result).not.toBeNull()
    expect(result!.prefix).toBe("")
    expect(result!.json).toEqual({ error: { code: 429, message: "Resource exhausted" } })
  })

  test("extracts JSON wrapped in error brackets with a prefix", () => {
    const result = extractErrorJson('[An error occurred: Request failed (500), {"error":{"code":429,"message":"Resource exhausted"}}]')
    expect(result).not.toBeNull()
    expect(result!.prefix).toBe("An error occurred: Request failed (500)")
    expect(result!.json).toEqual({ error: { code: 429, message: "Resource exhausted" } })
  })

  test("strips the wrapper bracket and trailing punctuation from the prefix", () => {
    const result = extractErrorJson('[Stream error occurred: {"error":{"code":429}}]')
    expect(result).not.toBeNull()
    expect(result!.prefix).toBe("Stream error occurred")
    expect(result!.json).toEqual({ error: { code: 429 } })
  })

  test("extracts a JSON array", () => {
    const result = extractErrorJson('Errors: [{"code":1},{"code":2}]')
    expect(result).not.toBeNull()
    expect(result!.prefix).toBe("Errors")
    expect(result!.json).toEqual([{ code: 1 }, { code: 2 }])
  })

  test("skips an unbalanced brace and finds the next valid JSON", () => {
    const result = extractErrorJson('Bad {invalid and broken then {"ok":true}')
    expect(result).not.toBeNull()
    expect(result!.json).toEqual({ ok: true })
  })

  test("handles JSON containing braces inside string values", () => {
    const result = extractErrorJson('Fail: {"message":"a } b { c","code":1}')
    expect(result).not.toBeNull()
    expect(result!.prefix).toBe("Fail")
    expect(result!.json).toEqual({ message: "a } b { c", code: 1 })
  })

  test("handles nested objects and arrays", () => {
    const result = extractErrorJson('{"errors":[{"id":"x"}],"status":"failed"}')
    expect(result).not.toBeNull()
    expect(result!.json).toEqual({ errors: [{ id: "x" }], status: "failed" })
  })

  test("returns null for unbalanced JSON only", () => {
    expect(extractErrorJson('{"broken":')).toBeNull()
    expect(extractErrorJson("[1, 2,")).toBeNull()
  })
})
