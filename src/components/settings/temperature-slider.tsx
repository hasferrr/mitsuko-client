"use client"

import { memo } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useLocalSettingsStore } from '@/stores/use-local-settings-store'
import { TEMPERATURE_MIN, TEMPERATURE_MAX } from "@/constants/limits"
import { SettingsParentType } from "@/types/project"

interface TemperatureSliderProps {
  parent: SettingsParentType
}

export const TemperatureSlider = memo(({ parent }: TemperatureSliderProps) => {
  const temperature = useAdvancedSettingsStore((state) => state.getTemperature())
  const setTemperature = useAdvancedSettingsStore((state) => state.setTemperature)
  const isAutoTemperatureEnabled = useLocalSettingsStore((state) => state.isAutoTemperatureEnabled)
  const setIsAutoTemperatureEnabled = useLocalSettingsStore((state) => state.setIsAutoTemperatureEnabled)

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Temperature</label>
        <span className="text-sm text-muted-foreground">
          {temperature}
        </span>
      </div>
      <Slider
        value={[temperature]}
        onValueChange={([value]) => setTemperature(value, parent)}
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
            onCheckedChange={setIsAutoTemperatureEnabled}
          />
          <label htmlFor="auto-temperature" className="text-xs text-muted-foreground">
            Set the default temperature when switching models (global)
          </label>
        </div>
      </div>
    </div>
  )
})