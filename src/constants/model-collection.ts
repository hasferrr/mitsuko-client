import { Model, ModelProvider } from "@/types/model"

type FreeModel = Omit<Model, "isPaid"> & { isPaid: false }
type PaidModel = Omit<Model, "isPaid"> & { isPaid: true }

interface ModelGroup<T extends Model> {
  models: T[]
  provider: ModelProvider
}

type FreeModelCollection = Record<string, ModelGroup<FreeModel>>
type PaidModelCollection = Record<string, ModelGroup<PaidModel>>
type ModelCollection = Record<string, ModelGroup<Model>>

export const FREE_MODELS: FreeModelCollection = {
  "Premium Trial": {
    provider: "unknown",
    models: [
      {
        name: "DeepSeek R1",
        subName: "DeepSeek-R1-0528",
        maxInput: 128000,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: false,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 64000,
          isUseStructuredOutput: false
        }
      },
      {
        name: "DeepSeek V3",
        subName: "DeepSeek-V3-0324",
        maxInput: 128000,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: false,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 64000,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Qwen3 235B A22B",
        maxInput: 40000,
        maxOutput: 40000,
        structuredOutput: true,
        isPaid: false,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 16000,
          isUseStructuredOutput: false,
        }
      },
    ]
  },
  "Free Limited": {
    provider: "unknown",
    models: [
      {
        name: "Gemini 2.5 Pro",
        subName: "gemini-2.5-pro",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: false,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 2.5 Flash",
        subName: "gemini-2.5-flash",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: false,
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
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Mistral Small 3",
        subName: "Mistral Small 3.2 24B",
        maxInput: 128000,
        maxOutput: 128000,
        structuredOutput: true,
        isPaid: false,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Mistral Nemo",
        maxInput: 128000,
        maxOutput: 128000,
        structuredOutput: true,
        isPaid: false,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "DeepSeek R1 (free)",
        subName: "DeepSeek-R1-0528",
        maxInput: 163840,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: false,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 64000,
          isUseStructuredOutput: false
        }
      },
      {
        name: "DeepSeek V3 (free)",
        subName: "DeepSeek-V3-0324",
        maxInput: 128000,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: false,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 64000,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Qwen3 235B A22B (free)",
        maxInput: 40000,
        maxOutput: 40000,
        structuredOutput: true,
        isPaid: false,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true,
        }
      },
      {
        name: "Qwen3 30B A3B (free)",
        maxInput: 40000,
        maxOutput: 40000,
        structuredOutput: true,
        isPaid: false,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true,
        }
      },
    ]
  },
}

export const PAID_MODELS: PaidModelCollection = {
  Google: {
    provider: "google",
    models: [
      {
        name: "Gemini 2.5 Pro",
        subName: "gemini-2.5-pro",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 2.5 Flash",
        subName: "gemini-2.5-flash",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 2.5 Flash Lite",
        subName: "gemini-2.5-flash-lite-preview-06-17",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: true,
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
        isPaid: true,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 1.5 Flash-8B",
        maxInput: 1_000_000,
        maxOutput: 8192,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
    ]
  },
  Anthropic: {
    provider: "anthropic",
    models: [
      {
        name: "Claude 4 Sonnet",
        maxInput: 200_000,
        maxOutput: 64_000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Claude 3.7 Sonnet",
        maxInput: 200_000,
        maxOutput: 64_000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Claude 3.5 Sonnet",
        maxInput: 200_000,
        maxOutput: 8_129,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Claude 3.5 Haiku",
        maxInput: 200_000,
        maxOutput: 8_129,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      }
    ]
  },
  xAI: {
    provider: "xai",
    models: [
      {
        name: "Grok 4",
        maxInput: 256_000,
        maxOutput: 256_000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Grok 3",
        maxInput: 131_072,
        maxOutput: 131_072,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Grok 3 Mini",
        maxInput: 131_072,
        maxOutput: 131_072,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      }
    ]
  },
  OpenAI: {
    provider: "openai",
    models: [
      {
        name: "GPT-5",
        maxInput: 400_000,
        maxOutput: 128_000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "GPT-5 mini",
        maxInput: 400_000,
        maxOutput: 128_000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "GPT-5 nano",
        maxInput: 400_000,
        maxOutput: 128_000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "OpenAI o4-mini",
        maxInput: 200_000,
        maxOutput: 100_000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "OpenAI o3-mini",
        maxInput: 200_000,
        maxOutput: 100_000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 1,
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
          temperature: 1,
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
          temperature: 1,
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
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "GPT-4o",
        maxInput: 128_000,
        maxOutput: 16_384,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "GPT-4o mini",
        maxInput: 128_000,
        maxOutput: 16_384,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
    ]
  },
  Mistral: {
    provider: "mistral",
    models: [
      {
        name: "Mistral Medium 3",
        maxInput: 128000,
        maxOutput: 128000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Mistral Small 3",
        subName: "Mistral Small 3.2 24B",
        maxInput: 128000,
        maxOutput: 128000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Mistral Nemo",
        maxInput: 128000,
        maxOutput: 128000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      }
    ]
  },
  Qwen: {
    provider: "qwen",
    models: [
      {
        name: "Qwen3 235B A22B",
        maxInput: 40000,
        maxOutput: 40000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 16000,
          isUseStructuredOutput: false,
        }
      },
      {
        name: "Qwen3 30B A3B",
        maxInput: 40000,
        maxOutput: 40000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 16000,
          isUseStructuredOutput: false,
        }
      },
    ]
  },
  DeepSeek: {
    provider: "deepseek",
    models: [
      {
        name: "DeepSeek R1",
        subName: "DeepSeek-R1-0528",
        maxInput: 128000,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 64000,
          isUseStructuredOutput: false
        }
      },
      {
        name: "DeepSeek R1 (Fast)",
        subName: "DeepSeek-R1-0528⚡\nIf fast version not available, routed to normal version",
        maxInput: 128000,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 64000,
          isUseStructuredOutput: true
        }
      },
      {
        name: "DeepSeek V3",
        subName: "DeepSeek-V3-0324",
        maxInput: 128000,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: true,
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 64000,
          isUseStructuredOutput: true
        }
      },
    ]
  },
}

export const MODEL_COLLECTION: ModelCollection = {
  ...PAID_MODELS,
  ...FREE_MODELS,
}
