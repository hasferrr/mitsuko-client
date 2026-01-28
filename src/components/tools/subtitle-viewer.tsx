"use client"

import { useEffect, useRef } from "react"
import hljs from 'highlight.js/lib/core'
import ass from 'highlightjs-ass'
import type { SubtitleEvent } from "@/types/subtitles"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { VirtualizedList } from "@/components/ui-custom/virtualized-list"

interface SubtitleViewerProps {
  fileName: string
  subtitleEvents: SubtitleEvent[]
  enableHighlight: boolean
  setEnableHighlight: (value: boolean) => void
  calculateCPS: (event: SubtitleEvent) => number
}

export default function SubtitleViewer({
  fileName,
  subtitleEvents,
  enableHighlight,
  setEnableHighlight,
  calculateCPS,
}: SubtitleViewerProps) {
  const highlightInitialized = useRef(false)

  useEffect(() => {
    if (!highlightInitialized.current) {
      hljs.registerLanguage('ass', ass)
      highlightInitialized.current = true
    }
  }, [])

  const highlightText = (text: string) => {
    try {
      const highlighted = hljs.highlight(text, { language: 'ass' })
      return highlighted.value
    } catch {
      return text
    }
  }

  return (
    <div>
      <div className="flex items-center space-x-4 my-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="enableHighlight" checked={enableHighlight} onCheckedChange={(checked) => setEnableHighlight(Boolean(checked))} />
          <Label htmlFor="enableHighlight">Syntax Highlight</Label>
        </div>
      </div>
      {subtitleEvents.length > 0 && (
        <div className="border rounded-md sentry-mask ph-no-capture">
          <div className="grid grid-cols-[48px_96px_96px_60px_120px_120px_1fr] h-10 border-b text-sm text-muted-foreground font-medium pl-2">
            <div className="h-full flex items-center px-2">#</div>
            <div className="h-full flex items-center px-2">Start</div>
            <div className="h-full flex items-center px-2">End</div>
            <div className="h-full flex items-center px-2">CPS</div>
            <div className="h-full flex items-center px-2">Style</div>
            <div className="h-full flex items-center px-2">Actor</div>
            <div className="h-full flex items-center px-2">Text</div>
          </div>
          <VirtualizedList
            id={`subtitle-viewer-${fileName}`}
            items={subtitleEvents.map((event, index) => ({ event, index }))}
            className="h-[510px] overflow-auto"
            estimatedItemHeight={37}
            render={{
              key: (item) => `subtitle-event-${item.index}`,
              children: (item) => {
                const cps = calculateCPS(item.event)
                return (
                  <div className="grid grid-cols-[48px_96px_96px_60px_120px_120px_1fr] border-b text-sm hover:bg-muted/50 pl-2">
                    <div className="p-2">{item.index + 1}</div>
                    <div className="p-2">{item.event.start}</div>
                    <div className="p-2">{item.event.end}</div>
                    <div className="p-2">{cps === -1 ? 'Invalid' : cps}</div>
                    <div className="p-2 break-words">{item.event.style}</div>
                    <div className="p-2">{item.event.name}</div>
                    <div className="p-2">
                      {enableHighlight ? (
                        <pre
                          className="hljs"
                          style={{ background: 'transparent' }}
                          dangerouslySetInnerHTML={{ __html: highlightText(item.event.text) }}
                        />
                      ) : (
                        <pre>{item.event.text}</pre>
                      )}
                    </div>
                  </div>
                )
              },
            }}
          />
        </div>
      )}
    </div>
  )
}