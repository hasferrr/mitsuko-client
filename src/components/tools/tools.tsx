"use client"

import { useState, useEffect, useRef } from "react"
import hljs from 'highlight.js/lib/core'
import ass from 'highlightjs-ass'
import { useThemeStore } from "@/stores/use-theme-store"
import { Input } from "@/components/ui/input"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import type { SubtitleEvent, SubtitleType, DownloadOption, CombinedFormat, Parsed, Subtitle } from "@/types/subtitles"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SubtitleViewer from "./subtitle-viewer"
import SubtitleRawViewer from "./subtitle-raw-viewer"

function parseTimestampToMs(timestampStr: string): number {
  const [h, m, s_cs] = timestampStr.split(':')
  const [s, cs] = s_cs.split('.')
  const hours = parseInt(h) || 0
  const minutes = parseInt(m) || 0
  const seconds = parseInt(s) || 0
  const centiseconds = parseInt((cs || "0").padEnd(2, '0'))
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + centiseconds * 10
}

export default function Tools() {
  const highlightInitialized = useRef(false)
  const isDarkMode = useThemeStore(state => state.isDarkMode)
  const [subtitleEvents, setSubtitleEvents] = useState<SubtitleEvent[]>([])
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true)
  const [ignorePunctuation, setIgnorePunctuation] = useState(true)
  const [enableHighlight, setEnableHighlight] = useState(true)
  const [fileName, setFileName] = useState<string>("")
  const [toType, setToType] = useState<SubtitleType>("srt")
  const [downloadOption] = useState<DownloadOption>("original")
  const [combinedFormat, setCombinedFormat] = useState<CombinedFormat>("o-n-t")
  const [parsedData, setParsedData] = useState<Parsed | null>(null)
  const [rawContent, setRawContent] = useState<string>("")

  useEffect(() => {
    if (!highlightInitialized.current) {
      hljs.registerLanguage('ass', ass)
      highlightInitialized.current = true
    }
  }, [])

  useEffect(() => {
    const themeLink = document.getElementById('hljs-theme') as HTMLLinkElement
    const themePath = isDarkMode
      ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css'
      : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css'

    if (themeLink) {
      themeLink.href = themePath
    } else {
      const link = document.createElement('link')
      link.id = 'hljs-theme'
      link.rel = 'stylesheet'
      link.href = themePath
      document.head.appendChild(link)
    }
  }, [isDarkMode])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const fileContent = await file.text()
      setRawContent(fileContent)

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

  const handleRemoveComments = () => {
    const newSubtitleEvents = subtitleEvents.map(event => ({
      ...event,
      text: event.text.replace(/{(?!\\)[^}]*}/g, ""),
    }))
    setSubtitleEvents(newSubtitleEvents)

    const newSubtitles = subtitles.map(subtitle => ({
      ...subtitle,
      content: subtitle.content.replace(/{(?!\\)[^}]*}/g, ""),
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
    text = text.replace(/{\\[^}]*}/g, "")
    text = text.replace(/\\n|\\N/gi, "")

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
    <div className="p-4">
      <Tabs defaultValue="raw-text">
        <div className="flex justify-between items-center pb-4">
          <TabsList>
            <TabsTrigger value="raw-text">Raw Text</TabsTrigger>
            <TabsTrigger value="table-view">Table View</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <Input type="file" onChange={handleFileChange} accept={ACCEPTED_FORMATS.join(',')} className="max-w-xs min-w-48" />
          <DownloadSection
            generateContent={generateContent}
            fileName={getFileNameWithoutExtension(fileName) || "subtitle"}
            type={toType}
            downloadOption={downloadOption}
            setDownloadOption={() => { }}
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={subtitleEvents.length === 0}>Remove Comment Tags</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove all comment tags (text wrapped by curly braces) from the subtitle data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveComments}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <TabsContent value="raw-text">
          <SubtitleRawViewer
            content={rawContent}
            fileName={fileName}
          />
        </TabsContent>

        <TabsContent value="table-view">
          <SubtitleViewer
            subtitleEvents={subtitleEvents}
            ignoreWhitespace={ignoreWhitespace}
            setIgnoreWhitespace={setIgnoreWhitespace}
            ignorePunctuation={ignorePunctuation}
            setIgnorePunctuation={setIgnorePunctuation}
            enableHighlight={enableHighlight}
            setEnableHighlight={setEnableHighlight}
            calculateCPS={calculateCPS}
          />
        </TabsContent>

      </Tabs>
    </div>
  )
}
