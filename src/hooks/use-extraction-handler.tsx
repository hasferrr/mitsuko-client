"use client"

import { SubtitleNoTime } from "@/types/subtitles"
import { removeTimestamp } from "@/lib/subtitles/timestamp"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import { useExtractionStore } from "@/stores/services/use-extraction-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { MAX_COMPLETION_TOKENS_MIN, MAX_COMPLETION_TOKENS_MAX } from "@/constants/limits"
import { minMax } from "@/lib/utils"
import { useSessionStore } from "@/stores/use-session-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { UserCreditData } from "@/types/user"
import { useQuery } from "@tanstack/react-query"
import { parseSubtitle } from "@/lib/subtitles/parse-subtitle"
import { toast } from "sonner"

interface UseExtractionHandlerProps {
  setActiveTab: (tab: string) => void
  setIsEpisodeNumberValid?: (valid: boolean) => void
  setIsSubtitleContentValid?: (valid: boolean) => void
  setIsEditingResult?: (editing: boolean) => void
  isBatch?: boolean
  onSuccessTranslation?: (args: { currentId: string }) => void
  onErrorTranslation?: (args: { currentId: string }) => void
}

export const useExtractionHandler = ({
  setActiveTab,
  setIsEpisodeNumberValid,
  setIsSubtitleContentValid,
  setIsEditingResult,
  isBatch = false,
  onSuccessTranslation,
  onErrorTranslation,
}: UseExtractionHandlerProps) => {
  // API Settings Store
  const customApiConfigs = useLocalSettingsStore((state) => state.customApiConfigs)
  const selectedApiConfigIndex = useLocalSettingsStore((state) => state.selectedApiConfigIndex)
  const selectedConfig = selectedApiConfigIndex !== null ? customApiConfigs[selectedApiConfigIndex] : null
  const apiKey = selectedConfig?.apiKey ?? ""
  const customBaseUrl = selectedConfig?.customBaseUrl ?? ""
  const customModel = selectedConfig?.customModel ?? ""

  // Extraction Data Store
  const setContextResult = useExtractionDataStore((state) => state.setContextResult)
  const saveData = useExtractionDataStore((state) => state.saveData)

  // Extraction Store
  const extractContext = useExtractionStore((state) => state.extractContext)
  const stopExtraction = useExtractionStore((state) => state.stopExtraction)
  const setIsExtracting = useExtractionStore((state) => state.setIsExtracting)

  // Other Store
  const session = useSessionStore((state) => state.session)

  const { refetch: refetchUserData } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: false,
    staleTime: 0,
  })

  const { setHasChanges } = useUnsavedChanges()

  const handleStart = async (
    currentId: string,
    basicSettingsId: string,
    advancedSettingsId: string,
  ) => {
    // Settings Store
    const modelDetail = useSettingsStore.getState().getModelDetail(basicSettingsId)
    const isUseCustomModel = useSettingsStore.getState().getIsUseCustomModel(basicSettingsId)

    // Advanced Settings Store
    const maxCompletionTokens = useAdvancedSettingsStore.getState().getMaxCompletionTokens(advancedSettingsId)
    const isMaxCompletionTokensAuto = useAdvancedSettingsStore.getState().getIsMaxCompletionTokensAuto(advancedSettingsId)

    // Extraction Data Store
    const extData = useExtractionDataStore.getState().data[currentId]
    const episodeNumber = extData.episodeNumber
    const subtitleContent = extData.subtitleContent
    const previousContext = extData.previousContext

    if (!isBatch) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }, 300)
    }

    await saveData(currentId)

    if (episodeNumber.trim() === "") {
      setIsEpisodeNumberValid?.(false)
      return
    }
    if (subtitleContent.trim() === "") {
      setIsSubtitleContentValid?.(false)
      return
    }

    setIsExtracting(currentId, true)
    setHasChanges(true)
    setIsEditingResult?.(false)

    if (!isBatch) setActiveTab("result")

    if (subtitleContent.trim() === "") {
      throw new Error("Empty content")
    }

    try {
      let data

      try {
        data = parseSubtitle({ content: subtitleContent })
      } catch (error) {
        toast.error("Error parsing subtitle content, please make sure the subtitle content is valid")
        throw error
      }

      const subtitles: SubtitleNoTime[] = removeTimestamp(data.subtitles)

      const requestBody = {
        input: {
          episode: episodeNumber.trim(),
          subtitles: subtitles,
          previous_context: previousContext,
        },
        baseURL: isUseCustomModel ? customBaseUrl : "http://localhost:6969",
        model: isUseCustomModel ? customModel : modelDetail?.name || "",
        maxCompletionTokens: isMaxCompletionTokensAuto ? undefined : minMax(
          maxCompletionTokens,
          MAX_COMPLETION_TOKENS_MIN,
          MAX_COMPLETION_TOKENS_MAX
        ),
      }

      await extractContext(
        requestBody,
        isUseCustomModel ? apiKey : "",
        (isUseCustomModel || modelDetail === null)
          ? "custom"
          : (modelDetail.isPaid ? "paid" : "free"),
        currentId,
        (response) => setContextResult(currentId, response),
      )

      onSuccessTranslation?.({ currentId })
    } catch (error) {
      onErrorTranslation?.({ currentId })

      console.error(error)
    } finally {
      setIsExtracting(currentId, false)

      // Refetch user data after extraction completes to update credits
      refetchUserData()

      await saveData(currentId)
    }
  }

  const handleStop = async (currentId: string) => {
    stopExtraction(currentId)
    setIsExtracting(currentId, false)
    await saveData(currentId)
  }

  return {
    handleStart,
    handleStop,
  }
}
