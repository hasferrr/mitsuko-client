import { Model, ModelProvider } from "@/types/model"

export interface ModelGroup<T extends Model> {
  models: T[]
  provider: ModelProvider
}

export type FreeModel = Omit<Model, "isPaid"> & { isPaid: false }
export type PaidModel = Omit<Model, "isPaid"> & { isPaid: true }

export type FreeModelCollection = Record<string, ModelGroup<FreeModel>>
export type PaidModelCollection = Record<string, ModelGroup<PaidModel>>
export type ModelCollection = Record<string, ModelGroup<Model>>
