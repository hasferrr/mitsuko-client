"use client"

import NextLink, { type LinkProps as NextLinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { forwardRef, type AnchorHTMLAttributes } from "react"
import { isRoutePrefetchDisabled } from "@/lib/route-prefetch-policy"

type RouteAwareLinkProps = NextLinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>

const Link = forwardRef<HTMLAnchorElement, RouteAwareLinkProps>(function Link({ prefetch, ...props }, ref) {
  const pathname = usePathname()
  const effectivePrefetch = isRoutePrefetchDisabled(pathname) ? false : prefetch

  return <NextLink ref={ref} prefetch={effectivePrefetch} {...props} />
})

export default Link
