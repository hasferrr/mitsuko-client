"use client"

import { useMemo } from "react"
import hljs from 'highlight.js/lib/core'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { VirtualizedList } from "@/components/ui-custom/virtualized-list"

interface SubtitleRawViewerProps {
  content: string
  fileName: string
  enableHighlight: boolean
  setEnableHighlight: (value: boolean) => void
}

export default function SubtitleRawViewer({ content, fileName, enableHighlight, setEnableHighlight }: SubtitleRawViewerProps) {
  const lines = useMemo(() => content.split(/\r?\n/), [content])

  const highlightText = (text: string) => {
    try {
      const highlighted = hljs.highlight(text, { language: 'ass' })
      return highlighted.value
    } catch {
      return text
    }
  }

  if (!content) {
    return (
      <div className="text-muted-foreground text-sm">
        Please select a subtitle file to view its content.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox id="enableHighlightRaw" checked={enableHighlight} onCheckedChange={(checked) => setEnableHighlight(Boolean(checked))} />
        <Label htmlFor="enableHighlightRaw">Syntax Highlight</Label>
      </div>
      <div className="rounded-lg border">
        <VirtualizedList
          id={`subtitle-raw-${fileName}`}
          items={lines.map((line, index) => ({ line, index }))}
          className="h-[510px] overflow-auto p-2"
          overscan={20}
          estimatedItemHeight={21}
          render={{
            key: (item) => `raw-line-${item.index}`,
            children: (item) => {
              const displayLine = item.line.length === 0 ? "\u00A0" : item.line

              return (
                <div className="text-[0.875rem] whitespace-pre-wrap break-words">
                  {enableHighlight ? (
                    <pre
                      className="hljs m-0"
                      style={{ background: 'transparent' }}
                      dangerouslySetInnerHTML={{ __html: highlightText(displayLine) }}
                    />
                  ) : (
                      <pre className="text-[0.875rem]">{displayLine}</pre>
                  )}
                </div>
              )
            },
          }}
        />
      </div>
    </div>
  )
}
