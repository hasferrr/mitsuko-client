import { ModelMap } from "@/types/types"

export const FREE_MODELS: ModelMap = new Map()

FREE_MODELS.set("Free Models", [
  {
    name: "DeepSeek R1 (Free)",
    maxInput: 163_000,
    maxOutput: 163_000,
    structuredOutput: true,
  },
])

FREE_MODELS.set("Limited", [
  {
    name: "DeepSeek R1 (Base)",
    maxInput: 128_000,
    maxOutput: 128_000,
    structuredOutput: true,
  },
  {
    name: "DeepSeek R1",
    maxInput: 128_000,
    maxOutput: 128_000,
    structuredOutput: true,
  },
  {
    name: "DeepSeek V3",
    maxInput: 131_000,
    maxOutput: 131_000,
    structuredOutput: true,
  },
])

FREE_MODELS.set("Gemini", [
  {
    name: "Gemini 2.0 Pro Experimental 02-05",
    maxInput: 2_000_000,
    maxOutput: 8_192,
    structuredOutput: true,
  },
  {
    name: "Gemini 2.0 Flash Thinking Experimental 01-21",
    maxInput: 1_000_000,
    maxOutput: 65_536,
    structuredOutput: false,
  },
])
