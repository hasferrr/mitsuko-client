"use client"

import { useEffect, useRef } from "react"
import hljs from 'highlight.js/lib/core'
import ass from 'highlightjs-ass'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SubtitleEvent } from "@/types/subtitles"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface SubtitleViewerProps {
  subtitleEvents: SubtitleEvent[]
  enableHighlight: boolean
  setEnableHighlight: (value: boolean) => void
  calculateCPS: (event: SubtitleEvent) => number
}

export default function SubtitleViewer({
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>CPS</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Text</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subtitleEvents.map((event, index) => {
              const cps = calculateCPS(event)
              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{event.start}</TableCell>
                  <TableCell>{event.end}</TableCell>
                  <TableCell>{cps === -1 ? 'Invalid' : cps}</TableCell>
                  <TableCell>{event.style}</TableCell>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>
                    {enableHighlight ? (
                      <pre
                        className="hljs"
                        style={{ background: 'transparent' }}
                        dangerouslySetInnerHTML={{ __html: highlightText(event.text) }}
                      />
                    ) : (
                      <pre>{event.text}</pre>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}