import { z } from "zod"

export const modelSchema = z.object({
  name: z.string(),
  maxInput: z.number(),
  maxOutput: z.number(),
  structuredOutput: z.boolean(),
})

export const modelCollectionSchema = z.record(z.array(modelSchema))
