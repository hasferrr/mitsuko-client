import type { ModelCollection } from "./types"
import { EXCLUDE_FREE_MODELS, EXCLUDE_PAID_MODELS } from "./env"
import { excludeModelsByName } from "./filters"
import { RAW_FREE_MODELS } from "./free-models"
import { RAW_PAID_MODELS } from "./paid-models"

export const FREE_MODELS = excludeModelsByName(RAW_FREE_MODELS, EXCLUDE_FREE_MODELS)
export const PAID_MODELS = excludeModelsByName(RAW_PAID_MODELS, EXCLUDE_PAID_MODELS)

export const MODEL_COLLECTION: ModelCollection = {
  ...PAID_MODELS,
  ...FREE_MODELS,
}

export type { ModelGroup, FreeModel, PaidModel, FreeModelCollection, PaidModelCollection, ModelCollection } from "./types"
