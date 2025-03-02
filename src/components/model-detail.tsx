import { useSettingsStore } from '../stores/use-settings-store'

export const ModelDetail = () => {
  const modelDetail = useSettingsStore((state) => state.modelDetail)
  const isUseCustomModel = useSettingsStore((state) => state.isUseCustomModel)

  if (isUseCustomModel) return (
    <div className="text-xs text-muted-foreground">
      Custom model selected
    </div>
  )

  if (!modelDetail) return (
    <div className="text-xs text-muted-foreground">
      No model selected
    </div>
  )

  return (
    <div>
      <div className="pb-2">
        <div className="text-sm font-medium">
          {modelDetail.name}
        </div>
      </div>
      <div className="pt-0 text-xs text-muted-foreground">
        <p>Context Length Window: {modelDetail.maxInput.toLocaleString()}</p>
        <p>Max Completion Output: {modelDetail.maxOutput.toLocaleString()}</p>
        <p>Structured Output: {modelDetail.structuredOutput ? "Supported" : "Not Supported"}</p>
      </div>
    </div>
  )
}
