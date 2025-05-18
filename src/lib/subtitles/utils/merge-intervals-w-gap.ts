export const mergeIntervalsWithGap = (
  intervals: [number, number][],
  maxAllowedGap: number
): [number, number][] => {
  if (!intervals || intervals.length === 0) {
    return []
  }

  // Assuming intervals are already sorted by start time in ascending order
  // const sortedIntervals = [...intervals].sort((a, b) => a[0] - b[0])
  const sortedIntervals = intervals

  const mergedIntervals: [number, number][] = []
  mergedIntervals.push([...sortedIntervals[0]])

  for (let i = 1; i < sortedIntervals.length; i++) {
    const currentInterval = sortedIntervals[i]
    const lastMergedInterval = mergedIntervals[mergedIntervals.length - 1]

    const gap = currentInterval[0] - lastMergedInterval[1]

    if (gap < maxAllowedGap) {
      lastMergedInterval[1] = Math.max(lastMergedInterval[1], currentInterval[1])
    } else {
      mergedIntervals.push([...currentInterval])
    }
  }

  return mergedIntervals
}
