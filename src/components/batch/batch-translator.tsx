"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Files,
  Plus,
} from "lucide-react"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import BatchTranslatorMain from "./batch-translator-main"

export default function BatchTranslator() {
  const batch = useProjectStore((state) => state.currentProject)
  const projects = useProjectStore((state) => state.projects)
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const createProject = useProjectStore((state) => state.createProject)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)

  // Load data for selected batch
  const translationData = useTranslationDataStore((state) => state.data)
  const extractionData = useExtractionDataStore(state => state.data)
  const loadTranslations = useTranslationDataStore((state) => state.getTranslationsDb)
  const loadExtractions = useExtractionDataStore(state => state.getExtractionsDb)

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Ensure translations are loaded for current batch project
  useEffect(() => {
    if (!batch || !batch.isBatch) return
    const missing = batch.translations.filter(id => !translationData[id])
    if (missing.length === 0) return
    loadTranslations(missing).catch(err => console.error('Failed to load translations', err))
  }, [batch, translationData, loadTranslations])

  // Ensure extractions are loaded for current batch project
  useEffect(() => {
    if (!batch || !batch.isBatch) return
    const missing = batch.extractions.filter(id => !extractionData[id])
    if (missing.length === 0) return
    loadExtractions(missing).catch(err => console.error('Failed to load extractions', err))
  }, [batch, extractionData, loadExtractions])

  const handleCreateBatch = async () => {
    const newBatch = await createProject(`Batch ${new Date().toLocaleDateString()}`, true)
    setCurrentProject(newBatch)
  }

  if (!batch || !batch.isBatch) {
    return (
      <div className="flex flex-col gap-4 mx-auto container p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Select a Batch</h2>
          <Button onClick={handleCreateBatch}>
            <Plus size={18} />
            Create New Batch
          </Button>
        </div>

        {projects.filter(p => p.isBatch).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
            <Files className="h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-xl font-medium mb-2 text-center">Subtitle Batch Translation</h1>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Create a new batch to translate multiple subtitles at once.
              <br />
              Translate SRT, VTT, and ASS files with a single click.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.filter(p => p.isBatch).map((b) => (
              <Card
                key={b.id}
                className="cursor-pointer hover:border-primary transition-colors overflow-hidden border border-muted h-full flex flex-col"
                onClick={() => setCurrentProject(b.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle>{b.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 flex flex-col flex-1">
                  <div className="flex-1"></div>
                  <div className="flex flex-col gap-1 mt-auto">
                    <p className="text-sm text-muted-foreground">
                      {b.translations.length} {b.translations.length === 1 ? "file" : "files"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!batch.defaultBasicSettingsId || !batch.defaultAdvancedSettingsId) {
    return <div className="p-4">Invalid settings data</div>
  }

  return (
    <BatchTranslatorMain
      basicSettingsId={batch.defaultBasicSettingsId}
      advancedSettingsId={batch.defaultAdvancedSettingsId}
    />
  )
}
