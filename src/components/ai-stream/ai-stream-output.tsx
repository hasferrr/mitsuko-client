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
}

interface ParsedSegment {
  think: string
  output: string
}

export const AiStreamOutput = ({
  content,
  className,
  subtitles: subtitlesProp = [],
}: AiStreamOutputProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const [translatedSubtitles, setTranslatedSubtitles] = useState<SubOnlyTranslated[]>([])
  const initialSubtitlesRef = useRef<SubtitleNoTimeTranslated[]>(subtitlesProp)

  useEffect(() => {
    const parsed = parseTranslationJson(content)
    setTranslatedSubtitles(parsed)
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
        <span className="whitespace-pre-wrap break-words text-sm">
          {parsedContent.output}
        </span>
      )}
    </div>
  )
}