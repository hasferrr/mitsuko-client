import { memo, useCallback, useEffect, useMemo, useRef, useState, type UIEvent } from "react"
import { SubtitleCard } from "./subtitle-card"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import type { SubtitleTranslated } from "@/types/subtitles"

interface SubtitleListProps {
  hidden?: boolean
  translationId?: string
}

export const SubtitleList = memo(({
  hidden = false,
  translationId,
}: SubtitleListProps) => {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const idToUse = translationId ?? currentId
  const subtitles = useTranslationDataStore((state) => {
    if (!idToUse) return [] as SubtitleTranslated[]
    return state.data[idToUse]?.subtitles ?? ([] as SubtitleTranslated[])
  })

  const isSubtitlePerformanceModeEnabled = useLocalSettingsStore((state) => state.isSubtitlePerformanceModeEnabled)

  const viewportHeight = 510
  const overscan = 3

  const estimatedItemHeight = 180
  const [heights, setHeights] = useState<Record<number, number>>({})

  useEffect(() => {
    setHeights({})
  }, [idToUse, subtitles.length])

  const [scrollTop, setScrollTop] = useState(0)
  const rafRef = useRef<number | null>(null)

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
    const next: number[] = new Array(subtitles.length + 1)
    next[0] = 0
    for (let i = 0; i < subtitles.length; i++) {
      const h = heights[i] ?? estimatedItemHeight
      next[i + 1] = next[i] + h
    }
    return next
  }, [estimatedItemHeight, heights, subtitles.length])

  const totalHeight = offsets[subtitles.length] ?? 0

  const findIndexAtOffset = useCallback((value: number) => {
    let low = 0
    let high = offsets.length - 1
    while (low < high) {
      const mid = Math.floor((low + high + 1) / 2)
      if (offsets[mid] <= value) low = mid
      else high = mid - 1
    }
    return Math.min(subtitles.length - 1, Math.max(0, low))
  }, [offsets, subtitles.length])

  const range = useMemo(() => {
    if (subtitles.length === 0) return { startIndex: 0, endIndex: 0 }

    const startRaw = findIndexAtOffset(scrollTop)
    const endRaw = findIndexAtOffset(scrollTop + viewportHeight)
    const startIndex = Math.max(0, startRaw - overscan)
    const endIndex = Math.min(subtitles.length, endRaw + overscan + 1)
    return { startIndex, endIndex }
  }, [findIndexAtOffset, scrollTop, subtitles.length, viewportHeight])

  if (hidden) {
    return (
      <div className="h-[510px] text-center flex items-center justify-center border rounded-md border-dashed p-4 text-muted-foreground">
        Subtitles hidden to improve performance
        <br />
        Click "Show" to view
      </div>
    )
  }

   if (!isSubtitlePerformanceModeEnabled) {
    return (
      <div className="h-[510px] pr-4 overflow-y-auto">
        <div className="space-y-4">
          {subtitles.map((subtitle) => (
            <SubtitleCard key={`sub-${subtitle.index}`} subtitle={subtitle} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[510px] pr-4 overflow-y-auto" onScroll={handleScroll}>
      <div className="relative" style={{ height: totalHeight }}>
        {subtitles.slice(range.startIndex, range.endIndex).map((subtitle, idx) => {
          const absoluteIndex = range.startIndex + idx
          return (
            <SubtitleRow
              key={`sub-${subtitle.index}`}
              index={absoluteIndex}
              top={offsets[absoluteIndex] ?? 0}
              subtitle={subtitle}
              setHeight={setHeight}
            />
          )
        })}
      </div>
    </div>
  )
})

interface SubtitleRowProps {
  index: number
  top: number
  subtitle: SubtitleTranslated
  setHeight: (index: number, height: number) => void
}

const SubtitleRow = memo(({
  index,
  top,
  subtitle,
  setHeight,
}: SubtitleRowProps) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const next = Math.ceil(entry.contentRect.height)
      if (next > 0) setHeight(index, next + 16)
    })

    ro.observe(el)
    return () => {
      ro.disconnect()
    }
  }, [index, setHeight])

  return (
    <div ref={ref} className="absolute left-0 right-0 pb-4" style={{ top }}>
      <SubtitleCard subtitle={subtitle} />
    </div>
  )
})
