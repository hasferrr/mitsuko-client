const url = process.env.NEXT_PUBLIC_API_URL
export const BASE_URL = url?.endsWith("/") ? url.slice(0, url.length - 1) : url

export const TRANSLATE_URL = `${BASE_URL}/api/stream/translate`
export const TRANSLATE_URL_FREE = `${BASE_URL}/api/stream/translate-free`
export const TRANSLATE_URL_PAID = `${BASE_URL}/api/stream/translate-paid`

export const EXTRACT_CONTEXT_URL = `${BASE_URL}/api/stream/extract-context`
export const EXTRACT_CONTEXT_URL_FREE = `${BASE_URL}/api/stream/extract-context-free`
export const EXTRACT_CONTEXT_URL_PAID = `${BASE_URL}/api/stream/extract-context-paid`

export const TRANSCRIPT_URL = `${BASE_URL}/api/stream/transcript`

export const SUBTITLE_LOG_URL = `${BASE_URL}/api/subtitle-log`
export const MODEL_PRICES_URL = `${BASE_URL}/api/model-prices`
