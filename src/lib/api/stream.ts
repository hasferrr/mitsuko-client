import { sleep } from "../utils"
import { supabase } from "../supabase"

interface handleStreamParams {
  setResponse: (buffer: string) => void,
  abortControllerRef: React.RefObject<AbortController>,
  isUseApiKey: boolean,
  apiKey: string,
  requestUrl: string,
  requestHeader: Record<string, string>,
  requestBody: BodyInit,
  attempt?: number,
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
    attempt = 0,
  } = params

  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    throw new Error("No access token found")
  }

  setResponse("")

  if (!abortControllerRef.current.signal.aborted) {
    abortControllerRef.current.abort()
    await sleep(1000)
  }
  abortControllerRef.current = new AbortController()

  let buffer = ""
  try {
    const res = await fetch(requestUrl, {
      method: "POST",
      headers: {
        ...requestHeader,
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        "api-key": isUseApiKey ? `Bearer ${apiKey}` : "",
      },
      body: requestBody,
      signal: abortControllerRef.current.signal,
    })

    if (!res.ok) {
      try {
        const errorData = await res.clone().json()
        console.error("Error details from server:", errorData)
        throw new Error(`Request failed (${res.status}), ${JSON.stringify(errorData.details) || errorData.error || errorData.message}`)
      } catch {
        const errorText = await res.text()
        console.error("Error details from server (text):", errorText)
        throw new Error(`Request failed (${res.status}), ${errorText}`)
      }
    }

    const reader = res.body?.getReader()
    if (!reader) {
      return ""
    }

    // Reasoning tags
    const rStart = "<r>"
    const rEnd = "</r>"

    let reasoning = ""
    let result = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      let chunk = new TextDecoder().decode(value)

      while (chunk.length > 0) {
        const rStartIndex = chunk.indexOf(rStart)
        if (rStartIndex === -1) {
          result += chunk
          chunk = ""
          continue
        }
        if (rStartIndex > 0) {
          result += chunk.slice(0, rStartIndex)
        }
        const rEndIndex = chunk.indexOf(rEnd, rStartIndex + rStart.length)
        if (rEndIndex === -1) {
          result += chunk.slice(rStartIndex)
          chunk = ""
          continue
        }

        const extractedReasoning = chunk.slice(rStartIndex + rStart.length, rEndIndex)
        reasoning += extractedReasoning

        chunk = chunk.slice(rEndIndex + rEnd.length)
      }

      if (reasoning.length > 0) {
        buffer = `<think>\n${reasoning}\n</think>\n\n${result}`
      } else {
        buffer = result
      }

      setResponse(buffer)
    }

    if (!buffer.trim() && attempt < 3 && !abortControllerRef.current.signal.aborted) {
      console.log("Retrying...")
      await sleep(3000)
      return await handleStream({ ...params, attempt: attempt + 1 })
    }

    abortControllerRef.current.abort()
    return buffer

  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Request aborted")
      setResponse(buffer + "\n\n[Generation stopped by user]")
    } else {
      console.error("Error:", error)
      setResponse(buffer + `\n\n[An error occurred: ${error instanceof Error ? error.message : error}]`)
    }
    abortControllerRef.current.abort()
    throw error
  }
}
