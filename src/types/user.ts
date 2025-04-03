export type UserTier = "free" | "basic" | "pro"

export interface UserData {
  id: string
  created_at: string
  credit: number
  tier: UserTier
}
