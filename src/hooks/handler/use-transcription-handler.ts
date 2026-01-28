"use client"

import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { useTranscriptionStore } from "@/stores/services/use-transcription-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { toast } from "sonner"
import { parseTranscription, parseTranscriptionWordsAndSegments, getContent } from "@/lib/parser/parser"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useClientIdStore } from "@/stores/use-client-id-store"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { useSessionStore } from "@/stores/use-session-store"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { UserCreditData } from "@/types/user"

interface UseTranscriptionHandlerProps {
  state: {
    currentId: string
    selectedUploadId: string | null
    setSelectedUploadId: (uploadId: string | null) => void
  }
  options: {
    refetchUploads: () => Promise<unknown>
  }
}

export const useTranscriptionHandler = ({
  state: {
    currentId,
    selectedUploadId,
    setSelectedUploadId,
  },
  options: {
    refetchUploads,
  },
}: UseTranscriptionHandlerProps) => {
  const selectedMode = useTranscriptionDataStore(state => state.getSelectedMode(currentId))
  const customInstructions = useTranscriptionDataStore(state => state.getCustomInstructions(currentId))
  const models = useTranscriptionDataStore(state => state.getModels(currentId))
  const language = useTranscriptionDataStore(state => state.getLanguage(currentId))

  const setTranscriptionText = useTranscriptionDataStore(state => state.setTranscriptionText)
  const setTranscriptSubtitles = useTranscriptionDataStore(state => state.setTranscriptSubtitles)
  const setWords = useTranscriptionDataStore(state => state.setWords)
  const setSegments = useTranscriptionDataStore(state => state.setSegments)
  const saveData = useTranscriptionDataStore(state => state.saveData)

  const setIsTranscribing = useTranscriptionStore(state => state.setIsTranscribing)
  const startTranscription = useTranscriptionStore(state => state.startTranscription)
  const stopTranscription = useTranscriptionStore(state => state.stopTranscription)

  const deleteAfterTranscription = useLocalSettingsStore(state => state.isDeleteAfterTranscription)

  const session = useSessionStore(state => state.session)

  const queryClient = useQueryClient()

  const { refetch: refetchUserData } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: false,
    staleTime: 0,
  })

  const { setHasChanges } = useUnsavedChanges()

  const handleStart = async () => {
    await saveData(currentId)

    if (!selectedUploadId) {
      toast.error("Please upload or select an uploaded file first")
      return
    }
    if (!models) {
      toast.error("Please select a model")
      return
    }

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 300)

    setIsTranscribing(currentId, true)
    setHasChanges(true)

    const t = useTranscriptionDataStore.getState().data[currentId]
    const pid = t?.projectId
    const project = pid ? await useProjectStore.getState().getProjectDb(pid) : null
    const projectName = project?.name || ""

    const requestBody = {
      uploadId: selectedUploadId,
      language,
      selectedMode,
      customInstructions,
      models,
      clientId: useClientIdStore.getState().clientId || "",
      deleteFile: deleteAfterTranscription,
      projectName,
    }
    console.log(requestBody)

    try {
      setWords(currentId, [])
      setSegments(currentId, [])

      const text = await startTranscription(
        currentId,
        requestBody,
        (text) => setTranscriptionText(currentId, text),
      )

      const { words, segments } = parseTranscriptionWordsAndSegments(text)
      setWords(currentId, words)
      setSegments(currentId, segments)

      const cleaned = getContent(text)
      setTranscriptionText(currentId, cleaned)
      setTranscriptSubtitles(currentId, parseTranscription(text))

      if (deleteAfterTranscription) {
        setSelectedUploadId(null)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsTranscribing(currentId, false)

      const isUsingCredits = !models.includes("free")
      if (isUsingCredits) refetchUserData()

      await queryClient.invalidateQueries({ queryKey: ["uploads"] })
      await refetchUploads()
      await saveData(currentId)
    }
  }

  const handleStop = async () => {
    setIsTranscribing(currentId, false)
    stopTranscription(currentId)
    await saveData(currentId)
  }

  return {
    handleStart,
    handleStop,
  }
}
