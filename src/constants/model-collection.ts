import { ModelCollection } from "@/types/model"

export const FREE_MODELS: ModelCollection = {
  "Free Limited": [
    {
      name: "DeepSeek R1 (Base)",
      maxInput: 128000,
      maxOutput: 128000,
      structuredOutput: true,
      isPaid: false,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: false
      }
    },
    {
      name: "DeepSeek R1",
      maxInput: 163840,
      maxOutput: 163840,
      structuredOutput: true,
      isPaid: false,
      default: {
        isMaxCompletionTokensAuto: false,
        maxCompletionTokens: 163840,
        isUseStructuredOutput: false
      }
    },
    {
      name: "DeepSeek R1 (Slow)",
      maxInput: 163840,
      maxOutput: 163840,
      structuredOutput: true,
      isPaid: false,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: false
      }
    },
    {
      name: "DeepSeek V3",
      maxInput: 128000,
      maxOutput: 128000,
      structuredOutput: true,
      isPaid: false,
    }
  ],
  "Free Gemini Experimental": [
    {
      name: "Gemini 2.5 Pro Experimental 03-25",
      maxInput: 1000000,
      maxOutput: 65536,
      structuredOutput: true,
      isPaid: false,
    },
    {
      name: "Gemini 2.0 Flash Thinking Experimental 01-21",
      maxInput: 1000000,
      maxOutput: 65536,
      structuredOutput: false,
      isPaid: false,
    },
    {
      name: "Gemini 2.0 Flash Experimental",
      maxInput: 1000000,
      maxOutput: 8192,
      structuredOutput: true,
      isPaid: false,
    }
  ],
}

export const PAID_MODELS: ModelCollection = {
  OpenAI: [
    {
      name: "OpenAI o4-mini",
      maxInput: 1_047_576,
      maxOutput: 32_768,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: true
      }
    },
    {
      name: "OpenAI o3-mini",
      maxInput: 1_047_576,
      maxOutput: 32_768,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: true
      }
    },
    {
      name: "GPT-4.1",
      maxInput: 1_047_576,
      maxOutput: 32_768,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: true
      }
    },
    {
      name: "GPT-4.1 mini",
      maxInput: 1_047_576,
      maxOutput: 32_768,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: true
      }
    },
    {
      name: "GPT-4.1 nano",
      maxInput: 1_047_576,
      maxOutput: 32_768,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: true
      }
    },
  ],
  DeepSeek: [
    {
      name: "DeepSeek R1",
      maxInput: 163840,
      maxOutput: 163840,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: false,
        maxCompletionTokens: 163840,
        isUseStructuredOutput: false
      }
    },
    {
      name: "DeepSeek V3",
      maxInput: 128000,
      maxOutput: 128000,
      structuredOutput: true,
      isPaid: true,
    },
  ],
}
