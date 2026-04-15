"use client"

import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useEffect, useState } from "react"
import type { ProjectType, Translation, Transcription, Extraction } from "@/types/project"

interface SectionConfig {
  ids: Set<string>
  type: ProjectType
  data: Record<string, Translation> | Record<string, Transcription> | Record<string, Extraction>
}

function ProcessingSection({
  ids,
  type,
  data,
  onNavigate,
  isFirst,
}: {
  ids: Set<string>
  type: ProjectType
  data: Record<string, Translation> | Record<string, Transcription> | Record<string, Extraction>
  onNavigate: (id: string, type: ProjectType) => void
  isFirst: boolean
}) {
  if (ids.size === 0) return null

  const label = type.charAt(0).toUpperCase() + type.slice(1)
  const prefix = type === "extraction" ? "ex" : type === "translation" ? "tl" : "ts"

  const getText = (id: string) => {
    const item = data[id]
    if (!item) return `Item ${id}`
    if (type === "extraction") return `Episode ${(item as Extraction).episodeNumber}`
    return (item as Translation | Transcription).title || `Item ${id}`
  }

  return (
    <div className={isFirst ? undefined : "mt-2"}>
      <p className="font-semibold mb-1">{label}:</p>
      <ul className="list-disc pl-4 [&>li+li]:mt-0.5">
        {Array.from(ids).map(id => (
          <li
            key={`${prefix}-${id}`}
            className="cursor-pointer hover:text-primary"
            onClick={() => onNavigate(id, type)}
          >
            <span className="truncate">{getText(id)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProcessingPopover() {
  const router = useRouter()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const isTranslatingSet = useTranslationStore(state => state.isTranslatingSet)
  const isExtractingSet = useExtractionStore(state => state.isExtractingSet)
  const isTranscribingSet = useTranscriptionStore(state => state.isTranscribingSet)
  const isProcessing = isTranslatingSet.size > 0 || isExtractingSet.size > 0 || isTranscribingSet.size > 0

  const tlData = useTranslationDataStore(state => state.data)
  const tsData = useTranscriptionDataStore(state => state.data)
  const exData = useExtractionDataStore(state => state.data)

  useEffect(() => {
    if (!isProcessing) {
      setIsPopoverOpen(false)
    }
  }, [isProcessing])

  const handleNavigate = (id: string, type: ProjectType) => {
    if (type === "translation") {
      useTranslationDataStore.getState().setCurrentId(id)
    } else if (type === "transcription") {
      useTranscriptionDataStore.getState().setCurrentId(id)
    } else {
      useExtractionDataStore.getState().setCurrentId(id)
    }
    setIsPopoverOpen(false)
    router.push(`/${type === "translation" ? "translate" : type === "transcription" ? "transcribe" : "extract-context"}`)
  }

  if (!isProcessing) return null

  const sections: SectionConfig[] = [
    { ids: isTranslatingSet, type: "translation", data: tlData },
    { ids: isTranscribingSet, type: "transcription", data: tsData },
    { ids: isExtractingSet, type: "extraction", data: exData },
  ]
  const activeSections = sections.filter(s => s.ids.size > 0)

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 text-sm text-foreground/80 mr-4 cursor-pointer hover:underline">
          <Loader2 className="size-4 animate-spin" />
          <span className="hidden md:block">Processing...</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-2">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Currently Processing</h4>
            <p className="text-sm text-muted-foreground">
              List of items currently being processed.
            </p>
          </div>
          {isPopoverOpen && (
            <div className="max-h-60 overflow-y-auto text-sm">
              {activeSections.map((section, i) => (
                <ProcessingSection
                  key={section.type}
                  ids={section.ids}
                  type={section.type}
                  data={section.data}
                  onNavigate={handleNavigate}
                  isFirst={i === 0}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
