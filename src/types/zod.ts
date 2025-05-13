import { z } from "zod"

export const advancedSettingsSchema = z.object({
  id: z.string(),
  temperature: z.number(),
  startIndex: z.number(),
  endIndex: z.number(),
  splitSize: z.number(),
  maxCompletionTokens: z.number(),
  isUseStructuredOutput: z.boolean(),
  isUseFullContextMemory: z.boolean(),
  isBetterContextCaching: z.boolean(),
  isMaxCompletionTokensAuto: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const modelSchema = z.object({
  name: z.string(),
  maxInput: z.number(),
  maxOutput: z.number(),
  structuredOutput: z.boolean(),
  isPaid: z.boolean(),
  default: advancedSettingsSchema
    .pick({
      temperature: true,
      isUseStructuredOutput: true,
      isMaxCompletionTokensAuto: true,
      maxCompletionTokens: true
    })
    .partial()
    .optional()
})

export const modelCollectionSchema = z.record(z.array(modelSchema))
