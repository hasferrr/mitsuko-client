"use client"

import { useEffect } from "react"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { getAdvancedSettings, getBasicSettings } from "@/lib/db/settings"

interface UseSettingsProps {
  basicSettingsId: string | null
  advancedSettingsId: string | null
}

export const useSettings = ({ basicSettingsId, advancedSettingsId }: UseSettingsProps) => {
  const setSettingsCurrentId = useSettingsStore((state) => state.setCurrentId)
  const upsertSettingsData = useSettingsStore((state) => state.upsertData)
  const setAdvancedSettingsCurrentId = useAdvancedSettingsStore((state) => state.setCurrentId)
  const upsertAdvancedSettingsData = useAdvancedSettingsStore((state) => state.upsertData)

  useEffect(() => {
    if (basicSettingsId) {
      setSettingsCurrentId(basicSettingsId)

      getBasicSettings(basicSettingsId)
        .then(settings => {
          if (settings) {
            upsertSettingsData(settings.id, settings)
          }
        })
    }

    if (advancedSettingsId) {
      setAdvancedSettingsCurrentId(advancedSettingsId)

      getAdvancedSettings(advancedSettingsId)
        .then(advancedSettings => {
          if (advancedSettings) {
            upsertAdvancedSettingsData(advancedSettings.id, advancedSettings)
          }
        })
    }

  }, [
    basicSettingsId,
    advancedSettingsId,
    setSettingsCurrentId,
    setAdvancedSettingsCurrentId,
    upsertSettingsData,
    upsertAdvancedSettingsData,
  ])
}
