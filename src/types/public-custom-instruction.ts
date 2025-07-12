export interface PublicCustomInstructionShort {
  id: string
  name: string
  preview: string
  created_at: string
}

export interface PublicCustomInstruction extends PublicCustomInstructionShort {
  content: string
}