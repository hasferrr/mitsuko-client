"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CURRENCIES } from "@/constants/pricing"

interface CurrencyTabsProps {
  currentCurrencySymbol: string
  onCurrencyChange: (value: string) => void
}

export function CurrencyTabs({ currentCurrencySymbol, onCurrencyChange }: CurrencyTabsProps) {
  const currentCurrencyValue = currentCurrencySymbol === CURRENCIES.USD.symbol
    ? CURRENCIES.USD.key
    : CURRENCIES.IDR.key

  return (
    <div className="flex justify-center items-center mb-8">
      <span className="text-muted-foreground mr-2">Show currency in</span>
      <Tabs
        defaultValue={CURRENCIES.USD.key}
        value={currentCurrencyValue}
        onValueChange={onCurrencyChange}
        className="w-auto"
      >
        <TabsList className="bg-muted text-sidebar-primary">
          <TabsTrigger value={CURRENCIES.USD.key}>USD</TabsTrigger>
          <TabsTrigger value={CURRENCIES.IDR.key}>IDR</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
