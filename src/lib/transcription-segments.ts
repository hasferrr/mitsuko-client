// --- Interfaces ---

interface Word {
  word: string
  start: number
  end: number
}

interface Segment {
  start: number
  end: number
  text: string
}

interface TranscriptData {
  words: Word[]
  segments: Segment[]
}

interface SubtitleBlock {
  index: number
  start: number
  end: number
  text: string
  cps: number
}

// --- Configuration ---

const CONFIG = {
  // Max gap between words (in seconds) to consider them part of the same phrase.
  // If silence > 0.5s, we split.
  MAX_SILENCE_GAP: 0.5,

  // Character Per Second (CPS) Targets (excluding punctuation)
  TARGET_CPS: 16,
  MAX_CPS: 22,

  // Fallback limits to ensure text fits on screen
  MAX_CHARS: 85, // roughly 2 lines of 42 chars
  MIN_DURATION: 1.0, // Try not to make subtitles shorter than 1s
}

type SubtitleConfig = typeof CONFIG

// --- Helpers ---

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms
      .toString()
      .padStart(3, "0")}`
}

// Remove punctuation to calculate "reading" characters
function getCleanCharCount(text: string): number {
  return text.replace(/[.,/#!$%^&*:{}=\-_`~()?"'。？！]/g, "").length
}

// Check if a word implies a sentence break
function isSentenceEnd(text: string): boolean {
  return /[.!?。？！]["'」』】》）]?$/.test(text.trim())
}

// Get words strictly within a segment's time range
function getWordsInSegment(words: Word[], segment: Segment): Word[] {
  // Using a tiny epsilon (0.05) to catch boundary words
  return words.filter(
    (w) => w.start >= segment.start - 0.05 && w.end <= segment.end + 0.05
  )
}

// --- Core Logic ---

/**
 * Stage 1: Group words by Silence gaps.
 * This ensures we never bridge a subtitle across a long silence.
 */
function createAudioIslands(words: Word[], config: SubtitleConfig): Word[][] {
  const groups: Word[][] = []
  if (words.length === 0) return groups

  let currentGroup: Word[] = [words[0]]

  for (let i = 1; i < words.length; i++) {
    const prevWord = words[i - 1]
    const currWord = words[i]
    const gap = currWord.start - prevWord.end

    if (gap > config.MAX_SILENCE_GAP) {
      groups.push(currentGroup)
      currentGroup = []
    }
    currentGroup.push(currWord)
  }
  groups.push(currentGroup)
  return groups
}

/**
 * Stage 2: Split an Audio Island into Subtitles based on CPS and Length.
 */
function processIsland(island: Word[], startIndex: number, config: SubtitleConfig): SubtitleBlock[] {
  const results: SubtitleBlock[] = []
  let buffer: Word[] = []

  for (let i = 0; i < island.length; i++) {
    const word = island[i]
    buffer.push(word)

    // Predict metrics if we stopped here
    const currentText = buffer.map((w) => w.word).join("").trim()
    const cleanChars = getCleanCharCount(currentText)
    const startTime = buffer[0].start
    const endTime = buffer[buffer.length - 1].end
    const duration = Math.max(0.1, endTime - startTime) // avoid div/0
    const currentCPS = cleanChars / duration

    // Look ahead to next word to see if we MUST split or SHOULD split
    const nextWord = island[i + 1]

    let shouldSplit = false

    // Condition A: End of the island (no more words)
    if (!nextWord) {
      shouldSplit = true
    } else {
      // Metrics with next word included
      const nextTextLen = nextWord.word.length
      const predictedLen = currentText.length + nextTextLen

      // Condition B: Hard Max Chars (Screen width overflow)
      const overflow = predictedLen > config.MAX_CHARS

      // Condition C: Sentence Ending Punctuation preference
      // We only split at punctuation if the current block is "meaty" enough (>1s or >10 chars)
      // to avoid stranding single words like "No." on a line if "No." is followed immediately by speech.
      const naturalBreak =
        isSentenceEnd(word.word) && (duration > 1.0 || cleanChars > 15)

      // Condition D: CPS Overflow (Reading speed too high)
      // If adding the next word makes CPS skyrocket AND we already have a decent chunk of text.
      const cpsHigh = currentCPS > config.MAX_CPS && cleanChars > 20

      if (overflow || (naturalBreak && !cpsHigh) || cpsHigh) {
        shouldSplit = true
      }
    }

    if (shouldSplit) {
      results.push({
        index: startIndex + results.length,
        start: startTime,
        end: endTime,
        text: currentText,
        cps: parseFloat(currentCPS.toFixed(1)),
      })
      buffer = []
    }
  }

  return results
}

export function generateWordsSubtitles(data: TranscriptData, configOverrides?: Partial<SubtitleConfig>): string {
  const config: SubtitleConfig = { ...CONFIG, ...configOverrides }
  const finalSubtitles: SubtitleBlock[] = []
  let globalIndex = 1

  // 1. Iterate over AI Segments (Macro boundaries)
  for (const segment of data.segments) {
    const segmentWords = getWordsInSegment(data.words, segment)
    if (segmentWords.length === 0) continue

    // 2. Break segment into "Islands" based on Silence Gaps
    const islands = createAudioIslands(segmentWords, config)

    // 3. Process each Island based on CPS/Length
    for (const island of islands) {
      const subs = processIsland(island, globalIndex, config)
      finalSubtitles.push(...subs)
      globalIndex += subs.length
    }
  }

  return finalSubtitles
    .map(
      (sub) =>
        `${sub.index}\n${formatTimestamp(sub.start)} --> ${formatTimestamp(
          sub.end
        )}\n${sub.text}`
    )
    .join("\n\n")
}

export function generateSegmentsTranscription(segments: Segment[]): string {
  if (!segments?.length) return ""

  return segments
    .map((segment, index) => {
      return `${index + 1}\n` +
        `${formatTimestamp(segment.start)} --> ${formatTimestamp(segment.end)}\n` +
        `${segment.text}`
    })
    .join("\n\n")
}

// --- Execution ---

// async function main() {
//   const inputPath = process.argv[2] || "input.json"
//   const outputPath = process.argv[3] || "output.srt"

//   console.log(`Reading from ${inputPath}...`)
//   const jsonData: TranscriptData = await Bun.file(inputPath).json()

//   console.log(`Processing with Target CPS: ${CONFIG.TARGET_CPS} (Max: ${CONFIG.MAX_CPS})...`)

//   const srtContent = generateSmartSubtitles(jsonData)

//   await Bun.write(outputPath, srtContent)
//   console.log(`Saved SRT to ${outputPath}`)
// }
