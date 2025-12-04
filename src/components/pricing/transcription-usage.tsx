import { TRANSCRIPTION_MODELS } from '@/constants/transcription'
import { getModelCostData } from '@/lib/api/get-model-cost-data'

export default async function TranscriptionUsage() {
  const creditCostsMap = await getModelCostData()

  const modelCosts = [
    {
      name: 'mitsuko-free',
      input: 0,
      output: 0,
      maxDuration: TRANSCRIPTION_MODELS['free'].maxDuration,
    },
    {
      name: 'mitsuko-premium',
      input: ((creditCostsMap.get('premium')?.creditPerInputToken ?? 0) * 1920) || "N/A",
      output: creditCostsMap.get('premium')?.creditPerOutputToken ?? "N/A",
      maxDuration: TRANSCRIPTION_MODELS['premium'].maxDuration,
    },
    {
      name: 'whisper-large-v3',
      input: ((creditCostsMap.get('whisper-large-v3')?.creditPerInputToken ?? 0) * 1_000_000) || "N/A",
      output: creditCostsMap.get('whisper-large-v3')?.creditPerOutputToken ?? "N/A",
      maxDuration: TRANSCRIPTION_MODELS['whisper-large-v3'].maxDuration,
    },
    {
      name: 'whisper-large-v3-turbo',
      input: ((creditCostsMap.get('whisper-large-v3-turbo')?.creditPerInputToken ?? 0) * 1_000_000) || "N/A",
      output: creditCostsMap.get('whisper-large-v3-turbo')?.creditPerOutputToken ?? "N/A",
      maxDuration: TRANSCRIPTION_MODELS['whisper-large-v3-turbo'].maxDuration,
    },
  ]

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-8 shadow-sm">
      <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
        Transcription (Experimental)
      </h3>
      <div className="flex flex-col gap-4">
        <p>
          Audio transcription tasks consume credits based on the duration of the audio and the number of output tokens generated.
          More models will be added in the future.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/30">
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Model Type
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Credit per <br /> 1 minute audio
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Credit per <br /> Output Token
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Max Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {modelCosts.map((model) => (
                <tr key={model.name} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">{model.name}</td>
                  <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{model.input}</td>
                  <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{model.output}</td>
                  <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{model.maxDuration / 60} minutes</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            * The costs shown are not including system prompts and custom instructions input costs.
          </p>
        </div>
      </div>
    </div>
  )
}