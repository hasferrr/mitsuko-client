import { describe, expect, test } from "bun:test"
import {
  getSelectableModelCollection,
  MODEL_COLLECTION,
} from "@/constants/model-collection"

const flattenModels = (collection: ReturnType<typeof getSelectableModelCollection>) =>
  Object.values(collection).flatMap((group) => group.models)

describe("getSelectableModelCollection", () => {
  test("excludes extremely high-cost models by default", () => {
    const collection = getSelectableModelCollection(false)

    expect(flattenModels(collection).every((model) => model.usage !== "extremely high")).toBe(true)
    expect(Object.values(collection).every((group) => group.models.length > 0)).toBe(true)
  })

  test("includes extremely high-cost models when enabled", () => {
    const collection = getSelectableModelCollection(true)

    expect(collection).toBe(MODEL_COLLECTION)
    expect(flattenModels(collection).some((model) => model.usage === "extremely high")).toBe(true)
  })
})
