import { describe, it, expect } from "bun:test"
import { mergeIntervalsWithGap } from "./merge-intervals-w-gap"

describe("mergeIntervalsWithGap", () => {
  it("should return an empty array for empty input", () => {
    expect(mergeIntervalsWithGap([], 10)).toEqual([])
  })

  it("should return the same interval if only one is provided", () => {
    expect(mergeIntervalsWithGap([[1, 5]], 10)).toEqual([[1, 5]])
  })

  it("should not merge intervals if the gap is equal to maxAllowedGap", () => {
    const intervals: [number, number][] = [[1, 5], [15, 20]] // gap = 15 - 5 = 10
    expect(mergeIntervalsWithGap(intervals, 10)).toEqual([[1, 5], [15, 20]])
  })

  it("should not merge intervals if the gap is greater than maxAllowedGap", () => {
    const intervals: [number, number][] = [[1, 5], [16, 20]] // gap = 16 - 5 = 11
    expect(mergeIntervalsWithGap(intervals, 10)).toEqual([[1, 5], [16, 20]])
  })

  it("should merge intervals if the gap is less than maxAllowedGap", () => {
    const intervals: [number, number][] = [[1, 5], [7, 20]] // gap = 7 - 5 = 2
    expect(mergeIntervalsWithGap(intervals, 10)).toEqual([[1, 20]])
  })

  it("should merge multiple consecutive intervals if gaps are less than maxAllowedGap", () => {
    const intervals: [number, number][] = [[1, 5], [7, 10], [12, 20]] // gap1=2, gap2=2
    expect(mergeIntervalsWithGap(intervals, 10)).toEqual([[1, 20]])
  })

  it("should handle a mix of merging and non-merging", () => {
    const intervals: [number, number][] = [[1, 5], [7, 10], [25, 30], [32, 40]]
    // gap1 (7-5)=2 < 10 (merge) => [1, 10]
    // gap2 (25-10)=15 >= 10 (no merge) => [[1,10], [25,30]]
    // gap3 (32-30)=2 < 10 (merge) => [[1,10], [25,40]]
    expect(mergeIntervalsWithGap(intervals, 10)).toEqual([[1, 10], [25, 40]])
  })

  it("should merge intervals that touch (gap is 0)", () => {
    const intervals: [number, number][] = [[1, 5], [5, 10]] // gap = 5 - 5 = 0
    expect(mergeIntervalsWithGap(intervals, 10)).toEqual([[1, 10]])
  })

  it("should merge overlapping intervals (negative gap)", () => {
    const intervals: [number, number][] = [[1, 10], [5, 15]] // gap = 5 - 10 = -5
    expect(mergeIntervalsWithGap(intervals, 10)).toEqual([[1, 15]])
  })

  // As the input is already sorted, this test is not needed
  // it("should correctly merge with unsorted input due to internal sorting", () => {
  //   const intervals: [number, number][] = [[25, 30], [1, 5], [32, 40], [7, 10]]
  //   // sorted: [[1,5], [7,10], [25,30], [32,40]]
  //   // expected: [[1,10], [25,40]]
  //   expect(mergeIntervalsWithGap(intervals, 10)).toEqual([[1, 10], [25, 40]])
  // })

  it("should handle intervals where the second interval is completely within the first after a merge", () => {
    const intervals: [number, number][] = [[1, 20], [5, 10]] // gap = 5 - 20 = -15
    expect(mergeIntervalsWithGap(intervals, 10)).toEqual([[1, 20]])
  })

  it("should handle a large gap that prevents merging", () => {
    const intervals: [number, number][] = [[1, 5], [100, 105]]
    expect(mergeIntervalsWithGap(intervals, 10)).toEqual([[1, 5], [100, 105]])
  })

   it("should merge correctly when maxAllowedGap is 1", () => {
    const intervals: [number, number][] = [[1, 5], [6, 10], [12, 15]]
    // gap1 (6-5)=1, not < 1 (no merge)
    // gap2 (12-10)=2, not < 1 (no merge)
    expect(mergeIntervalsWithGap(intervals, 1)).toEqual([[1,5], [6,10], [12,15]])

    const intervals2: [number, number][] = [[1, 5], [5, 10]] // gap = 0 < 1 (merge)
    expect(mergeIntervalsWithGap(intervals2, 1)).toEqual([[1, 10]])
  })
})