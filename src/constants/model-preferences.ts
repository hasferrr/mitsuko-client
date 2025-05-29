let i = 0
export const priorityModels = new Map<string, number>([
  ["DeepSeek R1 0528", i++],
  ["DeepSeek V3 0324", i++],
  ["Gemini 2.5 Pro Preview 05-06", i++],
])

export const favoriteModels = new Set([
  "DeepSeek R1 0528",
])

export const highQualityModels = new Set([
  "Gemini 2.5 Pro Preview 05-06",
  "Claude 3.7 Sonnet",
  "GPT-4.1",
])

export const multiLingualModels = new Set([
  "Gemma 3 27B",
  "Gemini 1.5 Flash-8B",
  "Qwen3 235B A22B",
  "Qwen3 30B A3B",
  "Meta: Llama 4 Maverick",
  "Meta: Llama 4 Scout",
])
