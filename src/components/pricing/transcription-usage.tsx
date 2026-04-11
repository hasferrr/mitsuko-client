import { getModel } from '@/constants/transcription'
import { getModelCostData } from '@/lib/api/get-model-cost-data'
import { Card, CardContent } from '@/components/ui/card'

export default async function TranscriptionUsage() {
  const creditCostsMap = await getModelCostData()

  const modelCosts = [
    // {
    //   name: 'mitsuko-free',
    //   input: 0,
    //   output: 0,
    //   maxDuration: 30 * 60,
    // },
    {
      name: 'mitsuko-premium',
      input: ((creditCostsMap.get('mitsuko-premium')?.creditPerInputToken ?? 0) * 1920) || "N/A",
      output: creditCostsMap.get('mitsuko-premium')?.creditPerOutputToken ?? "N/A",
      maxDuration: 30 * 60,
    },
    {
      name: 'whisper-large-v3',
      input: ((creditCostsMap.get('whisper-large-v3')?.creditPerInputToken ?? 0) * 1_000_000) || "N/A",
      output: creditCostsMap.get('whisper-large-v3')?.creditPerOutputToken ?? "N/A",
      maxDuration: getModel('whisper-large-v3')?.maxDuration ?? 0,
    },
    {
      name: 'whisper-large-v3-turbo',
      input: ((creditCostsMap.get('whisper-large-v3-turbo')?.creditPerInputToken ?? 0) * 1_000_000) || "N/A",
      output: creditCostsMap.get('whisper-large-v3-turbo')?.creditPerOutputToken ?? "N/A",
      maxDuration: getModel('whisper-large-v3-turbo')?.maxDuration ?? 0,
    },
  ]

  return (
    <Card className="max-w-5xl mx-auto mt-8 shadow-xs">
      <CardContent className="p-8">
        <h3 className="text-xl font-medium mb-4">
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
              <tr className="bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-card-foreground">
                  Model Type
                </th>
                <th className="px-4 py-2 text-left font-medium text-card-foreground">
                  Credit per <br /> 1 minute audio
                </th>
                <th className="px-4 py-2 text-left font-medium text-card-foreground">
                  Credit per <br /> Output Token
                </th>
                <th className="px-4 py-2 text-left font-medium text-card-foreground">
                  Max Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modelCosts.map((model) => (
                <tr key={model.name} className="hover:bg-muted/50">
                  <td className="px-4 py-2 text-left text-card-foreground">{model.name}</td>
                  <td className="px-4 py-2 text-left text-muted-foreground">{model.input}</td>
                  <td className="px-4 py-2 text-left text-muted-foreground">{model.output}</td>
                  <td className="px-4 py-2 text-left text-muted-foreground">{model.maxDuration / 60} minutes</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-4">
            * The costs shown are not including system prompts and custom instructions input costs.
          </p>
        </div>
      </div>
      </CardContent>
    </Card>
  )
}