"use client"

import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card } from "@/components/ui/card"
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
    <Card className="max-w-5xl mx-auto shadow-xs">
      <div className="bg-muted/50 border-b border-border p-4">
        <h3 className="text-lg font-medium">
          Feature Comparison
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Feature/Limit
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Free
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Basic ({currency.symbol}{pricingData.basic.price}/mo)
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Pro ({currency.symbol}{pricingData.pro.price}/mo)
              </th>
              {showDescription && (
                <th className="w-72 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Description
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {featuresData.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    {item.feature}
                    {!showDescription && (
                      <Tooltip delayDuration={50}>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </td>
                <td className={cn("px-4 py-3 text-sm text-center", typeof item.free !== "string" && "text-muted-foreground")}>
                  {item.free}
                </td>
                <td className={cn("px-4 py-3 text-sm text-center", typeof item.basic !== "string" && "text-muted-foreground")}>
                  {item.basic}
                </td>
                <td className={cn("px-4 py-3 text-sm text-center", typeof item.pro !== "string" && "text-muted-foreground")}>
                  {item.pro}
                </td>
                {showDescription && (
                  <td className="px-4 py-3 text-sm text-muted-foreground text-left align-top">
                    <p>{item.description}</p>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
