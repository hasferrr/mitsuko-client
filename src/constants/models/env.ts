import { z } from "zod"

const csvToArray = z
  .string()
  .optional()
  .default("")
  .transform((str) => str.split(",").filter(Boolean).map((s) => s.trim()))

export const EXCLUDE_FREE_MODELS = new Set(csvToArray.parse(process.env.NEXT_PUBLIC_EXCLUDE_FREE_MODELS))
export const EXCLUDE_PAID_MODELS = new Set(csvToArray.parse(process.env.NEXT_PUBLIC_EXCLUDE_PAID_MODELS))
