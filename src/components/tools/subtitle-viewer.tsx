"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import type { SubtitleEvent } from "@/types/subtitles"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function parseTimestampToMs(timestampStr: string): number {
  const [h, m, s_cs] = timestampStr.split(':')
  const [s, cs] = s_cs.split('.')
  const hours = parseInt(h) || 0
  const minutes = parseInt(m) || 0
  const seconds = parseInt(s) || 0
  const centiseconds = parseInt((cs || "0").padEnd(2, '0'))
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + centiseconds * 10
}

export default function SubtitleViewer() {
  const [subtitleEvents, setSubtitleEvents] = useState<SubtitleEvent[]>([])
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true)
  const [ignorePunctuation, setIgnorePunctuation] = useState(true)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileContent = await file.text()
      const { parsed } = parseSubtitle({ content: fileContent, type: "ass" })
      if (parsed.type === "ass" && parsed.data) {
        setSubtitleEvents(parsed.data.events)
      } else {
        setSubtitleEvents([])
      }
    }
  }

  const handleExportCSV = () => {
    if (subtitleEvents.length === 0) return

    const headers = ['Start', 'End', 'CPS', 'Style', 'Actor', 'Text']
    const rows = subtitleEvents.map(event => {
      const cps = calculateCPS(event)
      const text = `"${event.text.replace(/"/g, '""')}"`
      return [event.start, event.end, cps === -1 ? 'Invalid' : cps, event.style, event.name, text].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'subtitles.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRemoveTags = () => {
    const newSubtitleEvents = subtitleEvents.map(event => ({
      ...event,
      text: event.text.replace(/{\\[^}]*}/g, ""),
    }))
    setSubtitleEvents(newSubtitleEvents)
  }

  const calculateCPS = (event: SubtitleEvent): number => {
    if (!event.text) return 0

    const durationMs = parseTimestampToMs(event.end) - parseTimestampToMs(event.start)

    if (durationMs <= 100) {
      return -1
    }

    let text = event.text
    text = text.replace(/{\\[^}]*}/g, "") // Remove Aegisub tags
    text = text.replace(/\\n|\\N/gi, "")   // Remove newlines

    if (ignoreWhitespace) {
      text = text.replace(/\s/g, "")
    }

    if (ignorePunctuation) {
      text = text.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    }

    const characterCount = text.length
    const cps = (characterCount * 1000) / durationMs

    return Math.floor(cps)
  }

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <Input type="file" onChange={handleFileChange} accept=".ass" className="max-w-xs" />
        <Button onClick={handleExportCSV} disabled={subtitleEvents.length === 0}>Export to CSV</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={subtitleEvents.length === 0}>Remove Tags</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the Aegisub tags from the subtitle data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveTags}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="flex items-center space-x-4 my-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="ignoreWhitespace" checked={ignoreWhitespace} onCheckedChange={(checked) => setIgnoreWhitespace(Boolean(checked))} />
          <Label htmlFor="ignoreWhitespace">Ignore Whitespace</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="ignorePunctuation" checked={ignorePunctuation} onCheckedChange={(checked) => setIgnorePunctuation(Boolean(checked))} />
          <Label htmlFor="ignorePunctuation">Ignore Punctuation</Label>
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
                  <TableCell>{event.text}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}