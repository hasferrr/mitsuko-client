import type { RefObject } from "react"

export function createServiceSlice<TSetName extends string>(
  setName: TSetName,
) {
  type SliceState = Record<TSetName, Set<string>> & {
    abortControllerMap: Map<string, RefObject<AbortController>>
    setActive: (id: string, isActive: boolean) => void
    stop: (id: string) => void
  }

  return (
    set: (fn: (state: SliceState) => Partial<SliceState>) => void,
  ): SliceState => ({
    [setName]: new Set<string>(),
    abortControllerMap: new Map<string, RefObject<AbortController>>(),

    setActive: (id: string, isActive: boolean) => {
      set(state => {
        const newSet = new Set(state[setName])
        if (isActive) {
          newSet.add(id)
        } else {
          newSet.delete(id)
          state.abortControllerMap.delete(id)
        }
        return { [setName]: newSet } as Partial<SliceState>
      })
    },

    stop: (id: string) => {
      set(state => {
        const newSet = new Set(state[setName])
        newSet.delete(id)
        state.abortControllerMap.get(id)?.current?.abort()
        state.abortControllerMap.delete(id)
        return { [setName]: newSet } as Partial<SliceState>
      })
    },
  } as SliceState)
}
