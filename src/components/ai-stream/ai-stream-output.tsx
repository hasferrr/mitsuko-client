"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"
import { SubOnlyTranslated, SubtitleNoTimeTranslated } from "@/types/subtitles"
import { AiStreamSubtitle } from "./ai-stream-subtitle"
import { parseTranslationJson } from "@/lib/parser/parser"

interface AiStreamOutputProps {
  content: string
  className?: string
  subtitles?: SubtitleNoTimeTranslated[]
  isTranslating?: boolean
}

interface ParsedSegment {
  think: string
  output: string
}

export const AiStreamOutput = ({
  content,
  className,
  subtitles: subtitlesProp = [],
  isTranslating,
}: AiStreamOutputProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const [translatedSubtitles, setTranslatedSubtitles] = useState<SubOnlyTranslated[]>([])
  const initialSubtitlesRef = useRef<SubtitleNoTimeTranslated[]>(subtitlesProp)
  const lastParseTimeRef = useRef<number>(Date.now())
  const parseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const prevIsTranslatingRef = useRef<boolean | undefined>(undefined)

  const parse = (content: string) => {
    try {
      const split = content.split("\n")
      const message = []
      if (split[split.length - 1].startsWith("[")) {
        message.push({
          index: NaN,
          translated: split[split.length - 1],
        })
        split.pop()
      }
      const parsed = parseTranslationJson(split.join("\n"))
      parsed.push(...message)
      if (translatedSubtitles.length !== parsed.length) {
        setTranslatedSubtitles(parsed)
      }
    } catch {
      setTranslatedSubtitles([])
    }
  }

  const cleanup = () => {
    if (parseTimerRef.current) {
      clearTimeout(parseTimerRef.current)
      parseTimerRef.current = null
    }
  }

  useEffect(() => {
    if (subtitlesProp.length) {
      parse(content)
    }
  }, [])

  useEffect(() => {
    if (prevIsTranslatingRef.current && isTranslating === false && subtitlesProp.length) {
      parse(content)
    }
    prevIsTranslatingRef.current = isTranslating
  }, [isTranslating])

  useEffect(() => {
    if (!subtitlesProp.length) return

    const NOW = Date.now()
    const MIN_DELAY_MS = 200
    const THROTTLE_MS = 1000
    const DEBOUNCE_MS = 3000

    if (NOW - lastParseTimeRef.current < MIN_DELAY_MS) {
      // do nothing
    } else if (NOW - lastParseTimeRef.current < THROTTLE_MS) {
      cleanup()
      parseTimerRef.current = setTimeout(() => {
        lastParseTimeRef.current = Date.now()
        parseTimerRef.current = null
        parse(content)
      }, DEBOUNCE_MS)
    } else {
      lastParseTimeRef.current = Date.now()
      cleanup()
      parse(content)
    }

    return () => {
      cleanup()
    }
  }, [content])

  const toggleCollapse = () => setIsCollapsed(prev => !prev)

  const parsedContent = useMemo<ParsedSegment>(() => {
    const parts = content.split(/(<think>|<\/think>)/g)
    const result: ParsedSegment = { think: "", output: "" }
    let isThinking = false

    for (const part of parts) {
      if (part === "<think>") {
        isThinking = true
      } else if (part === "</think>") {
        isThinking = false
      } else if (part) {
        if (isThinking) {
          result.think += part
        } else {
          result.output += part
        }
      }
    }

    return {
      think: result.think.trim(),
      output: result.output.trim()
    }
  }, [content])

  return (
    <div className={cn("text-sm", className)}>
      {parsedContent.think && (
        <div className="bg-muted/30 p-3 mb-2 rounded-lg border">
          <div
            onClick={toggleCollapse}
            className="flex items-center font-semibold cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 mr-1" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-1" />
            )}
            {parsedContent.output ? "Thought" : "Thinking..."}
          </div>
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-in-out",
              isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
            )}
          >
            <div className="overflow-hidden">
              <div className="whitespace-pre-wrap text-sm pt-3">
                {parsedContent.think}
              </div>
            </div>
          </div>
        </div>
      )}
      {parsedContent.output && translatedSubtitles.length > 0 && (
        <AiStreamSubtitle
          initialSubtitles={initialSubtitlesRef.current}
          translatedSubtitles={translatedSubtitles}
        />
      )}
      {parsedContent.output && translatedSubtitles.length === 0 && (
        <div className="whitespace-pre-wrap break-words text-sm p-1">
          {parsedContent.output}
        </div>
      )}
    </div>
  )
}