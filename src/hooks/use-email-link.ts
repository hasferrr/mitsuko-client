"use client"

import { useState, useCallback } from 'react'
import { CONTACT_LINK } from "@/constants/external-links"

const email = "pls_wait_for_a_sec@still_loading.com"

export function useEmailLink() {
  const [emailHref, setEmailHref] = useState<string>("#")

  const handleShowEmail = useCallback(() => {
    if (emailHref === "#" || emailHref === `mailto:${email}`) {
      setEmailHref(`mailto:${email}`)
      setTimeout(() => {
        const decodedEmail = atob(atob(CONTACT_LINK))
        setEmailHref(`mailto:${decodedEmail}`)
      }, 50)
    }
  }, [emailHref])

  const eventHandlers = {
    onFocus: handleShowEmail,
    onMouseEnter: handleShowEmail,
    onContextMenu: handleShowEmail,
    onTouchStart: handleShowEmail,
  }

  return { emailHref, eventHandlers }
}