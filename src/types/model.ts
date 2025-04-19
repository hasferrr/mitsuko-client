import { modelCollectionSchema, modelSchema } from "@/types/zod"
import { z } from "zod"

export type Model = z.infer<typeof modelSchema>
export type ModelCollection = z.infer<typeof modelCollectionSchema>
