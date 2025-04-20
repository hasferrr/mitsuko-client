import { MODEL_PRICES_URL } from "@/constants/api"
import { ModelCreditCost } from "@/types/model-cost"

interface ModelPriceMap {
  free: {
    name: string
    creditPerInputToken: number
    creditPerOutputToken: number
  }[]
  paid: {
    name: string
    creditPerInputToken: number
    creditPerOutputToken: number
  }[]
}

const getModelPrices = async (): Promise<ModelPriceMap> => {
  const response = await fetch(MODEL_PRICES_URL)
  return await response.json()
}

export const getModelCostData = async (): Promise<Map<string, ModelCreditCost>> => {
  const modelCreditCosts = new Map<string, ModelCreditCost>()

  try {
    const data = await getModelPrices()

    data.paid.forEach((model) => {
      modelCreditCosts.set(model.name, {
        creditPerInputToken: model.creditPerInputToken,
        creditPerOutputToken: model.creditPerOutputToken,
      })
    })

  } catch {
    console.error("Failed to fetch model prices, using fallback values")
    modelCreditCosts.set('DeepSeek R1', {
      creditPerInputToken: 0.715,
      creditPerOutputToken: 2.847,
    })
    modelCreditCosts.set('DeepSeek V3', {
      creditPerInputToken: 0.65,
      creditPerOutputToken: 1.95,
    })
  }

  return modelCreditCosts
}
