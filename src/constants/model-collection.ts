import { Model, ModelProvider } from "@/types/model"
import { z } from "zod"

interface ModelGroup<T extends Model> {
  models: T[]
  provider: ModelProvider
}

type FreeModel = Omit<Model, "isPaid"> & { isPaid: false }
type PaidModel = Omit<Model, "isPaid"> & { isPaid: true }

type FreeModelCollection = Record<string, ModelGroup<FreeModel>>
type PaidModelCollection = Record<string, ModelGroup<PaidModel>>
type ModelCollection = Record<string, ModelGroup<Model>>

const csvToArray = z
  .string()
  .optional()
  .default("")
  .transform((str) => str.split(",").filter(Boolean).map((s) => s.trim()))

const EXCLUDE_FREE_MODELS = new Set(csvToArray.parse(process.env.NEXT_PUBLIC_EXCLUDE_FREE_MODELS))
const EXCLUDE_PAID_MODELS = new Set(csvToArray.parse(process.env.NEXT_PUBLIC_EXCLUDE_PAID_MODELS))

const excludeModelsByName = <T extends ModelCollection>(
  collection: T,
  excludeSet: Set<string>
): T => {
  const result: T = {} as T

  for (const key in collection) {
    if (Object.prototype.hasOwnProperty.call(collection, key)) {
      const group = collection[key]
      const filteredModels = group.models.filter(
        (model) => !excludeSet.has(model.name)
      )

      if (filteredModels.length > 0) {
        result[key as keyof T] = {
          ...group,
          models: filteredModels,
        }
      }
    }
  }

  return result
}

const RAW_FREE_MODELS: FreeModelCollection = {
  "Premium Trial": {
    provider: "unknown",
    models: [
      {
        name: "DeepSeek V3.2 Thinking",
        subName: "deepseek-v3.2 / deepseek-reasoner",
        maxInput: 131072,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 32768,
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
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 32768,
          isUseStructuredOutput: true
        }
      },
      {
        name: "DeepSeek R1",
        subName: "DeepSeek-R1-0528",
        maxInput: 128000,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 32768,
          isUseStructuredOutput: false
        }
      },
    ]
  },
  "Free Limited": {
    provider: "unknown",
    models: [
      {
        name: "Gemini 2.5 Flash",
        subName: "gemini-flash-latest\ngemini-2.5-flash-preview-09-2025",
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
        subName: "gemini-flash-lite-latest\ngemini-2.5-flash-lite-preview-09-2025",
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
        name: "DeepSeek R1 (free)",
        subName: "DeepSeek-R1-0528",
        maxInput: 163840,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
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
        usage: "N/A",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 64000,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Mistral Small 3",
        subName: "mistral-small-3.2-24b-instruct",
        maxInput: 128000,
        maxOutput: 128000,
        structuredOutput: true,
        isPaid: false,
        usage: "N/A",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
    ]
  },
}

