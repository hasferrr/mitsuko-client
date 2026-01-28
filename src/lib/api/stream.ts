import * as Sentry from "@sentry/nextjs"
import posthog from "posthog-js"
import { supabase } from "../supabase"
import { fetchEventSource, EventStreamContentType } from "@microsoft/fetch-event-source"
import { formatReasoning } from "../format-reasoning"

interface handleStreamParams {
  setResponse: (buffer: string) => void,
  abortControllerRef: React.RefObject<AbortController>,
  isUseApiKey: boolean,
  apiKey: string,
  requestUrl: string,
  requestHeader: Record<string, string>,
  requestBody: BodyInit,
  isFormatReasoning?: boolean,
}

export const handleStream = async (params: handleStreamParams): Promise<string> => {
  const {
    setResponse,
    abortControllerRef,
    isUseApiKey,
    apiKey,
    requestUrl,
    requestHeader,
    requestBody,
    isFormatReasoning,
  } = params

  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    throw new Error("No access token found")
  }

  setResponse("")

  let buffer = ""
  let reasoning = ""
  let result = ""

  const processStreamData = (msg: { event?: string, data: string }) => {
    const { event, data } = msg
    if (!data) return

    let text = ""
    try {
      text = JSON.parse(data)?.text ?? ""
    } catch {
      text = data
    }
    if (!text) return

    if (event === "reasoning") {
      reasoning += text
    } else {
      result += text
    }

    if (reasoning.length > 0) {
      const reasoningText = isFormatReasoning
        ? formatReasoning(reasoning)
        : reasoning
      buffer = `<think>\n${reasoningText}\n</think>\n\n${result}`
    } else {
      buffer = result
    }
    setResponse(buffer)
  }

  try {
    await fetchEventSource(requestUrl, {
      method: "POST",
      headers: {
        ...requestHeader,
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        "api-key": isUseApiKey ? `Bearer ${apiKey}` : "",
      },
      body: requestBody,
      signal: abortControllerRef.current.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (response.ok && (response.headers.get("content-type") === EventStreamContentType || response.headers.get("content-type")?.startsWith(EventStreamContentType))) {
          return
        } else {
          try {
            const errorData = await response.clone().json()
            console.error("Error details from server:", errorData)
            throw new Error(`Request failed (${response.status}), ${JSON.stringify(errorData.details) || errorData.error || errorData.message}`)
          } catch {
            const errorText = await response.text()
            console.error("Error details from server (text):", errorText)
            throw new Error(`Request failed (${response.status}), ${errorText}`)
          }
        }
      },
      onmessage(msg) {
        if (!msg?.data) return
        processStreamData(msg)
      },
      onclose() { },
      onerror(err) {
        throw err
      }
    })

    if (!buffer.trim() && !abortControllerRef.current.signal.aborted) {
      throw new Error("Provider returned empty response, check your input content or try again")
    }

    abortControllerRef.current.abort()
    return buffer

  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Request aborted")
      setResponse(buffer + "\n\n[Generation stopped by user]")
    } else {
      console.error("Error:", error)
      Sentry.captureException(error)
      posthog.captureException(error)
      setResponse(buffer + `\n\n[An error occurred: ${error instanceof Error ? error.message : error}]`)
    }
    abortControllerRef.current.abort()
    throw error
  }
}
