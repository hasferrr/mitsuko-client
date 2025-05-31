"use client"

import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Currency {
  symbol: string
  rate: number
}

interface PricingData {
  basic: { price: string }
  pro: { price: string }
}

interface Feature {
  feature: string
  free: React.ReactNode
  basic: React.ReactNode
  pro: React.ReactNode
  description: string
}

interface FeatureComparisonTableProps {
  currency: Currency
  pricingData: PricingData
  featuresData: Feature[]
  showDescription?: boolean
}

export function FeatureComparisonTable({
  currency,
  pricingData,
  featuresData,
  showDescription = false,
}: FeatureComparisonTableProps) {
  return (
    <div
      className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto shadow-sm"
    >
      <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Feature Comparison
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/30">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Feature/Limit
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Free
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Basic ({currency.symbol}{pricingData.basic.price}/mo)
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Pro ({currency.symbol}{pricingData.pro.price}/mo)
              </th>
              {showDescription && (
                <th className="w-72 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {featuresData.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    {item.feature}
                    {!showDescription && (
                      <TooltipProvider delayDuration={50}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>{item.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                <td className={cn("px-4 py-3 text-sm text-center", typeof item.free !== "string" && "text-gray-600 dark:text-gray-400")}>
                  {item.free}
                </td>
                <td className={cn("px-4 py-3 text-sm text-center", typeof item.basic !== "string" && "text-gray-600 dark:text-gray-400")}>
                  {item.basic}
                </td>
                <td className={cn("px-4 py-3 text-sm text-center", typeof item.pro !== "string" && "text-gray-600 dark:text-gray-400")}>
                  {item.pro}
                </td>
                {showDescription && (
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left align-top">
                    <p>{item.description}</p>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
