const PREFETCH_DISABLED_ROUTES = new Set([
  "/auth/login",
])

export function isRoutePrefetchDisabled(pathname: string | null): boolean {
  return pathname !== null && PREFETCH_DISABLED_ROUTES.has(pathname)
}
