"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Globe,
  Headphones,
  FileText,
  ArrowRight,
  Layers,
  Clock,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Project } from "@/types/project"

interface WelcomeViewProps {
  projects: Project[]
  setCurrentProject: (project: Project) => void
}

export const WelcomeView = ({ projects, setCurrentProject }: WelcomeViewProps) => {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAllProjects, setShowAllProjects] = useState(false)

  const handleOptionClick = (option: string) => {
    setSelectedOption(option)
    router.push(`/${option}`)
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-3">What would you like to do?</h2>
          <p className="text-muted-foreground text-sm mx-auto">
            Select one of the options below to get started with Mitsuko's AI-powered tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Translation Option */}
          <div
            className={`border rounded-xl p-6 transition-all cursor-pointer ${selectedOption === "translate"
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
              }`}
            onClick={() => handleOptionClick("translate")}
          >
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="h-14 w-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <Globe className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Translation</h3>
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
                  <span className="text-sm">SRT and ASS format support</span>
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
            className={`border rounded-xl p-6 transition-all cursor-pointer ${selectedOption === "transcribe"
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
              }`}
            onClick={() => handleOptionClick("transcribe")}
          >
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <Headphones className="h-7 w-7 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Transcription</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Convert audio to perfectly timed subtitles with automatic speaker detection and timestamps.
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
                  <span className="text-sm">Automatic speaker detection</span>
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
            className={`border rounded-xl p-6 transition-all cursor-pointer ${selectedOption === "extract-context"
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
              }`}
            onClick={() => handleOptionClick("extract-context")}
          >
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="h-14 w-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Layers className="h-7 w-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Context Extraction</h3>
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
              {showAllProjects ? "All Projects" : "Recent Projects"}
              <span className="text-muted-foreground ml-2 text-sm">
                ({showAllProjects ? projects.length : Math.min(projects.length, 4)} of {projects.length})
              </span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllProjects(!showAllProjects)}
            >
              {showAllProjects ? (
                <>
                  Show Less
                  <ChevronUp className="h-4 w-4 ml-2" />
                </>
              ) : (
                "View All"
              )}
            </Button>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${
            showAllProjects ? 'max-h-[60vh] overflow-y-auto pr-2' : ''
          }`}>
            {(showAllProjects ? projects : projects.slice(0, 4)).map((project) => (
              <div
                key={project.id}
                className="border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-card/80 transition-colors cursor-pointer"
                onClick={() => setCurrentProject(project)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {project.transcriptions.length > project.translations.length &&
                   project.transcriptions.length > project.extractions.length ? (
                    <Headphones className="h-4 w-4 text-green-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm font-medium truncate">{project.name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Multiple</span>
                  <span className="text-xs text-muted-foreground">
                    {project.transcriptions.length > project.translations.length &&
                     project.transcriptions.length > project.extractions.length ? "AAC/WAV" : "SRT/ASS"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{project.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}