import type { MediaPreparationProgress, PreparedTranscriptionMedia } from "./prepare-transcription-media"
import { MediaPreparationError } from "./prepare-transcription-media"
import {
  BlobSource,
  ADTS,
  AdtsOutputFormat,
  EncodedAudioPacketSource,
  EncodedPacketSink,
  FLAC,
  FlacOutputFormat,
  Input,
  MATROSKA,
  MPEG_TS,
  MP3,
  MP4,
  MkvOutputFormat,
  Mp3OutputFormat,
  OGG,
  OggOutputFormat,
  Output,
  QTFF,
  StreamTarget,
  type StreamTargetChunk,
  WAVE,
  WavOutputFormat,
  WEBM,
  type AudioCodec,
  type OutputFormat,
} from "mediabunny"

export const getAudioMimeType = (format: Pick<OutputFormat, "mimeType">) => {
  return format.mimeType.replace(/^(?:application|video)\//, "audio/")
}

const createAudioOutputFormats = (): OutputFormat[] => [
  new AdtsOutputFormat(),
  new OggOutputFormat(),
  new Mp3OutputFormat(),
  new FlacOutputFormat(),
  new WavOutputFormat(),
  new MkvOutputFormat(),
]

export const getAudioOutputFormat = (codec: AudioCodec): OutputFormat => {
  const format = createAudioOutputFormats().find(candidate => (
    candidate.getSupportedAudioCodecs().includes(codec)
  ))
  if (!format) {
    throw new MediaPreparationError("unsupported-audio-codec", "Codec is not supported by the selected output container")
  }
  return format
}

export const replaceFileExtension = (fileName: string, extension: string) => {
  const lastSlash = Math.max(fileName.lastIndexOf("/"), fileName.lastIndexOf("\\"))
  const lastDot = fileName.lastIndexOf(".")
  const baseName = lastDot > lastSlash ? fileName.slice(0, lastDot) : fileName
  return `${baseName}${extension}`
}

interface ExtractAudioOptions {
  signal?: AbortSignal
  onProgress?: (progress: MediaPreparationProgress) => void
  maxFileSize: number
}

const INPUT_FORMATS = [MP4, QTFF, MATROSKA, WEBM, MPEG_TS, ADTS, FLAC, MP3, OGG, WAVE]

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new MediaPreparationError("aborted", "Media preparation was canceled")
  }
}

