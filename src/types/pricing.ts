import { ProductId } from "./product"

export interface CurrencyData {
  symbol: string
  rate: number
}

export interface BasePlanData {
  credits: string
  basePriceUSD: number
  productId: ProductId | null
}

export interface CreditPack {
  productId: ProductId
  baseCredits: number
  basePriceUSD: number
  discountUSD: number
}
