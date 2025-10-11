"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Globe,
  Headphones,
  ArrowRight,
  Layers,
  ChevronUp,
  LayoutGrid,
  LayoutList
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/stores/data/use-project-store"
import { DEFAULT_SUBTITLES, DEFAULT_TITLE } from "@/constants/default"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { ProjectItem } from "./project-item"
import { cn } from "@/lib/utils"


export function WelcomeView() {
  const router = useRouter()

  const createTranslationDb = useTranslationDataStore((state) => state.createTranslationDb)
  const createExtractionDb = useExtractionDataStore((state) => state.createExtractionDb)
  const createTranscriptionDb = useTranscriptionDataStore((state) => state.createTranscriptionDb)

  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [isHorizontal, setIsHorizontal] = useState(false)

  const projects = useProjectStore(state => state.projects)
  const createProject = useProjectStore(state => state.createProject)
  const loadProjects = useProjectStore(state => state.loadProjects)
  const deleteProject = useProjectStore(state => state.deleteProject)
  const setCurrentProject = useProjectStore(state => state.setCurrentProject)

  // Get setCurrentId functions from data stores
  const setCurrentTranslationId = useTranslationDataStore(state => state.setCurrentId)
  const setCurrentTranscriptionId = useTranscriptionDataStore(state => state.setCurrentId)
  const setCurrentExtractionId = useExtractionDataStore(state => state.setCurrentId)
  const upsertTranslationData = useTranslationDataStore(state => state.upsertData)
  const upsertTranscriptionData = useTranscriptionDataStore(state => state.upsertData)
  const upsertExtractionData = useExtractionDataStore(state => state.upsertData)

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [projects])

  const handleOptionClick = async (option: string) => {
    setSelectedOption(option)

    // Find or create default project
    let defaultProject = projects.find(p => p.name === "Default")
    if (!defaultProject) {
      defaultProject = await createProject("Default")
    }



    // Create new item based on option
    switch (option) {
      case "translate": {
        const translation = await createTranslationDb(defaultProject.id, {
          title: DEFAULT_TITLE,
          subtitles: DEFAULT_SUBTITLES,
          parsed: {
            type: "srt",
            data: null
          }
        }, undefined, undefined)
        setCurrentTranslationId(translation.id)
        upsertTranslationData(translation.id, translation)
        break
      }
      case "transcribe": {
        const transcription = await createTranscriptionDb(defaultProject.id, {
          title: `Audio ${new Date().toLocaleDateString()} ${crypto.randomUUID().slice(0, 5)}`,
          transcriptionText: "",
          transcriptSubtitles: []
        })
        setCurrentTranscriptionId(transcription.id)
        upsertTranscriptionData(transcription.id, transcription)
        break
      }
      case "extract-context": {
        const extraction = await createExtractionDb(defaultProject.id, {
          title: "",
          episodeNumber: "",
          subtitleContent: "",
          previousContext: "",
          contextResult: ""
        }, undefined, undefined)
        setCurrentExtractionId(extraction.id)
        upsertExtractionData(extraction.id, extraction)
        break
      }
    }

    // Set as current project
    setCurrentProject(defaultProject)

    // Refresh project list
    await loadProjects()

    // Navigate to the appropriate page
    router.push(`/${option}`)
  }

  return (
    <div className="flex-1 p-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-medium mb-3">What would you like to do?</h2>
          <p className="text-muted-foreground mx-auto">
            Select one of the options below to get started with Mitsuko's AI-powered tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">SRT, ASS, VTT format support</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">Context-aware translations</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">Support for 100+ languages</span>
                </div>
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
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">Precise timestamps</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">Custom Instructions</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">Multiple audio formats supported</span>
                </div>
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
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">Character profile generation</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">Relationship mapping</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">Reusable context documents</span>
                </div>
              </div>

              <Button className="mt-6 w-full bg-purple-500 hover:bg-purple-600 text-white">
                Start Extraction
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="mt-12 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Recent Projects
              <span className="text-muted-foreground ml-2 text-sm">
                ({showAllProjects ? sortedProjects.length : Math.min(sortedProjects.length, 6)} of {sortedProjects.length})
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHorizontal(!isHorizontal)}
              >
                {isHorizontal ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <LayoutList className="h-4 w-4" />
                )}
                {isHorizontal ? "Grid View" : "List View"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllProjects(!showAllProjects)}
              >
                {showAllProjects ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  "View All"
                )}
              </Button>
            </div>
          </div>

          <div className={cn(
            isHorizontal ? 'flex flex-col space-y-2' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
          )}>
            {(showAllProjects ? sortedProjects : sortedProjects.slice(0, 6)).map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                isHorizontal={isHorizontal}
                onDelete={deleteProject}
              />
            ))}
          </div>

          {!showAllProjects && sortedProjects.length > 6 && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAllProjects(true)}
              >
                View All Projects ({sortedProjects.length})
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}