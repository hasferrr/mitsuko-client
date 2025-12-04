"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
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

interface ComboBoxProps<T> {
  data: string[]
  value: T
  setValue: (t: T) => void
  name?: string
  valueForCheckmark?: string
  disabled?: boolean
}

export function ComboBox({
  data,
  value,
  setValue,
  name,
  valueForCheckmark,
  disabled,
}: ComboBoxProps<string>) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between relative pr-6"
          disabled={disabled}
        >
          <span className="truncate">{value}</span>
          <ChevronsUpDown className="opacity-50 absolute right-3 top-1/2 -translate-y-1/2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command defaultValue={value}>
          <CommandInput placeholder={`Search ${name}...`} className="h-9" />
          <CommandList>
            <CommandEmpty>{name ? `No ${name} found.` : "Not found."}</CommandEmpty>
            <CommandGroup>
              {data.map((label) => (
                <CommandItem
                  key={label}
                  value={label}
                  onSelect={(currentValue) => {
                    setValue(currentValue)
                    setOpen(false)
                  }}
                >
                  {label}
                  <Check
                    className={cn(
                      "ml-auto",
                      (valueForCheckmark ? valueForCheckmark : value) === label
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
