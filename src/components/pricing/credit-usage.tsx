import { PAID_MODELS } from "@/constants/model-collection"
import { getModelPrices } from "@/lib/api/model-prices"
import { formatTokens } from "@/lib/utils"

interface ModelCost {
  name: string
  creditPerInputToken: string
  creditPerOutputToken: string
  contextLength: string
  maxCompletion: string
  score: string
}

const getModelCostSSG = async (): Promise<ModelCost[]> => {
  const modelCost: ModelCost[] = []

  try {
    const data = await getModelPrices()

    const paidModelsMap = new Map<string, { maxInput?: number, maxOutput?: number }>()
    Object.values(PAID_MODELS).flat().forEach(model => {
      paidModelsMap.set(model.name, { maxInput: model.maxInput, maxOutput: model.maxOutput })
    })

    const paidModelEntries = data.paid.map((model) => {
      const paidModelInfo = paidModelsMap.get(model.name)
      return {
        name: model.name,
        creditPerInputToken: model.creditPerInputToken.toString(),
        creditPerOutputToken: model.creditPerOutputToken.toString(),
        contextLength: formatTokens(paidModelInfo?.maxInput),
        maxCompletion: formatTokens(paidModelInfo?.maxOutput),
        score: "-"
      }
    })
    modelCost.push(...paidModelEntries)

  } catch {
    console.error("Failed to fetch model prices during build")
    modelCost.push(
      {
        name: 'DeepSeek R1',
        creditPerInputToken: '0.715',
        creditPerOutputToken: '2.847',
        contextLength: '128k tokens',
        maxCompletion: '128k tokens',
        score: '-',
      },
      {
        name: 'DeepSeek V3',
        creditPerInputToken: '0.65',
        creditPerOutputToken: '1.95',
        contextLength: '128k tokens',
        maxCompletion: '128k tokens',
        score: '-',
      },
      {
        name: 'Gemini 2.5 Pro',
        creditPerInputToken: '1.625',
        creditPerOutputToken: '13',
        contextLength: '1M tokens',
        maxCompletion: '65k tokens',
        score: '-',
      },
    )
  }

  modelCost.push(
    {
      name: 'Free Models',
      creditPerInputToken: '0',
      creditPerOutputToken: '0',
      contextLength: 'Varies',
      maxCompletion: 'Varies',
      score: '-',
    },
    {
      name: 'Custom API',
      creditPerInputToken: '0',
      creditPerOutputToken: '0',
      contextLength: 'Unknown',
      maxCompletion: 'Unknown',
      score: '-',
    }
  )

  return modelCost
}

export default async function CreditUsage() {
  const modelCost = await getModelCostSSG()

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-8">
      <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
        {/* AI Model Pricing */}
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
            {modelCost.map((model) => (
              <tr key={model.name} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                <td className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">{model.name}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{model.creditPerInputToken}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{model.creditPerOutputToken}</td>
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
