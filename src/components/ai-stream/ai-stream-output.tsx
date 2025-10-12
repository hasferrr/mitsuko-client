/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"
import { SubOnlyTranslated, SubtitleNoTimeTranslated } from "@/types/subtitles"
import { AiStreamSubtitle } from "./ai-stream-subtitle"
import { parseTranslationJson } from "@/lib/parser/parser"
import ReactMarkdown from "react-markdown"

interface AiStreamOutputProps {
  content: string
  className?: string
  subtitles?: SubtitleNoTimeTranslated[]
  isProcessing: boolean
  defaultCollapsed?: boolean
}

interface ParsedSegment {
  think: string
  output: string
}

export const AiStreamOutput = ({
  content,
  className,
  subtitles: subtitlesProp = [],
  isProcessing,
  defaultCollapsed = false,
}: AiStreamOutputProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed)
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
    if (prevIsTranslatingRef.current && isProcessing === false && subtitlesProp.length) {
      parse(content)
    }
    prevIsTranslatingRef.current = isProcessing
  }, [isProcessing])

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
            {parsedContent.output || !isProcessing ? "Thought" : (
              <span className="inline-flex">
                {"Thinking...".split("").map((char, index) => (
                  <span
                    key={index}
                    className="animate-[thinking_2s_ease-in-out_infinite]"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      color: "hsl(var(--primary))",
                    }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            )}
          </div>
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-in-out",
              isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
            )}
          >
            <div className="overflow-hidden">
              <div className="text-sm pt-3 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: props => <p className="mb-3 whitespace-pre-line" {...props} />,
                    ul: props => <ul className="mb-3 list-disc pl-5 space-y-1" {...props} />,
                    ol: props => <ol className="mb-3 list-decimal pl-5 space-y-1" {...props} />,
                    li: props => <li className="" {...props} />,
                    code: ({ className, children, ...props }) => (
                      <code className={"rounded bg-muted/50 px-1 py-0.5 text-xs " + (className || "")} {...props}>{children}</code>
                    ),
                    pre: props => <pre className="mb-3 overflow-x-auto rounded bg-muted/50 p-2 text-xs" {...props} />,
                    strong: props => <strong className="font-semibold" {...props} />,
                    em: props => <em className="italic" {...props} />,
                    h1: props => <h1 className="text-base font-semibold mt-3 mb-2" {...props} />,
                    h2: props => <h2 className="text-sm font-semibold mt-2 mb-1" {...props} />,
                    h3: props => <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />,
                    blockquote: props => <blockquote className="mb-3 border-l-2 border-border pl-3 text-muted-foreground italic" {...props} />,
                  }}
                >
                  {parsedContent.think}
                </ReactMarkdown>
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