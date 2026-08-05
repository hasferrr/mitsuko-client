import { describe, expect, test } from "bun:test"
import { createHash } from "node:crypto"
import {
  BlobSource,
  ADTS,
  EncodedPacketSink,
  Input,
  MP4,
  MP3,
  OGG,
  WEBM,
  type AudioCodec,
} from "mediabunny"
import { isAcceptedTranscriptionSelection, isVideoTranscriptionSelection } from "@/constants/transcription"
import { MediaPreparationError, prepareTranscriptionMedia } from "./prepare-transcription-media"
import {
  extractAudioFromVideo,
  getAudioMimeType,
  getAudioOutputFormat,
  replaceFileExtension,
} from "./extract-audio-from-video"

const fixtureFile = async (name: string, type: string) => {
  const fixture = Bun.file(`${import.meta.dir}/__fixtures__/${name}`)
  return new File([await fixture.arrayBuffer()], name, { type })
}

const readAudioPackets = async (file: File) => {
  const input = new Input({ source: new BlobSource(file), formats: [MP4, WEBM, OGG, ADTS, MP3] })
  try {
    const videoTracks = await input.getVideoTracks()
    const inputFormat = await input.getFormat()
    const audioTrack = await input.getPrimaryAudioTrack()
    if (!audioTrack) throw new Error("Expected an audio track")
    const codec = await audioTrack.getCodec()
    let firstTimestamp: number | null = null
    let finalTimestamp = 0
    const hashes: string[] = []
    for await (const packet of new EncodedPacketSink(audioTrack).packets()) {
      firstTimestamp ??= packet.timestamp
      finalTimestamp = Math.max(finalTimestamp, packet.timestamp + packet.duration)
      const adtsHeaderLength = (packet.data[1]! & 1) === 1 ? 7 : 9
      const encodedPayload = inputFormat === ADTS ? packet.data.subarray(adtsHeaderLength) : packet.data
      hashes.push(createHash("sha256").update(encodedPayload).digest("hex"))
    }
    const duration = firstTimestamp === null ? 0 : finalTimestamp - firstTimestamp
    return { codec, duration, hashes, videoTrackCount: videoTracks.length }
  } finally {
    input.dispose()
  }
}

describe("transcription file selector", () => {
  test.each([
    [{ name: "voice.mp3", type: "" }, true],
    [{ name: "voice.bin", type: "audio/flac" }, true],
    [{ name: "clip.MOV", type: "" }, true],
    [{ name: "clip.bin", type: "video/quicktime" }, true],
    [{ name: "clip.bin", type: "video/mp4" }, true],
    [{ name: "recording.webm", type: "audio/webm" }, true],
    [{ name: "movie.avi", type: "video/x-msvideo" }, false],
  ] as const)("accepts %p: %s", (file, expected) => {
    expect(isAcceptedTranscriptionSelection(file)).toBe(expected)
  })

  test.each([
    [{ name: "clip.mp4", type: "" }, true],
    [{ name: "clip.bin", type: "video/quicktime" }, true],
    [{ name: "recording.webm", type: "audio/webm" }, true],
    [{ name: "recording.m4a", type: "audio/mp4" }, false],
    [{ name: "voice.mp3", type: "audio/mpeg" }, false],
  ] as const)("identifies video selections %p: %s", (file, expected) => {
    expect(isVideoTranscriptionSelection(file)).toBe(expected)
  })
})

describe("audio output format selection", () => {
  test.each([
    ["aac", ".aac", "audio/aac"],
    ["opus", ".ogg", "audio/ogg"],
    ["vorbis", ".ogg", "audio/ogg"],
    ["mp3", ".mp3", "audio/mpeg"],
    ["flac", ".flac", "audio/flac"],
    ["pcm-s16", ".wav", "audio/wav"],
    ["ac3", ".mkv", "audio/x-matroska"],
    ["eac3", ".mkv", "audio/x-matroska"],
  ] as const)("maps %s to %s", (codec, extension, mimeType) => {
    const format = getAudioOutputFormat(codec)
    expect(format.fileExtension).toBe(extension)
    expect(getAudioMimeType(format)).toBe(mimeType)
  })

  test("replaces only the final filename extension", () => {
    expect(replaceFileExtension("episode.final.mp4", ".aac")).toBe("episode.final.aac")
    expect(replaceFileExtension("episode", ".ogg")).toBe("episode.ogg")
  })

  test("rejects codecs unsupported by the fallback container", () => {
    expect(() => getAudioOutputFormat("alac" as AudioCodec)).toThrow(MediaPreparationError)
    try {
      getAudioOutputFormat("alac" as AudioCodec)
    } catch (error) {
      expect(error).toBeInstanceOf(MediaPreparationError)
      expect((error as MediaPreparationError).code).toBe("unsupported-audio-codec")
    }
  })
})

