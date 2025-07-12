export interface PublicCustomInstructionShort {
  id: string
  name: string
  preview: string
  created_at: string
  user_id: string
}

export interface PublicCustomInstruction extends PublicCustomInstructionShort {
  content: string
}