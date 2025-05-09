import { getModelCostData } from '@/lib/api/get-model-cost-data'
import { ModelCost } from '@/types/model-cost'
import { PAID_MODELS } from "@/constants/model-collection"
import { formatTokens } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
        creditPerInputToken: costs?.creditPerInputToken ?? -69,
        creditPerOutputToken: costs?.creditPerOutputToken ?? -69,
        contextLength: contextLength,
        maxCompletion: maxCompletion,
        score: "-"
      }
    })

  let i = 0
  const priorityModels = new Map<string, number>([
    ["DeepSeek R1", i++],
    ["DeepSeek V3", i++],
    ["Gemini 2.5 Pro Preview 05-06", i++],
    ["Gemini 2.5 Flash Preview 04-17", i++],
  ])

  const favoriteModels = new Set([
    "DeepSeek R1",
  ])

  const bestModels = new Set([
    "Gemini 2.5 Pro Preview 05-06",
  ])

  const costEffectiveModels = new Set([
    "Gemini 1.5 Flash-8B",
  ])

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
    },
    {
      name: 'Custom API',
      creditPerInputToken: 0,
      creditPerOutputToken: 0,
      contextLength: 'Unknown',
      maxCompletion: 'Unknown',
      score: '-',
    }
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
                  {bestModels.has(model.name) && (
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <span className="cursor-default ml-1 text-[1rem]">⭐</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Best & Highest Quality Result</p>
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
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{model.creditPerInputToken === -69 ? "N/A" : model.creditPerInputToken}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{model.creditPerOutputToken === -69 ? "N/A" : model.creditPerOutputToken}</td>
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
