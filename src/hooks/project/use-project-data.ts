import { useState, useEffect, useRef } from "react"
import { Translation, Transcription, Extraction, Project } from "@/types/project"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useTranslationStore } from "@/stores/services/use-translation-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useProjectStore } from "@/stores/data/use-project-store"

export function useProjectData(currentProject: Project) {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [extractions, setExtractions] = useState<Extraction[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const getTranslationDb = useTranslationDataStore((state) => state.getTranslationDb)
  const getTranslationsDb = useTranslationDataStore((state) => state.getTranslationsDb)

  const getExtractionDb = useExtractionDataStore((state) => state.getExtractionDb)
  const getExtractionsDb = useExtractionDataStore((state) => state.getExtractionsDb)

  const getTranscriptionDb = useTranscriptionDataStore((state) => state.getTranscriptionDb)
  const getTranscriptionsDb = useTranscriptionDataStore((state) => state.getTranscriptionsDb)

  const isTranslatingSet = useTranslationStore(state => state.isTranslatingSet)
  const isExtractingSet = useExtractionStore(state => state.isExtractingSet)
  const isTranscribingSet = useTranscriptionStore(state => state.isTranscribingSet)

  const updateProjectItems = useProjectStore((state) => state.updateProjectItems)

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true)
      const [
        translationsData,
        transcriptionsData,
        extractionsData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _defaultTranscription,
      ] = await Promise.all([
        getTranslationsDb(currentProject.translations),
        getTranscriptionsDb(currentProject.transcriptions),
        getExtractionsDb(currentProject.extractions),
        getTranscriptionDb(currentProject.defaultTranscriptionId),
      ])

      setTranslations(translationsData.reverse())
      setTranscriptions(transcriptionsData.reverse())
      setExtractions(extractionsData.reverse())
      setIsLoadingData(false)
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject.id])

  const prevTranslatingRef = useRef<Set<string>>(new Set())
  const prevExtractingRef = useRef<Set<string>>(new Set())
  const prevTranscribingRef = useRef<Set<string>>(new Set())

  // Sync translation items when translation finishes
  useEffect(() => {
    const prevSet = prevTranslatingRef.current
    for (const id of prevSet) {
      if (!isTranslatingSet.has(id)) {
        getTranslationDb(id, true).then(updated => {
          if (updated) {
            setTranslations(prev => prev.map(t => t.id === id ? updated : t))
          }
        })
      }
    }
    prevTranslatingRef.current = new Set(isTranslatingSet)
  }, [getTranslationDb, isTranslatingSet])

  // Sync extraction items when extraction finishes
  useEffect(() => {
    const prevSet = prevExtractingRef.current
    for (const id of prevSet) {
      if (!isExtractingSet.has(id)) {
        getExtractionDb(id, true).then(updated => {
          if (updated) {
            setExtractions(prev => prev.map(e => e.id === id ? updated : e))
          }
        })
      }
    }
    prevExtractingRef.current = new Set(isExtractingSet)
  }, [getExtractionDb, isExtractingSet])

  // Sync transcription items when transcription finishes
  useEffect(() => {
    const prevSet = prevTranscribingRef.current
    for (const id of prevSet) {
      if (!isTranscribingSet.has(id)) {
        getTranscriptionDb(id, true).then(updated => {
          if (updated) {
            setTranscriptions(prev => prev.map(t => t.id === id ? updated : t))
          }
        })
      }
    }
    prevTranscribingRef.current = new Set(isTranscribingSet)
  }, [getTranscriptionDb, isTranscribingSet])

  function handleDragEnd(event: DragEndEvent, type: 'translation' | 'transcription' | 'extraction') {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const updateOrder = <T extends { id: string }>(
        items: T[],
        setItems: React.Dispatch<React.SetStateAction<T[]>>
      ) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(items, oldIndex, newIndex)
          setItems(newOrder)
          if (currentProject) {
            updateProjectItems(currentProject.id, newOrder.map((item) => item.id).toReversed(), type)
          }
        }
      }

      switch (type) {
        case 'translation':
          updateOrder(translations, setTranslations)
          break
        case 'transcription':
          updateOrder(transcriptions, setTranscriptions)
          break
        case 'extraction':
          updateOrder(extractions, setExtractions)
          break
      }
    }
  }

  return {
    translations,
    setTranslations,
    transcriptions,
    setTranscriptions,
    extractions,
    setExtractions,
    isLoadingData,
    handleDragEnd
  }
}
