"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/stores/settings/use-settings-store"

interface Props {
  settingsId: string
}

export const AdvancedSettingsResetButton = ({ settingsId }: Props) => {
  const resetAdvancedSettings = useSettingsStore((state) => state.resetAdvancedSettings)
  const [value, setValue] = useState("Reset Settings")
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const handleReset = () => {
    resetAdvancedSettings(settingsId)
    setValue("✅ Reset Success")
    setTimeout(() => setValue("Reset Settings"), 2000)
  }

  return (
    <Button ref={buttonRef} onClick={handleReset} variant="outline">
      {value}
    </Button>
  )
}