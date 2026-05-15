import { describe, expect, test } from "bun:test"
import {
  getContinueBatchExtractionIds,
  getRestartBatchExtractionIds,
  getRunningBatchExtractionIds,
} from "@/lib/extraction/batch-ids"
import { BatchFile } from "@/types/batch"

const batchFile = (id: string, status: BatchFile["status"]): BatchFile => ({
  id,
  status,
  progress: 0,
  title: id,
  description: id,
  subtitlesCount: 0,
  translatedCount: 0,
  type: "txt",
})

describe("batch extraction id selection", () => {
  test("restart includes completed files and skips only currently running files", () => {
    const files = [
      batchFile("done-in-batch", "done"),
      batchFile("partial-in-batch", "partial"),
      batchFile("pending-in-batch", "pending"),
      batchFile("running-in-batch", "processing"),
    ]

    expect(getRestartBatchExtractionIds(
      files,
      new Set(["running-in-batch", "running-outside-batch"]),
    )).toEqual(["done-in-batch", "partial-in-batch", "pending-in-batch"])
  })

  test("continue skips completed files and currently running files", () => {
    const files = [
      batchFile("done-in-batch", "done"),
      batchFile("partial-in-batch", "partial"),
      batchFile("pending-in-batch", "pending"),
      batchFile("running-in-batch", "processing"),
    ]

    expect(getContinueBatchExtractionIds(
      files,
      new Set(["running-in-batch", "running-outside-batch"]),
    )).toEqual(["partial-in-batch", "pending-in-batch"])
  })

  test("stop returns only running ids from the current batch", () => {
    const files = [
      batchFile("running-in-batch", "processing"),
      batchFile("queued-in-batch", "queued"),
      batchFile("pending-in-batch", "pending"),
    ]

    expect(getRunningBatchExtractionIds(
      files,
      new Set(["running-in-batch", "running-outside-batch"]),
    )).toEqual(["running-in-batch"])
  })

  test("stop does not include queued or pending ids unless they are actually running", () => {
    const files = [
      batchFile("queued-in-batch", "queued"),
      batchFile("pending-in-batch", "pending"),
    ]

    expect(getRunningBatchExtractionIds(files, new Set())).toEqual([])
  })
})
