import "posthog-js/dist/web-vitals"
import * as Sentry from "@sentry/nextjs"
import posthog from "posthog-js"
import { supabase } from "./lib/supabase"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.supabaseIntegration({
      supabaseClient: supabase,
    }),
  ],
  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/api/occurrunces',
  ui_host: 'https://us.posthog.com',
  defaults: '2025-11-30',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === 'development',
})
