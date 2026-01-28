import { memo, type ReactNode, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface VirtualizedRendererProps {
  index: number
  top: number
  setHeight: (index: number, height: number) => void
  children: ReactNode
  className?: string
  paddingBottom?: number
}

export const VirtualizedRenderer = memo(({
  index,
  top,
  setHeight,
  children,
  className,
  paddingBottom = 0,
}: VirtualizedRendererProps) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const next = Math.ceil(entry.contentRect.height)
      if (next > 0) setHeight(index, next + paddingBottom)
    })

    ro.observe(el)
    return () => {
      ro.disconnect()
    }
  }, [index, paddingBottom, setHeight])

  return (
    <div ref={ref} className={cn("absolute left-0 right-0", className)} style={{ top }}>
      {children}
    </div>
  )
})
