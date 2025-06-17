let i = 0
export const priorityModels = new Map<string, number>([
  ["DeepSeek R1", i++],
  ["DeepSeek V3", i++],
  ["Gemini 2.5 Pro", i++],
])

export const favoriteModels = new Set([
  "DeepSeek R1",
  "Gemini 2.5 Flash",
])

export const highQualityModels = new Set([
  "Gemini 2.5 Pro",
  "Claude 3.7 Sonnet",
  "GPT-4.1",
])

export const multiLingualModels = new Set([
  "Gemma 3 27B",
  "Gemini 1.5 Flash-8B",
  "Qwen3 235B A22B",
  "Qwen3 30B A3B",
  "Llama 4 Maverick",
  "Llama 4 Scout",
  "Llama 3.3 70B",
  "Llama 3.1 405B",
])
