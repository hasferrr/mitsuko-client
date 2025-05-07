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
        isMaxCompletionTokensAuto: false,
        maxCompletionTokens: 128000,
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
      default: {
        isMaxCompletionTokensAuto: false,
        maxCompletionTokens: 128000,
        isUseStructuredOutput: true
      }
    },
  ],
  "Free Multilingual Model": [
    {
      name: "Qwen3 235B A22B",
      maxInput: 40000,
      maxOutput: 40000,
      structuredOutput: true,
      isPaid: false,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: false,
      }
    },
    {
      name: "Meta: Llama 4 Maverick",
      maxInput: 256000,
      maxOutput: 256000,
      structuredOutput: true,
      isPaid: false,
    },
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
      name: "Gemini 2.0 Flash Experimental",
      maxInput: 1000000,
      maxOutput: 8192,
      structuredOutput: true,
      isPaid: false,
    }
  ],
}

export const PAID_MODELS: ModelCollection = {
  Gemini: [
    {
      name: "Gemini 2.5 Pro Preview 05-06",
      maxInput: 1_048_576,
      maxOutput: 65536,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: true
      }
    },
    {
      name: "Gemini 2.5 Flash Preview 04-17",
      maxInput: 1_048_576,
      maxOutput: 65536,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: true
      }
    }
  ],
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
  Meta: [
    {
      name: "Meta: Llama 4 Maverick",
      maxInput: 1_048_576,
      maxOutput: 1_048_576,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: false,
        maxCompletionTokens: 1_000_000,
        isUseStructuredOutput: true,
      }
    },
    {
      name: "Meta: Llama 4 Scout",
      maxInput: 1_048_576,
      maxOutput: 1_048_576,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: false,
        maxCompletionTokens: 1_000_000,
        isUseStructuredOutput: true,
      }
    },
  ],
  Qwen: [
    {
      name: "Qwen3 235B A22B",
      maxInput: 40000,
      maxOutput: 40000,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: true,
        isUseStructuredOutput: false,
      }
    },
  ],
  DeepSeek: [
    {
      name: "DeepSeek R1",
      maxInput: 128000,
      maxOutput: 128000,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: false,
        maxCompletionTokens: 128000,
        isUseStructuredOutput: false
      }
    },
    {
      name: "DeepSeek V3",
      maxInput: 128000,
      maxOutput: 128000,
      structuredOutput: true,
      isPaid: true,
      default: {
        isMaxCompletionTokensAuto: false,
        maxCompletionTokens: 128000,
        isUseStructuredOutput: true
      }
    },
  ],
}

export const MODEL_COLLECTION: ModelCollection = {
  ...PAID_MODELS,
  ...FREE_MODELS,
}
