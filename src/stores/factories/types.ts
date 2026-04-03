import type { RefObject } from "react"

export type ServiceSliceState<TSetName extends string> = {
  [K in TSetName]: Set<string>
} & {
  abortControllerMap: Map<string, RefObject<AbortController>>
}

export interface ServiceSliceActions {
  setActive: (id: string, isActive: boolean) => void
  stop: (id: string) => void
}
