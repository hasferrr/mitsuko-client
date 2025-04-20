export interface ModelCost {
  name: string
  creditPerInputToken: number
  creditPerOutputToken: number
  contextLength: string
  maxCompletion: string
  score: string
}

export interface ModelCreditCost {
  creditPerInputToken: number
  creditPerOutputToken: number
}
