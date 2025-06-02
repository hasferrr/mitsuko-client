import { CurrencyData, BasePlanData, CreditPack } from "@/types/pricing"

export const CURRENCIES: { USD: CurrencyData; IDR: CurrencyData } = {
  USD: { symbol: "$", rate: 1 },
  IDR: { symbol: "Rp", rate: 17000 },
}

export const SUBSCRIPTION_PLANS: {
  free: BasePlanData
  basic: BasePlanData
  pro: BasePlanData
} = {
  free: {
    productId: null,
    credits: "0",
    basePriceUSD: 0,
  },
  basic: {
    productId: "basic_monthly",
    credits: "5,000,000",
    basePriceUSD: 5,
  },
  pro: {
    productId: "pro_monthly",
    credits: "22,000,000",
    basePriceUSD: 20,
  },
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    productId: "credit_pack_2m",
    baseCredits: 2_000_000,
    basePriceUSD: 2,
    discountUSD: 0,
  },
  {
    productId: "credit_pack_10m",
    baseCredits: 10_000_000,
    basePriceUSD: 10,
    discountUSD: 0,
  },
  {
    productId: "credit_pack_20m",
    baseCredits: 20_000_000,
    basePriceUSD: 19, // Discounted price
    discountUSD: 1,
  },
  {
    productId: "credit_pack_50m",
    baseCredits: 50_000_000,
    basePriceUSD: 45, // Discounted price
    discountUSD: 5,
  },
]
