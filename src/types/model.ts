import { AdvancedSettings } from "./project"

export type ModelProvider =
  | "google"
  | "anthropic"
  | "openai"
  | "mistral"
  | "deepseek"
  | "qwen"
  | "xai"
  | "unknown"

export type UsageLevel =
  | "very low"
  | "low"
  | "below medium"
  | "medium"
  | "above medium"
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
