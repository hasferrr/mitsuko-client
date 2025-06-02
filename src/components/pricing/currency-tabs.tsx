"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CURRENCIES } from "@/constants/pricing"

interface CurrencyTabsProps {
  currentCurrencySymbol: string
  onCurrencyChange: (value: string) => void
}

export function CurrencyTabs({ currentCurrencySymbol, onCurrencyChange }: CurrencyTabsProps) {
  return (
    <div className="flex justify-center items-center mb-8">
      <span className="text-gray-600 dark:text-gray-400 mr-2">Show currency in</span>
      <Tabs
        defaultValue={CURRENCIES.USD.symbol}
        value={currentCurrencySymbol}
        onValueChange={onCurrencyChange}
        className="w-auto"
      >
        <TabsList className="bg-gray-200 dark:bg-muted text-primary">
          <TabsTrigger value={CURRENCIES.USD.symbol}>USD</TabsTrigger>
          <TabsTrigger value={CURRENCIES.IDR.symbol}>IDR</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
