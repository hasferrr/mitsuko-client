interface CompletionUser {
  role: "user"
  content: string
}

interface CompletionAssistant {
  role: "assistant"
  content: string
}

export type ContextCompletion = CompletionUser | CompletionAssistant
