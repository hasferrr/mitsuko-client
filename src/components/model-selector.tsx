"use client"

import { useState } from "react"
import { PopoverProps } from "@radix-ui/react-popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Model, ModelProvider } from "@/types/model"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { MODEL_COLLECTION } from "@/constants/model-collection"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { DEFAULT_ADVANCED_SETTINGS } from "@/constants/default"
import { useModelCosts } from "@/contexts/model-cost-context"
import { ModelCreditCost } from "@/types/model-cost"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import Link from "next/link"
import {
  Anthropic,
  DeepSeek,
  Gemini,
  Grok,
  Mistral,
  OpenAI,
  OpenRouter,
  Qwen,
} from "@lobehub/icons"

const providerIconMap: Record<ModelProvider, React.ElementType> = {
  google: Gemini,
  anthropic: Anthropic,
  openai: OpenAI,
  mistral: Mistral,
  deepseek: DeepSeek,
  qwen: Qwen,
  xai: Grok,
  unknown: OpenRouter,
}

const ModelProviderIcon = ({ provider }: { provider: ModelProvider }) => {
  const Icon = providerIconMap[provider] || OpenRouter
  return <Icon size={16} />
}

interface ModelSelectorProps extends PopoverProps {
  basicSettingsId: string
  advancedSettingsId: string
  disabled?: boolean
  className?: string
}

