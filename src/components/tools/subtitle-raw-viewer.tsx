"use client"

import { useEffect, useRef } from "react"
import hljs from 'highlight.js/lib/core'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface SubtitleRawViewerProps {
  content: string
  fileName: string
  enableHighlight: boolean
  setEnableHighlight: (value: boolean) => void
}

export default function SubtitleRawViewer({ content, fileName, enableHighlight, setEnableHighlight }: SubtitleRawViewerProps) {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current && content && enableHighlight) {
      try {
        codeRef.current.removeAttribute('data-highlighted')
        hljs.highlightElement(codeRef.current)
      } catch (error) {
        console.error('Highlight error:', error)
      }
    }
  }, [content, fileName, enableHighlight])

  if (!content) {
    return (
      <div className="text-muted-foreground text-sm">
        No file loaded. Please select a subtitle file to view its raw content.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox id="enableHighlightRaw" checked={enableHighlight} onCheckedChange={(checked) => setEnableHighlight(Boolean(checked))} />
        <Label htmlFor="enableHighlightRaw">Syntax Highlight</Label>
      </div>
      <div className="rounded-lg border overflow-auto">
        <pre className="p-2 m-0">
          {enableHighlight ? (
            <code
              ref={codeRef}
              className="language-ass"
              style={{ background: 'transparent', fontSize: '0.875rem' }}
            >
              {content}
            </code>
          ) : (
            <p className="p-[0.875rem] text-[0.875rem]">
              {content}
            </p>
          )}
        </pre>
      </div>
    </div>
  )
}