export const prepareMediaWithMediabunny = async (
  file: File,
  { signal, onProgress, maxFileSize }: ExtractAudioOptions,
): Promise<PreparedTranscriptionMedia> => {
  const input = new Input({
    source: new BlobSource(file),
    formats: INPUT_FORMATS,
  })
  let output: Output | null = null
  let finalized = false
  let writtenBytes = 0
  const abort = () => {
    input.dispose()
    if (output && output.state !== "canceled" && output.state !== "finalized") void output.cancel()
  }
  signal?.addEventListener("abort", abort, { once: true })

  try {
    throwIfAborted(signal)
    onProgress?.({ stage: "inspecting", percentage: null })

    let canRead = false
    try {
      canRead = await input.canRead()
    } catch {
      canRead = false
    }
    throwIfAborted(signal)
    if (!canRead) {
      throw new MediaPreparationError("unsupported-container", "Unsupported or malformed video container")
    }

    const inputFormat = await input.getFormat()
    const track = await input.getPrimaryAudioTrack()
    throwIfAborted(signal)
    if (!track) {
      throw new MediaPreparationError("no-audio-track", "Video has no audio track")
    }

    const codec = await track.getCodec()
    if (!codec) {
      throw new MediaPreparationError("unknown-audio-codec", "Audio codec is unknown")
    }
    const sink = new EncodedPacketSink(track)
    const firstPacket = await sink.getFirstPacket()
    throwIfAborted(signal)
    if (!firstPacket) {
      throw new MediaPreparationError("empty-audio-track", "Audio track contains no packets")
    }

    const trackEndTimestamp = await input.computeDuration([track])
    const firstTimestamp = firstPacket.timestamp
    const duration = Math.max(0, trackEndTimestamp - firstTimestamp)
    const videoTracks = await input.getVideoTracks()
    if (videoTracks.length === 0) {
      if (file.size > maxFileSize) {
        throw new MediaPreparationError("output-too-large", "Audio file exceeds the upload limit", file.size)
      }
      const mimeType = getAudioMimeType(inputFormat)
      const preparedFile = file.type === mimeType
        ? file
        : new File([file], file.name, { type: mimeType, lastModified: file.lastModified })
      return {
        file: preparedFile,
        duration,
        originalFileName: file.name,
        wasExtracted: false,
        codec,
      }
    }

    const outputFormat = getAudioOutputFormat(codec)
    const decoderConfig = await track.getDecoderConfig()
    if (!decoderConfig) {
      throw new MediaPreparationError("unknown-audio-codec", "Audio decoder configuration is unavailable")
    }
    let outputBlob = new Blob()
    const target = new StreamTarget(new WritableStream<StreamTargetChunk>({
      write: ({ data, position }) => {
        const end = position + data.byteLength
        if (end > maxFileSize) {
          throw new MediaPreparationError("output-too-large", "Extracted audio exceeds the upload limit", end)
        }

        const parts: BlobPart[] = [outputBlob.slice(0, position)]
        if (position > outputBlob.size) {
          parts.push(new Uint8Array(position - outputBlob.size))
        }
        parts.push(data)
        if (end < outputBlob.size) {
          parts.push(outputBlob.slice(end))
        }
        outputBlob = new Blob(parts)
      },
    }), { chunked: true })
    target.on("write", ({ end }) => {
      writtenBytes = Math.max(writtenBytes, end)
      if (writtenBytes > maxFileSize) abort()
    })

    output = new Output({ format: outputFormat, target })
    const source = new EncodedAudioPacketSource(codec)
    output.addAudioTrack(source)
    await output.start()

    let packetBytes = 0
    let packetCount = 0
    onProgress?.({ stage: "extracting", percentage: duration > 0 ? 0 : null })
    for await (const packet of sink.packets(firstPacket)) {
      throwIfAborted(signal)
      packetBytes += packet.byteLength
      if (packetBytes > maxFileSize || writtenBytes > maxFileSize) {
        throw new MediaPreparationError("output-too-large", "Extracted audio exceeds the upload limit", Math.max(packetBytes, writtenBytes))
      }

      const timestamp = Math.max(0, packet.timestamp - firstTimestamp)
      await source.add(
        packet.clone({ timestamp }),
        packetCount === 0 ? { decoderConfig } : undefined,
      )
      packetCount += 1
      const percentage = duration > 0
        ? Math.min(100, Math.max(0, ((packet.timestamp + packet.duration - firstTimestamp) / duration) * 100))
        : null
      onProgress?.({ stage: "extracting", percentage })
    }

    if (packetCount === 0) {
      throw new MediaPreparationError("empty-audio-track", "Audio track contains no packets")
    }
    throwIfAborted(signal)
    await output.finalize()
    finalized = true
    throwIfAborted(signal)

    if (outputBlob.size === 0) {
      throw new Error("Mediabunny finalized without producing output")
    }
    const extractedFile = new File(
      [outputBlob],
      replaceFileExtension(file.name, outputFormat.fileExtension),
      { type: getAudioMimeType(outputFormat), lastModified: file.lastModified },
    )
    if (extractedFile.size > maxFileSize) {
      throw new MediaPreparationError("output-too-large", "Extracted audio exceeds the upload limit", extractedFile.size)
    }
    onProgress?.({ stage: "extracting", percentage: 100 })

    return {
      file: extractedFile,
      duration,
      originalFileName: file.name,
      wasExtracted: true,
      codec,
    }
  } catch (error) {
    if (signal?.aborted) {
      throw new MediaPreparationError("aborted", "Media preparation was canceled")
    }
    if (error instanceof MediaPreparationError) throw error
    if (writtenBytes > maxFileSize) {
      throw new MediaPreparationError("output-too-large", "Extracted audio exceeds the upload limit", writtenBytes)
    }
    throw error
  } finally {
    signal?.removeEventListener("abort", abort)
    input.dispose()
    if (output && !finalized && output.state !== "canceled") await output.cancel().catch(() => undefined)
  }
}

export const extractAudioFromVideo = prepareMediaWithMediabunny
