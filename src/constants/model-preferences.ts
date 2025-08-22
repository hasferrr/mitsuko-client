let i = 0
export const priorityModels = new Map<string, number>([
  ["DeepSeek R1", i++],
  ["DeepSeek R1 (Fast)", i++],
  ["DeepSeek V3.1", i++],
  ["DeepSeek V3", i++],
])

export const favoriteModels = new Set([
  "DeepSeek R1",
  "Gemini 2.5 Flash",
])

export const highQualityModels = new Set([
  "Gemini 2.5 Pro",
  "Claude 3.7 Sonnet",
  "GPT-5",
])
