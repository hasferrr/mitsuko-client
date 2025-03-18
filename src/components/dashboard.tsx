"use client"

import Link from "next/link"
import {
  Globe,
  Headphones,
  LayoutDashboard,
  MoreHorizontal,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Project, Translation, Transcription, Extraction } from "@/types/project"
import { DashboardItemList } from "./dashboard-item-list"

const currentProject: Project = {
  id: "1",
  name: "Anime Series Localization",
  translations: ["trans-1", "trans-2"],
  transcriptions: ["transcript-1"],
  extractions: ["extract-1"],
  createdAt: new Date("2024-03-15T08:00:00"),
  updatedAt: new Date("2024-03-15T10:00:00"),
}

const translations: Translation[] = [
  {
    id: "trans-1",
    title: "Episode 12 Subtitles",
    subtitles: [],
    parsed: {
      type: "ass",
      data: null
    },
    createdAt: new Date("2024-03-15T08:30:00"),
    updatedAt: new Date("2024-03-15T09:45:00"),
    projectId: "1",
  },
  {
    id: "trans-2",
    title: "Episode 13 Subtitles",
    subtitles: [],
    parsed: {
      type: "srt",
      data: null
    },
    createdAt: new Date("2024-03-14T10:00:00"),
    updatedAt: new Date("2024-03-14T12:30:00"),
    projectId: "1",
  }
]

const transcriptions: Transcription[] = [
  {
    id: "transcript-1",
    title: "Episode 12 Audio Transcription",
    transcriptionText: "",
    transcriptSubtitles: [],
    createdAt: new Date("2024-03-13T14:00:00"),
    updatedAt: new Date("2024-03-13T16:30:00"),
    projectId: "1"
  }
]

const extractions: Extraction[] = [
  {
    id: "extract-1",
    episodeNumber: "12",
    subtitleContent: "Character introduction...",
    previousContext: "Opening scene...",
    createdAt: new Date("2024-03-15T09:00:00"),
    updatedAt: new Date("2024-03-15T09:30:00"),
    projectId: "1"
  }
]

export const Dashboard = () => {
  const translationComponentList = translations.map((translation) => (
    <DashboardItemList
      key={translation.id}
      icon={<Globe className="h-5 w-5 text-blue-500" />}
      title={translation.title}
      description={`${translation.parsed.type.toUpperCase()} • ${translation.subtitles.length} Lines`}
      date={translation.updatedAt.toLocaleDateString()}
      action={
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
    />
  ))

  const transcriptionComponentList = transcriptions.map((transcription) => (
    <DashboardItemList
      key={transcription.id}
      icon={<Headphones className="h-5 w-5 text-green-500" />}
      title={transcription.title}
      description={`${transcription.transcriptSubtitles.length} segments`}
      date={transcription.createdAt.toLocaleDateString()}
      action={
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
    />
  ))

  const extractionComponentList = extractions.map((extraction) => (
    <DashboardItemList
      key={extraction.id}
      icon={<FileText className="h-5 w-5 text-purple-500" />}
      title={`Episode ${extraction.episodeNumber}`}
      description={`Context: ${extraction.previousContext.slice(0, 40)}...`}
      date={extraction.updatedAt.toLocaleDateString()}
      action={
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
    />
  ))

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2">{currentProject.name}</h1>
        <p className="text-muted-foreground">
          Last updated: {currentProject.updatedAt.toLocaleDateString()}
        </p>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="bg-card border border-border p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-secondary rounded-md">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="translations" className="data-[state=active]:bg-secondary rounded-md">
            <Globe className="h-4 w-4 mr-2" />
            Translations ({translations.length})
          </TabsTrigger>
          <TabsTrigger value="transcriptions" className="data-[state=active]:bg-secondary rounded-md">
            <Headphones className="h-4 w-4 mr-2" />
            Transcriptions ({transcriptions.length})
          </TabsTrigger>
          <TabsTrigger value="context-extractor" className="data-[state=active]:bg-secondary rounded-md">
            <FileText className="h-4 w-4 mr-2" />
            Extractions ({extractions.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="space-y-6">

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-4">Translations</h3>
              <div className="space-y-3">
                {translationComponentList}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-4">Transcriptions</h3>
              <div className="space-y-3">
                {transcriptionComponentList}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-4">Extractions</h3>
              <div className="space-y-3">
                {extractionComponentList}
              </div>
            </div>

          </div>
        </TabsContent>

        {/* Translations Tab */}
        <TabsContent value="translations" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">All Translations</h3>
              <Link href="/translate">
                <Button size="sm">New Translation</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {translationComponentList}
            </div>
          </div>
        </TabsContent>

        {/* Transcriptions Tab */}
        <TabsContent value="transcriptions" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">All Transcriptions</h3>
              <Link href="/transcribe">
                <Button size="sm">New Transcription</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {transcriptionComponentList}
            </div>
          </div>
        </TabsContent>

        {/* Extractions Tab */}
        <TabsContent value="context-extractor" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">All Extractions</h3>
              <Link href="/extract-context">
                <Button size="sm">New Extraction</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {extractionComponentList}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
