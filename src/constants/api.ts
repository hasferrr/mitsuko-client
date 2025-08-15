const url = process.env.NEXT_PUBLIC_API_URL
const tscUrl = process.env.NEXT_PUBLIC_TRANSCRIPTION_API_URL || url

const BASE_URL = url?.endsWith("/") ? url.slice(0, url.length - 1) : url
const BASE_TRANSCRIPT_URL = tscUrl?.endsWith("/") ? tscUrl.slice(0, tscUrl.length - 1) : tscUrl

export const TRANSLATE_URL = `${BASE_URL}/api/stream/translate`
export const TRANSLATE_URL_FREE = `${BASE_URL}/api/stream/translate-free`
export const TRANSLATE_URL_PAID = `${BASE_URL}/api/stream/translate-paid`

export const EXTRACT_CONTEXT_URL = `${BASE_URL}/api/stream/extract-context`
export const EXTRACT_CONTEXT_URL_FREE = `${BASE_URL}/api/stream/extract-context-free`
export const EXTRACT_CONTEXT_URL_PAID = `${BASE_URL}/api/stream/extract-context-paid`

export const TRANSCRIPT_URL = `${BASE_TRANSCRIPT_URL}/api/stream/transcript`

export const SUBTITLE_LOG_URL = `${BASE_URL}/api/subtitle-log`
export const MODEL_PRICES_URL = `${BASE_URL}/api/model-prices`
export const FEEDBACK_URL = `${BASE_URL}/api/feedback`

export const PAYMENT_CREATE_SNAP_URL = `${BASE_URL}/api/payment/create-snap`
export const PAYMENT_CREATE_LEMONSQUEEZY_URL = `${BASE_URL}/api/payment/create-checkout`

export const TRANSCRIPTION_LOG_LIST_URL = `${BASE_URL}/api/transcription-log`
export const TRANSCRIPTION_LOG_RESULT_URL = `${BASE_URL}/api/transcription-log/result`
export const TRANSCRIPTION_LOG_DELETE_URL = `${BASE_URL}/api/transcription-log/delete`

export const UPLOADS_SIGNED_URL = `${BASE_URL}/api/uploads/signed-url`
export const UPLOADS_COMPLETE_URL = `${BASE_URL}/api/uploads/complete`
export const UPLOADS_LIST_URL = `${BASE_URL}/api/uploads/list`
export const UPLOADS_DELETE_URL = `${BASE_URL}/api/uploads/delete`
