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

export interface Model {
  name: string
  subName?: string
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
