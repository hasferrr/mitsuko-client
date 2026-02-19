let i = 0
export const priorityModels = new Map<string, number>([
  ["DeepSeek R1", i++],
  ["DeepSeek V3.2 (Thinking)", i++],
  ["DeepSeek V3.2", i++],
  ["DeepSeek V3.1", i++],
  ["DeepSeek V3", i++],
])

export const favoriteModels = new Set([
  "DeepSeek R1",
  "Gemini 2.0 Flash",
  "GPT-5",
])

export const highQualityModels = new Set([
  "Gemini 2.5 Pro",
  "Gemini 3 Pro",
  "Gemini 3.1 Pro",
  "Claude 4.5 Sonnet",
  "GPT-5",
  "GPT-5.2",
])
