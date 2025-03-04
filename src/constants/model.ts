import { ModelCollection } from "@/types/types"
import { modelCollectionSchema } from "@/lib/zod"

export const FREE_MODELS: ModelCollection = (() => {
  try {
    const parsed = JSON.parse(process.env.NEXT_PUBLIC_FREE_MODEL || "{}")
    return modelCollectionSchema.parse(parsed)
  } catch (error) {
    console.log(error)
    return {}
  }
})()
