"use client"

import Link from "next/link"
import posthog from "posthog-js"
import { forwardRef } from "react"
import type { ComponentPropsWithoutRef } from "react"

type TrackedLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  eventName?: string
  eventProperties?: Record<string, string | number | boolean | null | undefined>
}

export const TrackedLink = forwardRef<HTMLAnchorElement, TrackedLinkProps>(function TrackedLink({
  eventName,
  eventProperties,
  onClick,
  ...props
}, ref) {
  return (
    <Link
      {...props}
      ref={ref}
      onClick={(event) => {
        if (eventName) {
          posthog.capture(eventName, {
            href: typeof props.href === "string" ? props.href : props.href.toString(),
            ...eventProperties,
          })
        }
        onClick?.(event)
      }}
    />
  )
})
