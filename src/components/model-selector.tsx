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

interface Model<Type = string> {
  name: string
  type: Type
}

interface ModelSelectorProps extends PopoverProps {
  types: string[]
  models: Model[]
  selectedModel?: Model
  onSelectModel: (model: Model) => void
  disabled?: boolean
}

export function ModelSelector({
  models,
  types,
  selectedModel,
  onSelectModel,
  disabled,
  ...props
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (model: Model) => {
    onSelectModel(model)
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
            {selectedModel ? selectedModel.name : "Select a model..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          className="w-full max-h-72 p-0 overflow-y-auto"
        >
          <Command loop>
            <CommandList
              className="h-[var(--cmdk-list-height)] max-h-[400px] overflow-y-auto"
            >
              <CommandInput placeholder="Search Models..." />
              <CommandEmpty>No Models found.</CommandEmpty>
              {types.map((type) => (
                <CommandGroup key={type} heading={type}>
                  {models
                    .filter((model) => model.type === type)
                    .map((model) => (
                      <ModelItem
                        key={model.name}
                        model={model}
                        isSelected={selectedModel?.name === model.name}
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
    <CommandItem
      key={model.name}
      onSelect={onSelect}
      ref={ref}
      className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
    >
      {model.name}
      <Check
        className={cn("ml-auto", isSelected ? "opacity-100" : "opacity-0")}
      />
    </CommandItem>
  )
}
