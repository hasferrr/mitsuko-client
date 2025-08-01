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
import { SettingsParentType } from "@/types/project"
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
  type: SettingsParentType
  disabled?: boolean
  className?: string
}

export function ModelSelector({
  type,
  disabled,
  className,
  ...props
}: ModelSelectorProps) {
  const models = MODEL_COLLECTION
  const [open, setOpen] = useState(false)

  // Settings Store
  const modelDetail = useSettingsStore((state) => state.getModelDetail())
  const setModelDetail = useSettingsStore((state) => state.setModelDetail)

  // Advanced Settings Store
  const setTemperature = useAdvancedSettingsStore((state) => state.setTemperature)
  const setIsUseStructuredOutput = useAdvancedSettingsStore((state) => state.setIsUseStructuredOutput)
  const setIsMaxCompletionTokensAuto = useAdvancedSettingsStore((state) => state.setIsMaxCompletionTokensAuto)
  const setMaxCompletionTokens = useAdvancedSettingsStore((state) => state.setMaxCompletionTokens)

  // Local Settings Store
  const isAutoTemperatureEnabled = useLocalSettingsStore((state) => state.isAutoTemperatureEnabled)

  // Get model costs Map from context
  const modelCostsMap = useModelCosts()

  const handleSelect = (model: Model) => {
    setModelDetail(model, type)
    setOpen(false)

    // Only adjust temperature if auto temperature is enabled
    if (isAutoTemperatureEnabled) {
      if (model.default?.temperature !== undefined) {
        setTemperature(model.default.temperature, type)
      } else {
        setTemperature(DEFAULT_ADVANCED_SETTINGS.temperature, type)
      }
    }

    if (model.default?.isUseStructuredOutput !== undefined) {
      setIsUseStructuredOutput(model.default.isUseStructuredOutput, type)
    } else {
      setIsUseStructuredOutput(model.structuredOutput, type)
    }

    if (model.default?.isMaxCompletionTokensAuto !== undefined) {
      setIsMaxCompletionTokensAuto(model.default.isMaxCompletionTokensAuto, type)
    } else {
      setIsMaxCompletionTokensAuto(DEFAULT_ADVANCED_SETTINGS.isMaxCompletionTokensAuto, type)
    }

    if (model.default?.maxCompletionTokens !== undefined) {
      setMaxCompletionTokens(model.default.maxCompletionTokens, type)
    } else {
      setMaxCompletionTokens(DEFAULT_ADVANCED_SETTINGS.maxCompletionTokens, type)
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
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              {modelDetail ? modelDetail.name : "Select a model..."}
              {modelDetail && (
                <Badge
                  variant={modelDetail.isPaid ? "default" : "secondary"}
                  className="text-xs px-2 h-[1.125rem]"
                >
                  {modelDetail.isPaid ? "Premium" : "Free"}
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="opacity-50" />
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
                      key={`${model.name}-${model.isPaid ? "paid" : "free"}`}
                      model={model}
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
  cost?: ModelCreditCost
  isSelected: boolean
  onSelect: () => void
}

function ModelItem({ model, cost, isSelected, onSelect }: ModelItemProps) {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <CommandItem
          onSelect={onSelect}
          value={`${model.name}-${model.isPaid ? "paid" : "free"}`}
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
          {model.subName}
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
