"use client"

import { FeedbackDialog } from "@/components/feedback/feedback-dialog"
import { useSessionStore } from "@/stores/use-session-store"

interface FeedbackWrapperProps {
  children: React.ReactNode
}

export function FeedbackWrapper({ children }: FeedbackWrapperProps) {
  const session = useSessionStore(state => state.session)

  return (
    <>
      {session && (
        <FeedbackDialog>
          {children}
        </FeedbackDialog>
      )}
    </>
  )
}
