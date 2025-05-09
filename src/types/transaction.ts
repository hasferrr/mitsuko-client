export type TransactionEvent =
  | "PURCHASE_TOKENS"
  | "TRANSLATION_REQUEST"
  | "EXTRACTION_REQUEST"
  | "TRANSCRIPTION_REQUEST"
  | "REFUND"
  | "ADMIN_ADJUSTMENT"
  | "BETA_TEST"

export interface Transaction {
  id: string
  user_id: string
  amount: number
  event: TransactionEvent
  created_at: string
}