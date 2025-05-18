import { AdvancedSettings } from "./project"

export interface Model {
  name: string
  maxInput: number
  maxOutput: number
  structuredOutput: boolean
  isPaid: boolean
  default?: Partial<Pick<AdvancedSettings,
    | 'temperature'
    | 'isUseStructuredOutput'
    | 'isMaxCompletionTokensAuto'
    | 'maxCompletionTokens'
  >>
}

export type ModelCollection = Record<string, Model[]>
