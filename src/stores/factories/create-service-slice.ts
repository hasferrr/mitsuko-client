import type { RefObject } from "react"

interface ServiceSlice {
  abortControllerMap: Map<string, RefObject<AbortController>>
  [key: string]: unknown
}

export function createServiceSlice<TSetName extends string>(
  setName: TSetName,
) {
  return (
    set: (fn: (state: ServiceSlice & Record<TSetName, Set<string>>) => Partial<ServiceSlice & Record<TSetName, Set<string>>>) => void,
    get: () => ServiceSlice & Record<TSetName, Set<string>>,
  ) => ({
    [setName]: new Set<string>(),
    abortControllerMap: new Map<string, RefObject<AbortController>>(),

    setActive: (id: string, isActive: boolean) => {
      set(state => {
        const newSet = new Set(state[setName])
        if (isActive) {
          newSet.add(id)
        } else {
          newSet.delete(id)
        }
        return { [setName]: newSet } as Partial<ServiceSlice & Record<TSetName, Set<string>>>
      })
    },

    stop: (id: string) => {
      set(state => {
        const newSet = new Set(state[setName])
        newSet.delete(id)
        state.abortControllerMap.get(id)?.current?.abort()
        state.abortControllerMap.delete(id)
        return { [setName]: newSet } as Partial<ServiceSlice & Record<TSetName, Set<string>>>
      })
    },
  })
}
