export type UserTier = "free" | "basic" | "basic+" | "pro" | (string & {})

export interface UserCreditData {
  credit: number
  tier: UserTier
}
