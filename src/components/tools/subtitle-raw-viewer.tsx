"use client"

import { useEffect, useRef } from "react"
import hljs from 'highlight.js/lib/core'

interface SubtitleRawViewerProps {
  content: string
  fileName: string
}

export default function SubtitleRawViewer({ content, fileName }: SubtitleRawViewerProps) {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current && content) {
      try {
        codeRef.current.removeAttribute('data-highlighted')
        hljs.highlightElement(codeRef.current)
      } catch (error) {
        console.error('Highlight error:', error)
      }
    }
  }, [content, fileName])

  if (!content) {
    return (
      <div className="text-muted-foreground text-sm">
        No file loaded. Please select a subtitle file to view its raw content.
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-auto">
      <pre className="p-2 m-0">
        <code
          ref={codeRef}
          className="language-ass"
          style={{ background: 'transparent', fontSize: '0.875rem' }}
        >
          {content}
        </code>
      </pre>
    </div>
  )
}
