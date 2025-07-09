import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

interface AiStreamOutputProps {
  content: string
  className?: string
}

interface ParsedSegment {
  type: "think" | "output"
  content: string
}

export const AiStreamOutput = ({ content, className }: AiStreamOutputProps) => {
  const [collapsedStates, setCollapsedStates] = useState<Record<number, boolean>>({})

  const toggleCollapse = (index: number) => {
    setCollapsedStates(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const parsedContent = useMemo((): ParsedSegment[] => {
    const parts = content.split(/(<think>|<\/think>)/g)
    const result: ParsedSegment[] = []
    let isThinking = false
    for (const part of parts) {
      if (part === "<think>") {
        isThinking = true
      } else if (part === "</think>") {
        isThinking = false
      } else if (part) {
        const last = result[result.length - 1]
        if (last && last.type === (isThinking ? "think" : "output")) {
          last.content += part
        } else {
          result.push({ type: isThinking ? "think" : "output", content: part })
        }
      }
    }
    return result
  }, [content])

  return (
    <div className={cn("text-sm", className)}>
      {parsedContent.map((segment, index) => {
        if (segment.type === "think") {
          const isCollapsed = collapsedStates[index]
          return (
            <div
              key={index}
              className="bg-muted/30 p-3 mb-2 rounded-lg border"
            >
              <div
                onClick={() => toggleCollapse(index)}
                className="flex items-center font-semibold cursor-pointer"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                Thinking...
              </div>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="whitespace-pre-wrap text-sm pt-3">
                    {segment.content.trim() || "..."}
                  </div>
                </div>
              </div>
            </div>
          )
        }
        return (
          <span key={index} className="whitespace-pre-wrap text-sm">
            {segment.content.trim()}
          </span>
        )
      })}
    </div>
  )
}