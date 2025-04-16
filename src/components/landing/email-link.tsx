"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { CONTACT_LINK } from "@/constants/external-links"

export default function EmailLink() {
  const [emailHref, setEmailHref] = useState<string>("#")
  const email = "pls_wait_for_a_sec@still_loading.com"

  const handleShowEmail = () => {
    if (emailHref === "#" || emailHref === `mailto:${email}`) {
      setEmailHref(`mailto:${email}`)
      setTimeout(() => {
        const decodedEmail = atob(atob(CONTACT_LINK))
        setEmailHref(`mailto:${decodedEmail}`)
      }, 50)
    }
  }

  return (
    <Button
      onFocus={handleShowEmail}
      onMouseEnter={handleShowEmail}
      onContextMenu={handleShowEmail}
      onTouchStart={handleShowEmail}
      asChild
    >
      <a href={emailHref} className="text-muted-foreground">
        <Mail className="mr-2 h-4 w-4" /> Email Us
      </a>
    </Button>
  )
}