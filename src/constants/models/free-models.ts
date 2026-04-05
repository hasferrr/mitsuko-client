import type { FreeModelCollection } from "./types"

export const RAW_FREE_MODELS: FreeModelCollection = {
  "Free Models": {
    provider: "unknown",
    models: [
      {
        name: "Gemini 3 Flash",
        subName: "gemini-3-flash-preview",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 3.1 Flash Lite",
        subName: "gemini-3.1-flash-lite-preview",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 2.5 Flash",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 2.5 Flash Lite",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 2.0 Flash",
        maxInput: 1_048_576,
        maxOutput: 8192,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "DeepSeek V3.2 (Thinking)",
        subName: "deepseek-v3.2 / deepseek-reasoner",
        maxInput: 131072,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: false
        }
      },
      {
        name: "DeepSeek V3.2",
        subName: "deepseek-v3.2 / deepseek-chat",
        maxInput: 131072,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "DeepSeek R1",
        subName: "deepseek-r1-0528",
        maxInput: 128000,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: false
        }
      },
    ]
  },
}
