import { MODEL_PRICES_URL } from "@/constants/api"

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

export const getModelPrices = async (): Promise<ModelPriceMap> => {
  const response = await fetch(MODEL_PRICES_URL)
  return await response.json()
}
