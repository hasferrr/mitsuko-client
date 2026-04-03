import type { ModelCollection } from "./types"

export const excludeModelsByName = <T extends ModelCollection>(
  collection: T,
  excludeSet: Set<string>
): T => {
  const result: T = {} as T

  for (const key in collection) {
    if (Object.prototype.hasOwnProperty.call(collection, key)) {
      const group = collection[key]
      const filteredModels = group.models.filter(
        (model) => !excludeSet.has(model.name)
      )

      if (filteredModels.length > 0) {
        result[key as keyof T] = {
          ...group,
          models: filteredModels,
        }
      }
    }
  }

  return result
}
