"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { SettingsParentType } from "@/types/project"

interface Props {
  advancedSettingsId: string
  parent: SettingsParentType
}

export const AdvancedSettingsResetButton = ({ advancedSettingsId, parent }: Props) => {
  const resetAdvancedSettings = useAdvancedSettingsStore((state) => state.resetAdvancedSettings)
  const [value, setValue] = useState("Reset Settings")
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const handleReset = () => {
    resetAdvancedSettings(advancedSettingsId, parent)
    setValue("✅ Reset Success")
    setTimeout(() => setValue("Reset Settings"), 2000)
  }

  return (
    <Button ref={buttonRef} onClick={handleReset} variant="outline">
      {value}
    </Button>
  )
}