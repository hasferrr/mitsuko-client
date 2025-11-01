export type TransactionEvent =
  | "PURCHASE_TOKENS"
  | "TRANSLATION_REQUEST"
  | "EXTRACTION_REQUEST"
  | "TRANSCRIPTION_REQUEST"
  | "REFUND"
  | "ADJUSTMENT"
  | "BETA_TEST"
  | "EXPIRED"

export interface Transaction {
  id: string
  user_id: string
  amount: number
  event: TransactionEvent
  description: string | null
  created_at: string
}