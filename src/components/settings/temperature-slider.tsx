"use client"

import { memo, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useLocalSettingsStore } from '@/stores/settings/use-local-settings-store'
import { TEMPERATURE_MIN, TEMPERATURE_MAX } from "@/constants/limits"

interface TemperatureSliderProps {
  advancedSettingsId: string
}

export const TemperatureSlider = memo(({ advancedSettingsId }: TemperatureSliderProps) => {
  const temperature = useAdvancedSettingsStore((state) => state.getTemperature(advancedSettingsId))
  const setAdvancedSettingsValue = useAdvancedSettingsStore((state) => state.setAdvancedSettingsValue)
  const setTemperature = (value: number) => setAdvancedSettingsValue(advancedSettingsId, "temperature", value)

  const isAutoTemperatureEnabled = useLocalSettingsStore((state) => state.isAutoTemperatureEnabled)
  const setIsAutoTemperatureEnabled = useLocalSettingsStore((state) => state.setIsAutoTemperatureEnabled)
  const [showDisableWarning, setShowDisableWarning] = useState(false)

  const handleCheckedChange = (checked: boolean | "indeterminate") => {
    if (!checked) {
      setShowDisableWarning(true)
    } else {
      setIsAutoTemperatureEnabled(true)
    }
  }

  const handleConfirmDisable = () => {
    setIsAutoTemperatureEnabled(false)
    setShowDisableWarning(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Temperature</label>
        <span className="text-sm text-muted-foreground">
          {temperature}
        </span>
      </div>
      <Slider
        value={[temperature]}
        onValueChange={([value]) => setTemperature(value)}
        max={TEMPERATURE_MAX}
        min={TEMPERATURE_MIN}
        step={0.1}
        className="py-2"
      />
      <p className="text-xs text-muted-foreground">
        Controls the randomness of the output.
        Higher values produce more diverse (creative) results,
        lower values produce more consistent (accurate) results.
      </p>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto-temperature"
            checked={isAutoTemperatureEnabled}
            onCheckedChange={handleCheckedChange}
          />
          <label htmlFor="auto-temperature" className="text-xs text-muted-foreground">
            Set the default temperature when switching models (global)
          </label>
        </div>
      </div>
      <AlertDialog open={showDisableWarning} onOpenChange={setShowDisableWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable auto temperature?</AlertDialogTitle>
            <AlertDialogDescription>
              Some models benefit from their recommended default temperature. Keeping this enabled ensures the best results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep enabled</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDisable}>Disable</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
})