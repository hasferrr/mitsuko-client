import { BatchFile } from "@/types/batch"

export function getRestartBatchExtractionIds(
  batchFiles: BatchFile[],
  runningIds: Set<string>,
): string[] {
  return batchFiles
    .map(file => file.id)
    .filter(id => !runningIds.has(id))
}

export function getContinueBatchExtractionIds(
  batchFiles: BatchFile[],
  runningIds: Set<string>,
): string[] {
  return batchFiles
    .filter(file => file.status !== "done")
    .map(file => file.id)
    .filter(id => !runningIds.has(id))
}

export function getRunningBatchExtractionIds(
  batchFiles: BatchFile[],
  runningIds: Set<string>,
): string[] {
  const batchIds = new Set(batchFiles.map(file => file.id))
  return Array.from(runningIds).filter(id => batchIds.has(id))
}
