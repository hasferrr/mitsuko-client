"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import type { SubtitleEvent, SubtitleType, DownloadOption, CombinedFormat, Parsed, Subtitle } from "@/types/subtitles"
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
import { DownloadSection } from "@/components/download-section"
import { convertSubtitlesToSubtitleEvents } from "@/lib/subtitles/ass/helper"
import { mergeSubtitle } from "@/lib/subtitles/merge-subtitle"
import { ACCEPTED_FORMATS } from "@/constants/subtitle-formats"

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
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true)
  const [ignorePunctuation, setIgnorePunctuation] = useState(true)
  const [fileName, setFileName] = useState<string>("")
  const [toType, setToType] = useState<SubtitleType>("srt")
  const [downloadOption] = useState<DownloadOption>("original")
  const [combinedFormat, setCombinedFormat] = useState<CombinedFormat>("o-n-t")
  const [parsedData, setParsedData] = useState<Parsed | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const fileContent = await file.text()
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase() as SubtitleType
      const fileType: SubtitleType = ['srt', 'ass', 'vtt'].includes(fileExtension) ? fileExtension : 'ass'
      
      const parseResult = parseSubtitle({ content: fileContent, type: fileType })
      setParsedData(parseResult.parsed)
      setSubtitles(parseResult.subtitles)
      setToType(fileType)
      
      if (parseResult.parsed.type === "ass" && parseResult.parsed.data) {
        setSubtitleEvents(parseResult.parsed.data.events)
      } else {
        setSubtitleEvents(convertSubtitlesToSubtitleEvents(parseResult.subtitles))
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

    const newSubtitles = subtitles.map(subtitle => ({
      ...subtitle,
      content: subtitle.content.replace(/{\\[^}]*}/g, ""),
    }))
    setSubtitles(newSubtitles)
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

  const generateContent = () => {
    if (!parsedData || subtitles.length === 0) return undefined

    const parsed = {
      type: toType,
      data: toType === "ass" && parsedData.type === "ass" ? parsedData.data : null,
    }

    return mergeSubtitle({
      subtitles,
      parsed,
    })
  }

  const getFileNameWithoutExtension = (name: string) => {
    const parts = name.split(".")
    if (parts.length > 1) {
      parts.pop()
    }
    return parts.join(".")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-medium">Tools</h1>
      <div className="flex items-center space-x-4 my-4">
        <Input type="file" onChange={handleFileChange} accept={ACCEPTED_FORMATS.join(',')} className="max-w-xs" />
        <DownloadSection
          generateContent={generateContent}
          fileName={getFileNameWithoutExtension(fileName) || "subtitle"}
          type={toType}
          downloadOption={downloadOption}
          setDownloadOption={() => {}}
          combinedFormat={combinedFormat}
          setCombinedFormat={setCombinedFormat}
          toType={toType}
          setToType={setToType}
          hideTextOptionSelector
          inlineLayout
        />
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