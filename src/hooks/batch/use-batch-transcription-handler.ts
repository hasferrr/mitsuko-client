"use client"

import { useRef } from "react"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useBatchSettingsStore } from "@/stores/use-batch-settings-store"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { useUploadStore } from "@/stores/use-upload-store"
import { useSessionStore } from "@/stores/use-session-store"
import { useProjectStore } from "@/stores/data/use-project-store"
import { toast } from "sonner"
import { uploadFile } from "@/lib/api/file-upload"
import { deleteUpload } from "@/lib/api/uploads"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import { generateWordsSubtitles, generateSegmentsTranscription } from "@/lib/transcription-segments"
import { BatchFile } from "@/types/batch"
import { useClientIdStore } from "@/stores/use-client-id-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { UserCreditData } from "@/types/user"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { useWhisperSettingsStore } from "@/stores/use-whisper-settings-store"

interface UseBatchTranscriptionHandlerProps {
  defaultTranscriptionId: string
  batchFiles: BatchFile[]
  isBatchTranscribing: boolean
  state: {
    setQueueSet: React.Dispatch<React.SetStateAction<Set<string>>>
  }
}

export default function useBatchTranscriptionHandler({
  defaultTranscriptionId,
  batchFiles,
  isBatchTranscribing,
  state: {
    setQueueSet,
  },
}: UseBatchTranscriptionHandlerProps) {
  const queueAbortRef = useRef(false)
  const errorCountRef = useRef(0)
  const isUploadingSetRef = useRef<Set<string>>(new Set())

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)

  // Batch Settings Store
  const isUseSharedSettings = useBatchSettingsStore(state => state.getIsUseSharedSettings(currentProject?.id))

  // Local Settings Store
  const deleteAfterTranscription = useLocalSettingsStore(state => state.isDeleteAfterTranscription)

  // Transcription Data Store
  const transcriptionData = useTranscriptionDataStore((state) => state.data)
  const setTranscriptionText = useTranscriptionDataStore((state) => state.setTranscriptionText)
  const setTranscriptSubtitles = useTranscriptionDataStore((state) => state.setTranscriptSubtitles)
  const setWords = useTranscriptionDataStore((state) => state.setWords)
  const setSegments = useTranscriptionDataStore((state) => state.setSegments)
  const setSelectedUploadId = useTranscriptionDataStore((state) => state.setSelectedUploadId)
  const saveData = useTranscriptionDataStore((state) => state.saveData)
  const getLanguage = useTranscriptionDataStore((state) => state.getLanguage)
  const getSelectedMode = useTranscriptionDataStore((state) => state.getSelectedMode)
  const getCustomInstructions = useTranscriptionDataStore((state) => state.getCustomInstructions)
  const getModels = useTranscriptionDataStore((state) => state.getModels)

  // Transcription Store
  const isTranscribingSet = useTranscriptionStore(state => state.isTranscribingSet)
  const setIsTranscribing = useTranscriptionStore((state) => state.setIsTranscribing)
  const stopTranscription = useTranscriptionStore((state) => state.stopTranscription)
  const files = useTranscriptionStore((state) => state.files)
  const setFileAndUrl = useTranscriptionStore((state) => state.setFileAndUrl)
  const startTranscription = useTranscriptionStore((state) => state.startTranscription)

  // Upload Store
  const setUpload = useUploadStore((state) => state.setUpload)
  const setIsUploading = useUploadStore((state) => state.setIsUploading)

  // Session Store
  const session = useSessionStore((state) => state.session)

  // React Query
  const queryClient = useQueryClient()

  // Unsaved Changes
  const { setHasChanges } = useUnsavedChanges()

  // Lazy user data query for credit refetching
  const { refetch: refetchUserData } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: false,
    staleTime: 0,
  })

  const getSettingsForTranscription = (id: string) => {
    const defaultTranscription = transcriptionData[defaultTranscriptionId]
    const individualTranscription = transcriptionData[id]

    if (isUseSharedSettings && defaultTranscription) {
      return {
        language: defaultTranscription.language,
        selectedMode: defaultTranscription.selectedMode,
        customInstructions: defaultTranscription.customInstructions,
        models: defaultTranscription.models,
      }
    }

    return {
      language: individualTranscription?.language ?? getLanguage(id),
      selectedMode: individualTranscription?.selectedMode ?? getSelectedMode(id),
      customInstructions: individualTranscription?.customInstructions ?? getCustomInstructions(id),
      models: individualTranscription?.models ?? getModels(id),
    }
  }

  const runBatchTranscription = async (options: { skipDone: boolean }) => {
    if (batchFiles.length === 0 || isBatchTranscribing) return

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    queueAbortRef.current = false
    errorCountRef.current = 0
    setHasChanges(true)

    const filteredFiles = options.skipDone
      ? batchFiles.filter(f => f.status !== "done")
      : batchFiles

    const ids = filteredFiles
      .map(f => f.id)
      .filter(id => !isTranscribingSet.has(id) && !isUploadingSetRef.current.has(id))

    if (ids.length === 0) {
      return
    }

    setQueueSet(new Set(ids.slice(1)))

    let index = 0

    const launch = async () => {
      if (queueAbortRef.current) {
        setQueueSet(new Set())
        return
      }
      if (index >= ids.length) {
        setQueueSet(new Set())
        return
      }

      const id = ids[index++]

      if (isTranscribingSet.has(id)) {
        await launch()
        return
      }

      setQueueSet(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      try {
        await processTranscription(id)
      } finally {
        setIsTranscribing(id, false)
        await launch()
      }
    }

    await launch()
  }

  const processTranscription = async (id: string) => {
    const localFile = files[id]
    let uploadId = transcriptionData[id]?.selectedUploadId

    // Step 1: Upload file if local file exists
    if (localFile && !uploadId) {
      isUploadingSetRef.current.add(id)
      try {
        setIsUploading(id, true)
        uploadId = await uploadFile(localFile, (progress) => {
          setUpload(id, { progress, fileName: localFile.name })
        })
        setUpload(id, null)
        setFileAndUrl(id, null)
        setSelectedUploadId(id, uploadId)
        queryClient.invalidateQueries({ queryKey: ["uploads"] })
      } catch (error) {
        toast.error(`Failed to upload file for ${transcriptionData[id]?.title || id}`)
        setIsUploading(id, false)
        setUpload(id, null)
        isUploadingSetRef.current.delete(id)
        return
      } finally {
        setIsUploading(id, false)
        isUploadingSetRef.current.delete(id)
      }
    }

    if (!uploadId) {
      toast.error(`No upload ID for ${transcriptionData[id]?.title || id}`)
      return
    }

    if (queueAbortRef.current) {
      setIsUploading(id, false)
      return
    }

    // Step 2: Start transcription
    setIsTranscribing(id, true)

    const settings = getSettingsForTranscription(id)

    const requestBody = {
      uploadId,
      language: settings.language,
      selectedMode: settings.selectedMode,
      customInstructions: settings.customInstructions,
      models: settings.models,
      clientId: useClientIdStore.getState().clientId || "",
      deleteFile: false,
      projectName: currentProject?.name || "",
      isBatch: true,
    }

    try {
      let fullText = ""

      const transcriptionText = await startTranscription(
        id,
        requestBody,
        (chunk) => {
          fullText += chunk
          setTranscriptionText(id, fullText)
        }
      )

      // Parse response
      const { subtitles: transcriptSubtitles } = parseSubtitle({ content: transcriptionText, type: "vtt" })

      // Extract words and segments from response (for Whisper models)
      const isWhisperModel = settings.models?.startsWith("whisper")
      let words: { word: string; start: number; end: number }[] = []
      let segments: { text: string; start: number; end: number }[] = []

      if (isWhisperModel) {
        try {
          const responseObj = JSON.parse(transcriptionText)
          if (responseObj.words && Array.isArray(responseObj.words)) {
            words = responseObj.words
          }
          if (responseObj.segments && Array.isArray(responseObj.segments)) {
            segments = responseObj.segments
          }

          // Generate subtitles from words or segments
          const { subtitleLevel, maxSilenceGap, targetCps, maxCps, maxChars, minDuration } = useWhisperSettingsStore.getState()

          if (subtitleLevel === "words" && words.length > 0 && segments.length > 0) {
            const srtContent = generateWordsSubtitles(
              { words, segments },
              {
                MAX_SILENCE_GAP: maxSilenceGap,
                TARGET_CPS: targetCps,
                MAX_CPS: maxCps,
                MAX_CHARS: maxChars,
                MIN_DURATION: minDuration,
              }
            )
            const { subtitles: generatedSubtitles } = parseSubtitle({ content: srtContent, type: "srt" })
            setTranscriptSubtitles(id, generatedSubtitles)
          } else if (segments.length > 0) {
            const srtContent = generateSegmentsTranscription(segments)
            const { subtitles: generatedSubtitles } = parseSubtitle({ content: srtContent, type: "srt" })
            setTranscriptSubtitles(id, generatedSubtitles)
          } else {
            setTranscriptSubtitles(id, transcriptSubtitles)
          }
        } catch {
          setTranscriptSubtitles(id, transcriptSubtitles)
        }
      } else {
        setTranscriptSubtitles(id, transcriptSubtitles)
      }

      setWords(id, words)
      setSegments(id, segments)
      await saveData(id)

      // Step 3: Delete uploaded file if enabled
      if (deleteAfterTranscription && uploadId) {
        try {
          await deleteUpload(uploadId)
          queryClient.invalidateQueries({ queryKey: ["uploads"] })
          setSelectedUploadId(id, null)
        } catch {
          console.error(`Failed to delete upload ${uploadId}`)
        }
      }

      toast.success(`Transcription completed: ${transcriptionData[id]?.title || id}`)
      errorCountRef.current = Math.max(0, errorCountRef.current - 1)

      const isUsingCredits = settings.models ? !settings.models.includes("free") : false
      if (isUsingCredits) refetchUserData()
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Transcription aborted")
      } else {
        toast.error(`Transcription failed: ${transcriptionData[id]?.title || id}`)
        errorCountRef.current += 1
        if (errorCountRef.current >= 5) {
          handleStopBatchTranscription()
          toast.error('Encountered 5 errors. Stopping batch transcription')
        }
      }
    } finally {
      setIsTranscribing(id, false)
    }
  }

  const handleStartBatchTranscription = () => runBatchTranscription({ skipDone: false })

  const handleContinueBatchTranscription = () => runBatchTranscription({ skipDone: true })

  const handleStopBatchTranscription = () => {
    queueAbortRef.current = true
    batchFiles.forEach(file => {
      if (isTranscribingSet.has(file.id)) {
        setIsTranscribing(file.id, false)
        stopTranscription(file.id)
      }
    })
    setQueueSet(new Set())
    isUploadingSetRef.current.clear()
  }

  return {
    handleStartBatchTranscription,
    handleContinueBatchTranscription,
    handleStopBatchTranscription,
  }
}
