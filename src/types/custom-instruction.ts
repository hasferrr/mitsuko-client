export interface CustomInstruction {
  id: string
  name: string
  content: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CustomInstructionOrder {
  id: string
  order: string[]
  createdAt: Date
  updatedAt: Date
}