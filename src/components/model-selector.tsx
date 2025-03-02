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
import { Model } from "@/types/types"
import { useSettingsStore } from "@/stores/use-settings-store"
import { FREE_MODELS } from "@/constants/model"
import { useAdvancedSettingsStore } from "@/stores/use-advanced-settings-store"

interface ModelSelectorProps extends PopoverProps {
  disabled?: boolean
}

export function ModelSelector({
  disabled,
  ...props
}: ModelSelectorProps) {
  const models = FREE_MODELS
  const [open, setOpen] = React.useState(false)

  const selectedModel = useSettingsStore((state) => state.selectedModel)
  const setSelectedModel = useSettingsStore((state) => state.setSelectedModel)
  const setMaxCompletionTokens = useAdvancedSettingsStore((state) => state.setMaxCompletionTokens)
  const setIsUseStructuredOutput = useAdvancedSettingsStore((state) => state.setIsUseStructuredOutput)

  const handleSelect = (model: Model) => {
    setSelectedModel(model)
    setMaxCompletionTokens(model.maxOutput)
    setIsUseStructuredOutput(model.structuredOutput)
    setOpen(false)
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
            {selectedModel ? selectedModel : "Select a model..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          className="w-full max-h-[19rem] p-0 overflow-y-auto"
        >
          <Command loop>
            <CommandList
              className="h-[var(--cmdk-list-height)] max-h-[400px] overflow-y-auto"
            >
              <CommandInput placeholder="Search Models..." />
              <CommandEmpty>No Models found.</CommandEmpty>
              {Array.from(models).map(([key, value]) => (
                <CommandGroup key={key} heading={key}>
                  {value.map((model) => (
                    <ModelItem
                      key={model.name}
                      model={model}
                      isSelected={selectedModel === model.name}
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
            className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
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
    <div className="dark:bg-foreground dark:text-background">
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
