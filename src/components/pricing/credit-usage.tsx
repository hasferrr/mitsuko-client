import { getModelCostData } from '@/lib/api/get-model-cost-data'
import { ModelCost } from '@/types/model-cost'
import { PAID_MODELS } from "@/constants/model-collection"
import { cn, formatTokens } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  costEffectiveModels,
  favoriteModels,
  fastModels,
  highQualityModels,
  priorityModels,
  multiLingualModels,
} from '@/constants/model-preferences'

export default async function CreditUsage() {
  const fetchedCreditCostsMap = await getModelCostData()

  const paidModelCostArray: ModelCost[] = Object.values(PAID_MODELS)
    .flat()
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
        score: "-",
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
      score: '-',
      discount: 0,
    },
  ]

  return (
    <div className="relative rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-8 shadow-sm">
      <div id="credit-usage" className="absolute -top-24" />
      <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
        Credit Usage
      </h3>
      <p className="mb-6">
        Credit costs vary based on the specific AI model used. Costs are typically calculated based on the number of input and output tokens processed.
        More models will be added in the future. See the estimated costs below.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/30">
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Model</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Credit per <br /> Input Token</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Credit per <br /> Output Token</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Context Length</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Max Completion</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {modelCosts.map((model) => (
              <tr key={model.name} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                <td className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                  {model.name}
                  {favoriteModels.has(model.name) && (
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <span className="cursor-default ml-1 text-[1rem]">💙</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Favorite Model</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {highQualityModels.has(model.name) && (
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <span className="cursor-default ml-1 text-[1rem]">⭐</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>High Quality</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {fastModels.has(model.name) && (
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <span className="cursor-default ml-1 text-[1rem]">⚡</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fast & Underrated Model</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {multiLingualModels.has(model.name) && (
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <span className="cursor-default ml-1 text-[1rem]">🌎</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Multilingual Model</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {costEffectiveModels.has(model.name) && (
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <span className="cursor-default ml-1 text-[1rem]">💰</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cost Effective Model</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">
                  <span className={cn(model.discount > 0 && "line-through")}>
                    {model.creditPerInputToken === -1 ? "N/A" : (model.creditPerInputToken / (1 - model.discount)).toLocaleString()}
                  </span>
                  {model.discount > 0 && (
                    <span className="ml-2 text-primary font-medium">
                      {model.creditPerInputToken === -1 ? "N/A" : model.creditPerInputToken}
                      <span className="ml-1 text-xs text-green-500">
                        ({model.discount * 100}% off)
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">
                  <span className={cn(model.discount > 0 && "line-through")}>
                    {model.creditPerOutputToken === -1 ? "N/A" : (model.creditPerOutputToken / (1 - model.discount)).toLocaleString()}
                  </span>
                  {model.discount > 0 && (
                    <span className="ml-2 text-primary font-medium">
                      {model.creditPerOutputToken === -1 ? "N/A" : model.creditPerOutputToken}
                      <span className="ml-1 text-xs text-green-500">
                        ({model.discount * 100}% off)
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{model.contextLength}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{model.maxCompletion}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{model.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
        * These are estimated costs and limits, and are subject to change. Input/Output token costs may vary. Refer to the dashboard for precise figures.
      </p>
      <div className="mt-6 text-sm space-y-2">
        <p>Token: A unit of text processed by the LLM. Roughly 4 characters or 0.75 words.</p>
        <p>Context Length: The maximum number of tokens (input + output history) the model can consider at once.</p>
        <p>Max Completion: The maximum number of tokens the model can generate in a single response.</p>
      </div>
    </div>
  )
}