const RAW_PAID_MODELS: PaidModelCollection = {
  Google: {
    provider: "google",
    models: [
      {
        name: "Gemini 3 Pro",
        subName: "gemini-3-pro-preview",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: true,
        usage: "high",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 3 Flash",
        subName: "gemini-3-flash-preview",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: true,
        usage: "medium",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 2.5 Pro",
        subName: "gemini-2.5-pro",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: true,
        usage: "high",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 2.5 Flash",
        subName: "gemini-flash-latest\ngemini-2.5-flash-preview-09-2025",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: true,
        usage: "medium",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Gemini 2.5 Flash Lite",
        subName: "gemini-flash-lite-latest\ngemini-2.5-flash-lite-preview-09-2025",
        maxInput: 1_048_576,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: true,
        usage: "very low",
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
        usage: "very low",
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
        name: "Claude 4.5 Sonnet",
        maxInput: 200_000,
        maxOutput: 64_000,
        structuredOutput: true,
        isPaid: true,
        usage: "very high",
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
        usage: "very high",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Claude 4.5 Haiku",
        maxInput: 200_000,
        maxOutput: 64_000,
        structuredOutput: true,
        isPaid: true,
        usage: "medium",
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
        usage: "medium",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
    ]
  },
  xAI: {
    provider: "xai",
    models: [
      {
        name: "Grok 4.1 Fast",
        maxInput: 2_000_000,
        maxOutput: 30_000,
        structuredOutput: true,
        isPaid: true,
        usage: "low",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Grok 4",
        maxInput: 256_000,
        maxOutput: 256_000,
        structuredOutput: true,
        isPaid: true,
        usage: "high",
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
        usage: "low",
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
        name: "GPT-5.2",
        maxInput: 400_000,
        maxOutput: 128_000,
        structuredOutput: true,
        isPaid: true,
        usage: "high",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "GPT-5.1",
        maxInput: 400_000,
        maxOutput: 128_000,
        structuredOutput: true,
        isPaid: true,
        usage: "high",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "GPT-5",
        maxInput: 400_000,
        maxOutput: 128_000,
        structuredOutput: true,
        isPaid: true,
        usage: "high",
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
        usage: "low",
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
        usage: "very low",
        default: {
          temperature: 1,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "OpenAI o3",
        maxInput: 200_000,
        maxOutput: 100_000,
        structuredOutput: true,
        isPaid: true,
        usage: "high",
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
        usage: "above medium",
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
        usage: "above medium",
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
        usage: "low",
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
        usage: "very low",
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
        usage: "above medium",
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
        usage: "low",
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
        subName: "mistral-medium-3.1",
        maxInput: 128000,
        maxOutput: 128000,
        structuredOutput: true,
        isPaid: true,
        usage: "below medium",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: true,
          isUseStructuredOutput: true
        }
      },
      {
        name: "Mistral Small 3",
        subName: "mistral-small-3.2-24b-instruct",
        maxInput: 128000,
        maxOutput: 128000,
        structuredOutput: true,
        isPaid: true,
        usage: "very low",
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
        usage: "very low",
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
        name: "Qwen3 235B A22B 2507",
        maxInput: 262000,
        maxOutput: 262000,
        structuredOutput: true,
        isPaid: true,
        usage: "low",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 16000,
          isUseStructuredOutput: true,
        }
      },
      {
        name: "Qwen3 30B A3B 2507",
        maxInput: 262000,
        maxOutput: 262000,
        structuredOutput: true,
        isPaid: true,
        usage: "very low",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 16000,
          isUseStructuredOutput: true,
        }
      },
    ]
  },
  DeepSeek: {
    provider: "deepseek",
    models: [
      {
        name: "DeepSeek V3.2 Thinking",
        subName: "deepseek-v3.2 / deepseek-reasoner",
        maxInput: 131072,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: true,
        usage: "low",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 32768,
          isUseStructuredOutput: false
        }
      },
      {
        name: "DeepSeek V3.2",
        subName: "deepseek-v3.2 / deepseek-chat",
        maxInput: 131072,
        maxOutput: 65536,
        structuredOutput: true,
        isPaid: true,
        usage: "low",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 32768,
          isUseStructuredOutput: true
        }
      },
      {
        name: "DeepSeek R1",
        subName: "DeepSeek-R1-0528",
        maxInput: 128000,
        maxOutput: 64000,
        structuredOutput: true,
        isPaid: true,
        usage: "medium",
        default: {
          temperature: 0.6,
          isMaxCompletionTokensAuto: false,
          maxCompletionTokens: 32768,
          isUseStructuredOutput: false
        }
      },
    ]
  },
}

export const FREE_MODELS = excludeModelsByName(RAW_FREE_MODELS, EXCLUDE_FREE_MODELS)
export const PAID_MODELS = excludeModelsByName(RAW_PAID_MODELS, EXCLUDE_PAID_MODELS)

export const MODEL_COLLECTION: ModelCollection = {
  ...PAID_MODELS,
  ...FREE_MODELS,
}
