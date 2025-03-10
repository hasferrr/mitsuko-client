import { sleep } from "./utils"

export const handleStream = async (
  setResponse: (buffer: string) => void,
  abortControllerRef: React.RefObject<AbortController>,
  requestUrl: string,
  requestHeader: Record<string, string>,
  requestBody: BodyInit,
  attempt: number = 0,
): Promise<string> => {
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
      headers: requestHeader,
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

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = new TextDecoder().decode(value)
      buffer += chunk
      setResponse(buffer)
    }

    if (!buffer.trim() && attempt < 3 && !abortControllerRef.current.signal.aborted) {
      console.log("Retrying...")
      await sleep(3000)
      return await handleStream(setResponse, abortControllerRef, requestUrl, requestHeader, requestBody, attempt + 1)
    }

    await sleep(500)
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
