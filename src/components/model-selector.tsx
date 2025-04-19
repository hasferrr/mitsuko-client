"use client"

import * as React from "react"
import { PopoverProps } from "@radix-ui/react-popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutationObserver } from "@/hooks/use-mutation-observer"
import { Button } from "@/components/ui/button"
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
import { Model } from "@/types/model"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { FREE_MODELS } from "@/constants/model"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { ProjectType } from "@/types/project"
import { DEFAULT_ADVANCED_SETTINGS } from "@/constants/default"

interface ModelSelectorProps extends PopoverProps {
  type: ProjectType
  disabled?: boolean
}

export function ModelSelector({
  type,
  disabled,
  ...props
}: ModelSelectorProps) {
  const models = FREE_MODELS
  const [open, setOpen] = React.useState(false)

  // Settings Store
  const modelDetail = useSettingsStore((state) => state.getModelDetail())
  const setModelDetail = useSettingsStore((state) => state.setModelDetail)

  // Advanced Settings Store
  const setIsUseStructuredOutput = useAdvancedSettingsStore((state) => state.setIsUseStructuredOutput)
  const setIsMaxCompletionTokensAuto = useAdvancedSettingsStore((state) => state.setIsMaxCompletionTokensAuto)
  const setMaxCompletionTokens = useAdvancedSettingsStore((state) => state.setMaxCompletionTokens)

  const handleSelect = (model: Model) => {
    setModelDetail(model, type)
    setOpen(false)

    if (model.default?.isUseStructuredOutput !== undefined) {
      setIsUseStructuredOutput(model.default.isUseStructuredOutput)
    } else {
      setIsUseStructuredOutput(model.structuredOutput)
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
    <div className="flex flex-col gap-2">
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
            {modelDetail ? modelDetail.name : "Select a model..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          className="w-full p-0 overflow-y-auto"
        >
          <Command loop>
            <CommandList
              className="h-[var(--cmdk-list-height)] overflow-y-auto"
            >
              <CommandInput placeholder="Search Models..." />
              <CommandEmpty>No Models found.</CommandEmpty>
              {Object.entries(models).map(([key, value]) => (
                <CommandGroup key={key} heading={key}>
                  {value.map((model) => (
                    <ModelItem
                      key={model.name}
                      model={model}
                      isSelected={modelDetail?.name === model.name}
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
  isSelected: boolean
  onSelect: () => void
}

function ModelItem({ model, isSelected, onSelect }: ModelItemProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  useMutationObserver(ref, (mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "aria-selected" &&
        ref.current?.getAttribute("aria-selected") === "true"
      ) {
      }
    })
  })

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <div>
          <CommandItem
            onSelect={onSelect}
            ref={ref}
          >
            {model.name}
            <Check
              className={cn("ml-auto", isSelected ? "opacity-100" : "opacity-0")}
            />
          </CommandItem>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="left"
        align="start"
        className="w-[260px] text-sm"
        animate={false}
      >
        <ModelDescription model={model} isSelected={isSelected} />
      </HoverCardContent>
    </HoverCard>
  )
}

interface ModelDescriptionProps {
  model: Model | null
  isSelected?: boolean
}

function ModelDescription({ model, isSelected }: ModelDescriptionProps) {
  return model ? (
    <div className="bg-popover text-popover-foreground">
      {isSelected && (
        <div className="text-xs text-muted-foreground mb-1">
          Currently Selected Model
        </div>
      )}
      <h4 className="font-semibold mb-1">{model.name}</h4>
      <p className="text-sm">
        Context Length: {model.maxInput.toLocaleString()}
      </p>
      <p className="text-sm">
        Max Completion: {model.maxOutput.toLocaleString()}
      </p>
      <p className="text-sm">
        Structured Output: {model.structuredOutput ? "Yes" : <span className="font-semibold">No</span>}
      </p>
    </div>
  ) : (
    <p className="text-sm">No model selected</p>
  )
}
