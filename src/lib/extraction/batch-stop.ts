import { BatchFile } from "@/types/batch"

export function getRunningBatchExtractionIds(
  batchFiles: BatchFile[],
  runningIds: Set<string>,
): string[] {
  const batchIds = new Set(batchFiles.map(file => file.id))
  return Array.from(runningIds).filter(id => batchIds.has(id))
}
