import { describe, expect, test } from "bun:test"
import { getRunningBatchExtractionIds } from "@/lib/extraction/batch-stop"
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

describe("getRunningBatchExtractionIds", () => {
  test("returns only running ids from the current batch", () => {
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

  test("does not include queued or pending ids unless they are actually running", () => {
    const files = [
      batchFile("queued-in-batch", "queued"),
      batchFile("pending-in-batch", "pending"),
    ]

    expect(getRunningBatchExtractionIds(files, new Set())).toEqual([])
  })
})
