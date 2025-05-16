export interface ModelCost {
  name: string
  creditPerInputToken: number
  creditPerOutputToken: number
  contextLength: string
  maxCompletion: string
  score: string
  discount: number
}

export interface ModelCreditCost {
  creditPerInputToken: number
  creditPerOutputToken: number
  discount: number
}

export interface ModelPriceMap {
  free: (ModelCreditCost & { name: string })[]
  paid: (ModelCreditCost & { name: string })[]
}
