"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Mail, MessageSquare, Send } from "lucide-react"
import { DISCORD_LINK, CONTACT_LINK } from "@/constants/external-links"
import { submitFeedback } from "@/lib/api/feedback"

type FeedbackType = "general" | "feature" | "bug" | "other"
type SendMethod = "app" | "email" | "discord"

interface FeedbackDialogProps {
  children: React.ReactNode
}

export function FeedbackDialog({ children }: FeedbackDialogProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general")
  const [feedback, setFeedback] = useState("")
  const [sendMethod, setSendMethod] = useState<SendMethod>("app")

  const reset = () => {
    setFeedbackType("general")
    setFeedback("")
    setSendMethod("app")
  }

  const getEmail = () => {
    try {
      return atob(atob(CONTACT_LINK))
    } catch (error) {
      console.error("Failed to decode email:", error)
      return "contact@example.com"
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.min(textarea.scrollHeight, 300)
      textarea.style.height = `${newHeight}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [feedback])

  useEffect(() => {
    if (isOpen) {
      setTimeout(adjustTextareaHeight, 0)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (sendMethod === "email") {
      const subject = `${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)} Feedback for Mitsuko`
      const body = feedback
      const email = getEmail()
      window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)

      toast.success("Email client opened", {
        description: "Please send the email to complete your feedback submission."
      })
      return
    }

    if (sendMethod === "discord") {
      window.open(DISCORD_LINK, "_blank")

      navigator.clipboard.writeText(feedback)
        .then(() => {
          toast.success("Feedback copied to clipboard", {
            description: "Please paste it in our Discord server's feedback channel."
          })
        })
        .catch(() => {
          toast.error("Couldn't copy to clipboard", {
            description: "Please manually copy your feedback before heading to Discord."
          })
        })

      return
    }

    setIsSubmitting(true)

    try {
      await submitFeedback(feedbackType, feedback.trim())

      setIsOpen(false)
      reset()

      toast.success("Thank you for your feedback! 🙌", {
        description: "We appreciate your input and will review it soon."
      })
    } catch (error) {
      console.error("Failed to submit feedback:", error)

      toast.error("Something went wrong", {
        description: "Your feedback couldn't be submitted. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const emailAddress = getEmail()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>✨ Share your feedback ✨</DialogTitle>
            <DialogDescription>
              Having any issues or suggestions? We'd love to hear from you! 😊
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">How would you like to send feedback?</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={sendMethod === "app" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSendMethod("app")}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  In App
                </Button>
                <Button
                  type="button"
                  variant={sendMethod === "email" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSendMethod("email")}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant={sendMethod === "discord" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSendMethod("discord")}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Discord
                </Button>
              </div>

              {sendMethod === "email" && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    This will open your email client with pre-populated feedback.
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Email: </span>
                    <a
                      href={`mailto:${emailAddress}`}
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {emailAddress}
                    </a>
                  </div>
                </div>
              )}

              {sendMethod === "discord" && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    This will copy your feedback and open our Discord server where you can paste it in the feedback channel.
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Discord: </span>
                    <a
                      href={DISCORD_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {DISCORD_LINK.replace("https://", "")}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Feedback type</div>
              <div className="flex flex-wrap gap-2">
                {(["general", "feature", "bug", "other"] as FeedbackType[]).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={feedbackType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeedbackType(type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Your feedback</div>
              <Textarea
                ref={textareaRef}
                placeholder="It would be great if..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px] max-h-[300px] overflow-y-auto transition-height duration-200"
                required={sendMethod === "app"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={(sendMethod === "app" && (!feedback || isSubmitting))}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting..." :
                sendMethod === "app" ? "Submit feedback" :
                  sendMethod === "email" ? "Open email client" :
                    "Open Discord"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}