export const FREE_MODELS = process.env.NEXT_PUBLIC_FREE_MODEL_NAME?.split(",") || []
export const SOURCE_LANGUAGES = [
  { value: "japanese", label: "Japanese" },
  { value: "english", label: "English" },
  { value: "korean", label: "Korean" },
  { value: "chinese", label: "Chinese" },
  { value: "indonesian", label: "Indonesian" },
]

export const TARGET_LANGUAGES = [
  ...SOURCE_LANGUAGES
]
