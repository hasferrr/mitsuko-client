import {
  MAX_FILE_SIZE,
  isAcceptedTranscriptionSelection,
} from "@/constants/transcription"
import { calculateAudioDuration } from "@/lib/utils/audio"

export type MediaPreparationProgress =
  | { stage: "inspecting"; percentage: null }
  | { stage: "extracting"; percentage: number | null }

export interface PreparedTranscriptionMedia {
  file: File
  duration: number
  originalFileName: string
  wasExtracted: boolean
  codec?: string
}

export type MediaPreparationErrorCode =
  | "unsupported-file"
  | "unsupported-container"
  | "no-audio-track"
  | "empty-audio-track"
  | "unknown-audio-codec"
  | "unsupported-audio-codec"
  | "output-too-large"
  | "aborted"

export class MediaPreparationError extends Error {
  constructor(
    public readonly code: MediaPreparationErrorCode,
    message: string,
    public readonly actualSize?: number,
  ) {
    super(message)
    this.name = "MediaPreparationError"
  }
}

export const getMediaPreparationErrorMessage = (error: MediaPreparationError) => {
  switch (error.code) {
    case "unsupported-file":
      return "Please select a supported audio or video file."
    case "unsupported-container":
      return "Supported video formats are MP4, M4V, MOV, MKV, WebM, and MPEG-TS."
    case "no-audio-track":
      return "This video does not contain an audio track."
    case "empty-audio-track":
      return "This video contains an empty audio track."
    case "unknown-audio-codec":
    case "unsupported-audio-codec":
      return "This audio codec cannot be extracted without re-encoding."
    case "output-too-large": {
      const actualSize = error.actualSize
      const size = actualSize === undefined ? "The extracted audio" : `The extracted audio is ${(actualSize / 1024 / 1024).toFixed(2)} MB and`
      return `${size} exceeds the ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB limit.`
    }
    case "aborted":
      return "Media preparation was canceled."
  }
}

interface PrepareTranscriptionMediaOptions {
  signal?: AbortSignal
  onProgress?: (progress: MediaPreparationProgress) => void
  maxFileSize?: number
}

export const prepareTranscriptionMedia = async (
  file: File,
  options: PrepareTranscriptionMediaOptions = {},
): Promise<PreparedTranscriptionMedia> => {
  if (options.signal?.aborted) {
    throw new MediaPreparationError("aborted", "Media preparation was canceled")
  }

  if (!isAcceptedTranscriptionSelection(file)) {
    throw new MediaPreparationError("unsupported-file", "Unsupported transcription media")
  }

  const maxFileSize = options.maxFileSize ?? MAX_FILE_SIZE
  options.onProgress?.({ stage: "inspecting", percentage: null })
  const { prepareMediaWithMediabunny } = await import("./extract-audio-from-video")
  try {
    return await prepareMediaWithMediabunny(file, {
      signal: options.signal,
      onProgress: options.onProgress,
      maxFileSize,
    })
  } catch (error) {
    const canUseBrowserAudioFallback = error instanceof MediaPreparationError
      && error.code === "unsupported-container"
      && typeof Audio !== "undefined"
    if (!canUseBrowserAudioFallback) throw error
    if (file.size > maxFileSize) {
      throw new MediaPreparationError("output-too-large", "Audio file exceeds the upload limit", file.size)
    }
    const duration = await calculateAudioDuration(file)
    if (options.signal?.aborted) {
      throw new MediaPreparationError("aborted", "Media preparation was canceled")
    }
    if (duration <= 0) throw error
    return {
      file,
      duration,
      originalFileName: file.name,
      wasExtracted: false,
    }
  }
}
