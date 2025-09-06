import { MODEL_PRICES_URL } from "@/constants/api"
import { ModelCreditCost, ModelPriceMap } from "@/types/model-cost"

const getModelPrices = async (): Promise<ModelPriceMap> => {
  const response = await fetch(MODEL_PRICES_URL, {
    cache: "force-cache",
    next: {
      revalidate: false,
    },
  })
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
        discount: model.discount,
      })
    })

  } catch {
    console.warn("Failed to fetch model prices, using fallback values")
    modelCreditCosts.set('DeepSeek R1', {
      creditPerInputToken: 0.715,
      creditPerOutputToken: 2.847,
      discount: 0,
    })
    modelCreditCosts.set('DeepSeek V3', {
      creditPerInputToken: 0.65,
      creditPerOutputToken: 1.95,
      discount: 0,
    })
  }

  return modelCreditCosts
}