export function ModelSelector({
  basicSettingsId,
  advancedSettingsId,
  disabled,
  className,
  ...props
}: ModelSelectorProps) {
  const models = MODEL_COLLECTION
  const [open, setOpen] = useState(false)

  // Settings Store
  const modelDetail = useSettingsStore((state) => state.getModelDetail(basicSettingsId))
  const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
  const setModelDetail = (model: Model | null) => setBasicSettingsValue(basicSettingsId, "modelDetail", model)

  // Advanced Settings Store
  const setAdvancedSettingsValue = useAdvancedSettingsStore((state) => state.setAdvancedSettingsValue)
  const setTemperature = (value: number) => setAdvancedSettingsValue(advancedSettingsId, "temperature", value)
  const setIsUseStructuredOutput = (value: boolean) => setAdvancedSettingsValue(advancedSettingsId, "isUseStructuredOutput", value)
  const setIsMaxCompletionTokensAuto = (value: boolean) => setAdvancedSettingsValue(advancedSettingsId, "isMaxCompletionTokensAuto", value)
  const setMaxCompletionTokens = (value: number) => setAdvancedSettingsValue(advancedSettingsId, "maxCompletionTokens", value)

  // Local Settings Store
  const isAutoTemperatureEnabled = useLocalSettingsStore((state) => state.isAutoTemperatureEnabled)

  // Get model costs Map from context
  const modelCostsMap = useModelCosts()

  const handleSelect = (model: Model) => {
    setModelDetail(model)
    setOpen(false)

    // Only adjust temperature if auto temperature is enabled
    if (isAutoTemperatureEnabled) {
      if (model.default?.temperature !== undefined) {
        setTemperature(model.default.temperature)
      } else {
        setTemperature(DEFAULT_ADVANCED_SETTINGS.temperature)
      }
    }

    if (model.default?.isUseStructuredOutput !== undefined) {
      setIsUseStructuredOutput(model.default.isUseStructuredOutput)
    } else {
      setIsUseStructuredOutput(model.structuredOutput)
    }

    if (model.default?.isMaxCompletionTokensAuto !== undefined) {
      setIsMaxCompletionTokensAuto(model.default.isMaxCompletionTokensAuto)
    } else {
      setIsMaxCompletionTokensAuto(DEFAULT_ADVANCED_SETTINGS.isMaxCompletionTokensAuto)
    }

    if (model.default?.maxCompletionTokens !== undefined) {
      setMaxCompletionTokens(model.default.maxCompletionTokens)
    } else {
      setMaxCompletionTokens(DEFAULT_ADVANCED_SETTINGS.maxCompletionTokens)
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen} {...props}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a model"
            className="w-full justify-between relative pr-8"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 w-0 flex-1 min-w-0">
              <span className="truncate" title={modelDetail ? modelDetail.name : undefined}>
                {modelDetail ? modelDetail.name : "Select a model..."}
              </span>
              {modelDetail && (
                <Badge
                  variant={modelDetail.isPaid ? "default" : "secondary"}
                  className="text-xs px-2 h-[1.125rem] shrink-0"
                >
                  {modelDetail.isPaid ? "Premium" : "Free"}
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-50 absolute right-3 top-1/2 -translate-y-1/2" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          className="w-full p-0 overflow-y-auto"
        >
          <Command className="min-w-[320px]" loop defaultValue={`${modelDetail?.name}-${modelDetail?.isPaid ? "paid" : "free"}`}>
            <CommandInput placeholder="Search Models..." />
            <CommandList>
              <CommandEmpty>No Models found.</CommandEmpty>
              {Object.entries(models).map(([key, value]) => (
                <CommandGroup key={key} heading={(
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ModelProviderIcon provider={value.provider} />
                    {key}
                    <Badge
                      variant={value.models[0]?.isPaid ? "default" : "secondary"}
                      className={cn("text-xs px-[6px] h-[1rem]", "text-[11px]")}
                    >
                      {value.models[0]?.isPaid ? "Premium" : "Free"}
                    </Badge>
                  </div>
                )}>
                  {value.models.map((model) => (
                    <ModelItem
                      key={`${model.name}-${value.provider}-${model.isPaid ? "paid" : "free"}`}
                      model={model}
                      modelKey={key}
                      cost={model.isPaid ? modelCostsMap.get(model.name) : undefined}
                      isSelected={
                        modelDetail?.name === model.name &&
                        modelDetail.isPaid === model.isPaid
                      }
                      onSelect={() => {
                        handleSelect(model)
                      }}
                    />
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface ModelItemProps {
  model: Model
  modelKey: string
  cost?: ModelCreditCost
  isSelected: boolean
  onSelect: () => void
}

function ModelItem({ model, modelKey, cost, isSelected, onSelect }: ModelItemProps) {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <CommandItem
          onSelect={onSelect}
          value={`${model.name}-${modelKey}-${model.isPaid ? "premium" : "free"}`}
        >
          {model.name}
          {cost && cost.discount > 0 && (
            <span className="text-green-500">
              ({cost.discount * 100}% off)
            </span>
          )}
          <Check
            className={cn("ml-auto", isSelected ? "opacity-100" : "opacity-0")}
          />
        </CommandItem>
      </HoverCardTrigger>
      <HoverCardContent
        side="left"
        align="start"
        className="w-[260px] text-sm"
        animate={false}
      >
        <ModelDescription model={model} cost={cost} isSelected={isSelected} />
      </HoverCardContent>
    </HoverCard>
  )
}

interface ModelDescriptionProps {
  model: Model | null
  cost?: ModelCreditCost
  isSelected?: boolean
}

function ModelDescription({ model, cost, isSelected }: ModelDescriptionProps) {
  return model ? (
    <div className="bg-popover text-popover-foreground text-sm">
      {isSelected && (
        <div className="text-xs text-muted-foreground mb-1">
          Currently Selected Model
        </div>
      )}
      <h4 className="font-bold mb-1">{model.name}</h4>
      {model.subName && (
        <p className="text-xs text-muted-foreground mb-1">
          {model.subName.split("\n").map((line, index) => (
            <span key={index} className="block">{line}</span>
          ))}
        </p>
      )}
      <div>
        <p>Context Length: {model.maxInput.toLocaleString()}</p>
        <p>Max Completion: {model.maxOutput.toLocaleString()}</p>
      </div>
      <div className="mt-2">
        {cost && (
          <div className="mb-2">
            <p className="font-medium">Estimated Cost</p>
            {cost.discount > 0 ? (
              <>
                <p>
                  Input: <span className="line-through opacity-70">{(cost.creditPerInputToken / (1 - cost.discount)).toLocaleString()}</span>
                  <span className="ml-1 font-medium">
                    {cost.creditPerInputToken} credits/token
                  </span>
                </p>
                <p>
                  Output: <span className="line-through opacity-70">{(cost.creditPerOutputToken / (1 - cost.discount)).toLocaleString()}</span>
                  <span className="ml-1 font-medium">
                    {cost.creditPerOutputToken} credits/token
                  </span>
                </p>
                <p className="text-green-500">Discount: {cost.discount * 100}% off!!!</p>
              </>
            ) : (
              <>
                <p>
                  Credit Usage: <span className="capitalize font-semibold">
                    {model.usage}
                  </span>
                </p>
                <p>Input: {cost.creditPerInputToken} credits/token</p>
                <p>Output: {cost.creditPerOutputToken} credits/token</p>
              </>
            )}
          </div>
        )}
        <Link
          href="/pricing#credit-usage"
          target="_blank"
          className="block hover:underline text-blue-500/80"
        >
          See full comparison
        </Link>
        <Link
          href="/pricing#which-models"
          target="_blank"
          className="block hover:underline text-blue-500/80"
        >
          Which Models Should I Use?
        </Link>
      </div>
    </div >
  ) : (
    <p className="text-sm">No model selected</p>
  )
}
