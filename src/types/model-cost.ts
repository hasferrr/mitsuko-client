import { UsageLevel } from "./model"

export interface ModelCost {
  name: string
  creditPerInputToken: number
  creditPerOutputToken: number
  contextLength: string
  maxCompletion: string
  usage: UsageLevel
  discount: number
}

export interface ModelCreditCost {
  creditPerInputToken: number
  creditPerOutputToken: number
  discount: number
}

export interface ModelPriceMap {
  paid: (ModelCreditCost & { name: string })[]
  transcription: (ModelCreditCost & { name: string })[]
}
