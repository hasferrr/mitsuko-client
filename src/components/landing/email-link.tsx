"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useEmailLink } from "@/hooks/use-email-link"

export default function EmailLink() {
  const { emailHref, eventHandlers } = useEmailLink()

  return (
    <Button
      {...eventHandlers}
      asChild
    >
      <a href={emailHref} className="text-muted-foreground">
        <Mail className="mr-2 h-4 w-4" /> Email Us
      </a>
    </Button>
  )
}