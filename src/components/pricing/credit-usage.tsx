import { getModelCostData } from '@/lib/api/get-model-cost-data'
import { ModelCost } from '@/types/model-cost'
import { PAID_MODELS } from "@/constants/model-collection"
import { cn, formatTokens } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { priorityModels } from '@/constants/model-preferences'
import ModelNameWithBadges from './model-name-with-badges'

export default async function CreditUsage() {
  const fetchedCreditCostsMap = await getModelCostData()

  const paidModelCostArray: ModelCost[] = Object.values(PAID_MODELS)
    .flatMap((group) => group.models)
    .map((paidModel) => {
      const costs = fetchedCreditCostsMap.get(paidModel.name)

      const contextLength = paidModel.maxInput !== undefined ? formatTokens(paidModel.maxInput) : "N/A"
      const maxCompletion = paidModel.maxOutput !== undefined ? formatTokens(paidModel.maxOutput) : "N/A"

      return {
        name: paidModel.name,
        creditPerInputToken: costs?.creditPerInputToken ?? -1,
        creditPerOutputToken: costs?.creditPerOutputToken ?? -1,
        contextLength: contextLength,
        maxCompletion: maxCompletion,
        usage: paidModel.usage,
        discount: costs?.discount ?? 0,
      }
    })

  const sortedPriorityModels = paidModelCostArray
    .filter(model => priorityModels.has(model.name))
    .sort((a, b) => priorityModels.get(a.name)! - priorityModels.get(b.name)!)

  const nonPriorityModels = paidModelCostArray
    .filter(model => !priorityModels.has(model.name))

  const modelCosts: ModelCost[] = [
    ...sortedPriorityModels,
    ...nonPriorityModels,
    {
      name: 'Free Models',
      creditPerInputToken: 0,
      creditPerOutputToken: 0,
      contextLength: 'Varies',
      maxCompletion: 'Varies',
      usage: 'N/A',
      discount: 0,
    },
  ]

  return (
    <Card className="relative max-w-5xl mx-auto mt-8 shadow-xs">
      <div id="credit-usage" className="absolute -top-24" />
      <CardContent className="space-y-4">
      <h3 className="text-xl font-medium">
        Credit Usage
      </h3>
      <p>
        Credit costs vary based on the specific AI model used. Costs are typically calculated based on the number of input and output tokens processed.
        More models will be added in the future. See the estimated costs below.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Model</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Credit per <br /> Input Token</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Credit per <br /> Output Token</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Credit Usage</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Context Length</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Max Completion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {modelCosts.map((model) => (
              <tr key={model.name} className="hover:bg-muted/50">
                <td className="px-4 py-2 text-left text-muted-foreground">
                  <ModelNameWithBadges name={model.name} />
                </td>
                <td className="px-4 py-2 text-left text-muted-foreground">
                  <span className={cn(model.discount > 0 && "line-through")}>
                    {model.creditPerInputToken === -1 ? "N/A" : (model.creditPerInputToken / (1 - model.discount)).toLocaleString()}
                  </span>
                  {model.discount > 0 && (
                    <span className="ml-2 text-sidebar-primary font-medium">
                      {model.creditPerInputToken === -1 ? "N/A" : model.creditPerInputToken}
                      <span className="ml-1 text-xs text-green-500">
                        ({model.discount * 100}% off)
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-left text-muted-foreground">
                  <span className={cn(model.discount > 0 && "line-through")}>
                    {model.creditPerOutputToken === -1 ? "N/A" : (model.creditPerOutputToken / (1 - model.discount)).toLocaleString()}
                  </span>
                  {model.discount > 0 && (
                    <span className="ml-2 text-sidebar-primary font-medium">
                      {model.creditPerOutputToken === -1 ? "N/A" : model.creditPerOutputToken}
                      <span className="ml-1 text-xs text-green-500">
                        ({model.discount * 100}% off)
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-left text-muted-foreground">
                  <span className="capitalize font-medium">
                    {model.usage}
                  </span>
                </td>
                <td className="px-4 py-2 text-left text-muted-foreground">{model.contextLength}</td>
                <td className="px-4 py-2 text-left text-muted-foreground">{model.maxCompletion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        * These are estimated costs and limits, and are subject to change. Input/Output token costs may vary. Refer to the dashboard for precise figures.
      </p>
      <div className="text-sm space-y-2">
        <p>Token: A unit of text processed by the LLM. Roughly 4 characters or 0.75 words.</p>
        <p>Context Length: The maximum number of tokens (input + output history) the model can consider at once.</p>
        <p>Max Completion: The maximum number of tokens the model can generate in a single response.</p>
      </div>
      </CardContent>
    </Card>
  )
}
