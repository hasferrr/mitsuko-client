import { afterEach, beforeAll, describe, expect, test } from "bun:test"

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "http://localhost:54321"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-key"

let useTranscriptionStore: typeof import("@/stores/services/use-transcription-store").useTranscriptionStore

beforeAll(async () => {
  ({ useTranscriptionStore } = await import("@/stores/services/use-transcription-store"))
})

const resetLocalMediaState = () => {
  const state = useTranscriptionStore.getState()
  Object.values(state.audioUrls).forEach((url) => {
    if (url) URL.revokeObjectURL(url)
  })
  useTranscriptionStore.setState({
    files: {},
    audioUrls: {},
    fileDurations: {},
    localFileMetadata: {},
  })
}

afterEach(resetLocalMediaState)

describe("deferred transcription media state", () => {
  test("stores a selected source file as unprepared without probing duration", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "source.mp4", { type: "video/mp4" })

    await useTranscriptionStore.getState().setFileAndUrl("transcription", file, {
      knownDuration: 0,
      originalFileName: file.name,
      isPrepared: false,
      wasExtracted: false,
    })

    const state = useTranscriptionStore.getState()
    expect(state.files.transcription).toBe(file)
    expect(state.fileDurations.transcription).toBe(0)
    expect(state.localFileMetadata.transcription).toEqual({
      originalFileName: "source.mp4",
      isPrepared: false,
      wasExtracted: false,
      codec: undefined,
    })
  })

  test("marks existing callers and prepared replacements as prepared", async () => {
    const source = new File([new Uint8Array([1])], "source.mp4", { type: "video/mp4" })
    const extracted = new File([new Uint8Array([2])], "source.aac", { type: "audio/aac" })
    const store = useTranscriptionStore.getState()

    await store.setFileAndUrl("default", source, { knownDuration: 10 })
    await store.setFileAndUrl("replacement", extracted, {
      knownDuration: 9.5,
      originalFileName: source.name,
      isPrepared: true,
      wasExtracted: true,
      codec: "aac",
    })

    const state = useTranscriptionStore.getState()
    expect(state.localFileMetadata.default?.isPrepared).toBe(true)
    expect(state.localFileMetadata.replacement).toEqual({
      originalFileName: "source.mp4",
      isPrepared: true,
      wasExtracted: true,
      codec: "aac",
    })
    expect(state.fileDurations.replacement).toBe(9.5)
  })
})