describe("media preparation errors", () => {
  test("rejects an unsupported file", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "movie.avi", { type: "video/x-msvideo" })
    await expect(prepareTranscriptionMedia(file)).rejects.toMatchObject({ code: "unsupported-file" })
  })

  test("rejects a malformed supported container", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "movie.mp4", { type: "video/mp4" })
    await expect(prepareTranscriptionMedia(file)).rejects.toMatchObject({ code: "unsupported-container" })
  })

  test("rejects a video without audio", async () => {
    const file = await fixtureFile("no-audio.mp4", "video/mp4")
    await expect(prepareTranscriptionMedia(file)).rejects.toMatchObject({ code: "no-audio-track" })
  })

  test("honors an already-aborted signal", async () => {
    const controller = new AbortController()
    controller.abort()
    const file = new File([new Uint8Array([1])], "voice.mp3", { type: "audio/mpeg" })
    await expect(prepareTranscriptionMedia(file, { signal: controller.signal })).rejects.toMatchObject({ code: "aborted" })
  })

  test("cancels an extraction in progress", async () => {
    const controller = new AbortController()
    const file = await fixtureFile("opus-video.webm", "video/webm")
    const preparation = prepareTranscriptionMedia(file, {
      signal: controller.signal,
      onProgress: (progress) => {
        if (progress.stage === "extracting") controller.abort()
      },
    })
    await expect(preparation).rejects.toMatchObject({ code: "aborted" })
  })

  test("applies the size limit to direct audio", async () => {
    const file = await fixtureFile("direct.mp3", "application/octet-stream")
    await expect(prepareTranscriptionMedia(file, { maxFileSize: file.size - 1 })).rejects.toMatchObject({
      code: "output-too-large",
      actualSize: file.size,
    })
  })

  test("infers direct-audio MIME from the detected container", async () => {
    const file = await fixtureFile("direct.mp3", "application/octet-stream")
    const prepared = await prepareTranscriptionMedia(file)
    expect(prepared.wasExtracted).toBe(false)
    expect(prepared.file.type).toBe("audio/mpeg")
    expect(prepared.codec).toBe("mp3")
  })

  test("uses detected tracks instead of treating an audio-only MP4 as video", async () => {
    const file = await fixtureFile("direct.m4a", "video/mp4")
    const prepared = await prepareTranscriptionMedia(file)
    expect(prepared.wasExtracted).toBe(false)
    expect(prepared.file.name).toBe("direct.m4a")
    expect(prepared.file.type).toBe("audio/mp4")
    expect(prepared.codec).toBe("aac")
  })

  test("applies the size limit while extracting", async () => {
    const file = await fixtureFile("aac-video.mp4", "video/mp4")
    await expect(extractAudioFromVideo(file, { maxFileSize: 1 })).rejects.toMatchObject({ code: "output-too-large" })
  })
})

describe("packet-preserving extraction", () => {
  test.each([
    ["aac-video.mp4", "video/mp4", "aac", ".aac", "audio/aac"],
    ["opus-video.webm", "video/webm", "opus", ".ogg", "audio/ogg"],
  ] as const)("remuxes %s without changing encoded packet payloads", async (name, type, codec, extension, outputType) => {
    const inputFile = await fixtureFile(name, type)
    const before = await readAudioPackets(inputFile)
    const prepared = await prepareTranscriptionMedia(inputFile)
    const after = await readAudioPackets(prepared.file)

    expect(prepared.wasExtracted).toBe(true)
    expect(prepared.codec).toBe(codec)
    expect(prepared.file.name).toBe(replaceFileExtension(name, extension))
    expect(prepared.file.type).toBe(outputType)
    expect(after.videoTrackCount).toBe(0)
    expect(after.codec).toBe(before.codec)
    expect(after.hashes).toEqual(before.hashes)
    expect(after.hashes.length).toBeGreaterThan(0)
    expect(Math.abs(after.duration - before.duration)).toBeLessThan(0.05)
  })
})
