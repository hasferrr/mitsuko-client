"use client"

import { FeedbackButton } from "@/components/feedback/feedback-button"
import { useHistoryStore } from "@/stores/use-history-store"
import { useSessionStore } from "@/stores/use-session-store"

export function FeedbackWrapper() {
  const session = useSessionStore(state => state.session)
  const history = useHistoryStore(state => state.history)
  const isLoggedIn = !!session
  const isDashboard = history.length > 10

  return (
    <div className="fixed bottom-6 right-6 z-10 flex gap-2">
      {isLoggedIn && isDashboard && <FeedbackButton />}
    </div>
  )
}
