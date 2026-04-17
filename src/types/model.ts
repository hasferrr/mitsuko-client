import { AdvancedSettings } from "./project"

export type ModelProvider =
  | "google"
  | "anthropic"
  | "openai"
  | "deepseek"
  | "xai"
  | "zai"
  | "unknown"

export type UsageLevel =
  | "very low"
  | "low"
  | "medium"
  | "high"
  | "very high"
  | "N/A"

export interface Model {
  name: string
  subName?: string
  maxInput: number
  maxOutput: number
  structuredOutput: boolean
  isPaid: boolean
  usage: UsageLevel
  isFormatReasoning?: boolean
  default?: Partial<Pick<AdvancedSettings,
    | 'temperature'
    | 'isUseStructuredOutput'
    | 'isMaxCompletionTokensAuto'
    | 'maxCompletionTokens'
  >>
}
