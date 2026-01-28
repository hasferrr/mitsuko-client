import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState, type UIEvent } from "react"
import { VirtualizedRenderer } from "./virtualized-renderer"

interface VirtualizedListProps<T> {
  id?: string
  items: T[]
  viewportHeight?: number
  overscan?: number
  estimatedItemHeight?: number
  className?: string
  render: {
    key: (item: T) => string
    children: (item: T) => ReactNode
    className?: string
    paddingBottom?: number
  }
}

export function VirtualizedList<T>({
  id,
  items,
  viewportHeight = 510,
  overscan = 3,
  estimatedItemHeight = 180,
  className,
  render,
}: VirtualizedListProps<T>) {
  const [heights, setHeights] = useState<Record<number, number>>({})
  const [scrollTop, setScrollTop] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    setHeights({})
  }, [id, items.length])

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const nextTop = e.currentTarget.scrollTop
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(nextTop)
    })
  }, [])

  const setHeight = useCallback((index: number, height: number) => {
    setHeights((prev) => {
      const current = prev[index]
      if (current === height) return prev
      return { ...prev, [index]: height }
    })
  }, [])

  const offsets = useMemo(() => {
    const next: number[] = new Array(items.length + 1)
    next[0] = 0
    for (let i = 0; i < items.length; i++) {
      const h = heights[i] ?? estimatedItemHeight
      next[i + 1] = next[i] + h
    }
    return next
  }, [estimatedItemHeight, heights, items.length])

  const totalHeight = offsets[items.length] ?? 0

  const findIndexAtOffset = useCallback((value: number) => {
    let low = 0
    let high = offsets.length - 1
    while (low < high) {
      const mid = Math.floor((low + high + 1) / 2)
      if (offsets[mid] <= value) low = mid
      else high = mid - 1
    }
    return Math.min(items.length - 1, Math.max(0, low))
  }, [offsets, items.length])

  const range = useMemo(() => {
    if (items.length === 0) return { startIndex: 0, endIndex: 0 }

    const startRaw = findIndexAtOffset(scrollTop)
    const endRaw = findIndexAtOffset(scrollTop + viewportHeight)
    const startIndex = Math.max(0, startRaw - overscan)
    const endIndex = Math.min(items.length, endRaw + overscan + 1)
    return { startIndex, endIndex }
  }, [items.length, findIndexAtOffset, overscan, scrollTop, viewportHeight])

  return (
    <div className={className} onScroll={handleScroll}>
      <div className="relative" style={{ height: totalHeight }}>
        {items.slice(range.startIndex, range.endIndex).map((item, i) => {
          const absoluteIndex = range.startIndex + i
          return (
            <VirtualizedRenderer
              key={render.key(item)}
              index={absoluteIndex}
              top={offsets[absoluteIndex] ?? 0}
              setHeight={setHeight}
              paddingBottom={render.paddingBottom}
              className={render.className}
            >
              {render.children(item)}
            </VirtualizedRenderer>
          )
        })}
      </div>
    </div>
  )
}
