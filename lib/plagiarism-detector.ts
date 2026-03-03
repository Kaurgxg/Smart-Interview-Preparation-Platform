export interface PlagiarismResult {
  score: number
  isPlagiarized: boolean
  analysis: string
  flags: string[]
}

const COMMON_PHRASES = [
  "in conclusion",
  "to summarize",
  "based on my experience",
  "i believe",
  "in my opinion",
  "at the end of the day",
  "last but not least",
  "furthermore",
  "on the other hand",
  "for example",
  "such as",
  "in other words",
  "to put it another way",
  "basically",
  "essentially",
  "obviously",
  "clearly",
]

const REPETITION_THRESHOLD = 0.15

export function detectPlagiarism(transcript: string): PlagiarismResult {
  const flags: string[] = []
  let plagiarismScore = 0

  // Check 1: Excessive common phrase usage
  const commonPhraseCount = COMMON_PHRASES.reduce((count, phrase) => {
    return count + (transcript.toLowerCase().match(new RegExp(phrase, "g")) || []).length
  }, 0)

  const phraseRatio = commonPhraseCount / (transcript.split(/\s+/).length || 1)
  if (phraseRatio > 0.08) {
    flags.push("High usage of common filler phrases")
    plagiarismScore += 15
  }

  // Check 2: Repetitive words (potential copying)
  const words = transcript
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 5)
  const wordFreq: Record<string, number> = {}
  let totalRepetitions = 0

  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })

  Object.values(wordFreq).forEach((count) => {
    if (count > 2) {
      totalRepetitions += count - 1
    }
  })

  const repetitionRatio = totalRepetitions / (words.length || 1)
  if (repetitionRatio > REPETITION_THRESHOLD) {
    flags.push("Excessive repetition of similar words")
    plagiarismScore += 20
  }

  // Check 3: Transcript too short (suspicious - might be AI-generated template)
  const charCount = transcript.trim().length
  if (charCount < 100) {
    flags.push("Response is unusually short")
    plagiarismScore += 10
  }

  // Check 4: Unnatural sentence structure
  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim())
  const avgSentenceLength = transcript.split(/\s+/).length / Math.max(sentences.length, 1)

  if (avgSentenceLength > 40) {
    flags.push("Unusually long sentences detected")
    plagiarismScore += 10
  }

  // Check 5: Number/date density (might indicate copied data)
  const numberCount = (transcript.match(/\d+/g) || []).length
  if (numberCount > transcript.split(/\s+/).length * 0.15) {
    flags.push("High density of numbers/statistics")
    plagiarismScore += 8
  }

  // Check 6: All caps or unusual formatting
  const capsWords = (transcript.match(/\b[A-Z]{2,}\b/g) || []).length
  if (capsWords > 3) {
    flags.push("Multiple acronyms or unusual capitalization")
    plagiarismScore += 5
  }

  // Normalize score to 0-100
  plagiarismScore = Math.min(100, Math.max(0, plagiarismScore))

  const isPlagiarized = plagiarismScore > 40
  const analysis = isPlagiarized
    ? `Potential plagiarism detected. Score: ${plagiarismScore}/100. ${flags.join(". ")}`
    : `Response appears original. Plagiarism score: ${plagiarismScore}/100.`

  return {
    score: plagiarismScore,
    isPlagiarized,
    analysis,
    flags,
  }
}
