import { describe, expect, test } from "bun:test"
import { isRoutePrefetchDisabled } from "@/lib/route-prefetch-policy"

describe("isRoutePrefetchDisabled", () => {
  test("disables prefetch on the auth login route", () => {
    expect(isRoutePrefetchDisabled("/auth/login")).toBe(true)
  })

  test("keeps prefetch policy unchanged on other routes", () => {
    expect(isRoutePrefetchDisabled("/")).toBe(false)
    expect(isRoutePrefetchDisabled("/dashboard")).toBe(false)
    expect(isRoutePrefetchDisabled(null)).toBe(false)
  })
})
