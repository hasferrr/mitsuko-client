import { TRANSCRIPTION_MODELS } from '@/constants/transcription'
import { getModelCostData } from '@/lib/api/get-model-cost-data'
import { Card, CardContent } from '@/components/ui/card'

export default async function TranscriptionUsage() {
  const creditCostsMap = await getModelCostData()

  const modelCosts = Object.entries(TRANSCRIPTION_MODELS).map(([name, model]) => {
    const costs = creditCostsMap.get(name)

    return {
      name,
      input: costs?.creditPerInputToken || "N/A",
      output: costs?.creditPerOutputToken ?? "N/A",
      maxDuration: model.maxDuration,
    }
  })

  return (
    <Card className="max-w-5xl mx-auto mt-8 shadow-xs">
      <CardContent className="space-y-4">
        <h3 className="text-xl font-medium">
          Transcription (Experimental)
        </h3>
      <div className="flex flex-col gap-4">
        <p>
          Audio transcription tasks consume credits based on the duration of the audio and the number of output tokens generated.
          More models will be added in the future. See the estimated costs below.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">
                  Model Type
                </th>
                <th className="px-4 py-2 text-left font-medium">
                  Credit per <br /> 1 minute audio
                </th>
                <th className="px-4 py-2 text-left font-medium">
                  Credit per <br /> Output Token
                </th>
                <th className="px-4 py-2 text-left font-medium">
                  Max Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modelCosts.map((model) => (
                <tr key={model.name} className="hover:bg-muted/50">
                  <td className="px-4 py-2 text-left">{model.name}</td>
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
