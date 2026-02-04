"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, Headphones, ArrowRight, Layers, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import {
  DEFAULT_EXTRACTION_RESULT,
  DEFAULT_EXTRACTION_TITLE,
  DEFAULT_RESPONSE,
  DEFAULT_SUBTITLES,
  DEFAULT_TITLE,
  DEFAULT_TRANSCRIPTION_JSON,
  DEFAULT_TRANSCRIPTION_RESULT,
  DEFAULT_TRANSCRIPTION_TITLE,
} from "@/constants/default"

const features = {
  translation: [
    "SRT, ASS, VTT format support",
    "Context-aware translations",
    "Support for 100+ languages",
  ],
  transcription: [
    "Precise timestamps",
    "Custom Instructions",
    "Multiple audio formats supported",
  ],
  extraction: [
    "Character profile generation",
    "Relationship mapping",
    "Reusable context documents",
  ],
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Check className="h-3 w-3 text-green-500" strokeWidth={3} />
      </div>
      <span className="text-sm">{text}</span>
    </div>
  )
}

export function FeaturesOptions() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const createTranslationDb = useTranslationDataStore((state) => state.createTranslationDb)
  const createExtractionDb = useExtractionDataStore((state) => state.createExtractionDb)
  const createTranscriptionDb = useTranscriptionDataStore((state) => state.createTranscriptionDb)
  const setCurrentTranslationId = useTranslationDataStore((state) => state.setCurrentId)
  const setCurrentTranscriptionId = useTranscriptionDataStore((state) => state.setCurrentId)
  const setCurrentExtractionId = useExtractionDataStore((state) => state.setCurrentId)
  const upsertTranslationData = useTranslationDataStore((state) => state.upsertData)
  const upsertTranscriptionData = useTranscriptionDataStore((state) => state.upsertData)
  const upsertExtractionData = useExtractionDataStore((state) => state.upsertData)

  const projects = useProjectStore((state) => state.projects)
  const createProject = useProjectStore((state) => state.createProject)
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)

  const handleOptionClick = async (option: string) => {
    setSelectedOption(option)

    let defaultProject = projects.find(p => p.name === "Default" && !p.isBatch)
    if (!defaultProject) {
      defaultProject = await createProject("Default")
    }

    switch (option) {
      case "translate": {
        const translation = await createTranslationDb(defaultProject.id, {
          title: DEFAULT_TITLE,
          subtitles: DEFAULT_SUBTITLES,
          parsed: { type: "srt", data: null },
          response: DEFAULT_RESPONSE,
        }, undefined, undefined)
        setCurrentTranslationId(translation.id)
        upsertTranslationData(translation.id, translation)
        break
      }
      case "transcribe": {
        const transcription = await createTranscriptionDb(defaultProject.id, {
          title: DEFAULT_TRANSCRIPTION_TITLE,
          transcriptionText: DEFAULT_TRANSCRIPTION_RESULT,
          transcriptSubtitles: DEFAULT_TRANSCRIPTION_JSON
        })
        setCurrentTranscriptionId(transcription.id)
        upsertTranscriptionData(transcription.id, transcription)
        break
      }
      case "extract-context": {
        const extraction = await createExtractionDb(defaultProject.id, {
          title: DEFAULT_EXTRACTION_TITLE,
          episodeNumber: "",
          subtitleContent: "",
          previousContext: "",
          contextResult: DEFAULT_EXTRACTION_RESULT
        }, undefined, undefined)
        setCurrentExtractionId(extraction.id)
        upsertExtractionData(extraction.id, extraction)
        break
      }
    }

    setCurrentProject(defaultProject)
    await loadProjects()
    router.push(`/${option}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 -tracking-[0.02em]">
      {/* Translation Option */}
      <div
        className={cn(
          "dark:bg-[#111111] border rounded-xl p-6 transition-all cursor-pointer",
          selectedOption === "translate"
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
        )}
        onClick={() => handleOptionClick("translate")}
      >
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <div className="h-14 w-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <Globe className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium mb-2">Translation</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Translate subtitles between 100+ languages with context-aware AI for natural, accurate
              results.
            </p>
          </div>

          <div className="mt-auto space-y-3">
            {features.translation.map((feature) => (
              <FeatureItem key={feature} text={feature} />
            ))}
          </div>

          <Button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white">
            Start Translation
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Transcription Option */}
      <div
        className={cn(
          "dark:bg-[#111111] border rounded-xl p-6 transition-all cursor-pointer",
          selectedOption === "transcribe"
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
        )}
        onClick={() => handleOptionClick("transcribe")}
      >
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
              <Headphones className="h-7 w-7 text-green-500" />
            </div>
            <h3 className="text-xl font-medium mb-2">Transcription</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Convert audio to perfectly timed subtitles with optional custom instructions.
            </p>
          </div>

          <div className="mt-auto space-y-3">
            {features.transcription.map((feature) => (
              <FeatureItem key={feature} text={feature} />
            ))}
          </div>

          <Button className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white">
            Start Transcription
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Extraction Option */}
      <div
        className={cn(
          "dark:bg-[#111111] border rounded-xl p-6 transition-all cursor-pointer",
          selectedOption === "extract-context"
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
        )}
        onClick={() => handleOptionClick("extract-context")}
      >
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <div className="h-14 w-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <Layers className="h-7 w-7 text-purple-500" />
            </div>
            <h3 className="text-xl font-medium mb-2">Context Extraction</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Extract character profiles and context from subtitles to improve translation accuracy.
            </p>
          </div>

          <div className="mt-auto space-y-3">
            {features.extraction.map((feature) => (
              <FeatureItem key={feature} text={feature} />
            ))}
          </div>

          <Button className="mt-6 w-full bg-purple-500 hover:bg-purple-600 text-white">
            Start Extraction
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
