export interface VoiceMetricsResult {
  fillerWords: string[]
  fillerCount: number
  fillerPerMinute: number
  wordCount: number
  speakingPace: number
  duration: number
}

const FILLER_WORDS = [
  'um',
  'uh',
  'like',
  'you know',
  'basically',
  'literally',
  'actually',
  'so',
  'well',
  'anyway',
  'kind of',
  'sort of',
  'i mean',
]

export function analyzeVoiceMetrics(
  transcript: string,
  duration: number
): VoiceMetricsResult {
  if (!transcript || duration === 0) {
    return {
      fillerWords: [],
      fillerCount: 0,
      fillerPerMinute: 0,
      wordCount: 0,
      speakingPace: 0,
      duration,
    }
  }

  const lowerTranscript = transcript.toLowerCase()
  const words = transcript.trim().split(/\s+/)
  const wordCount = words.length

  // Count filler words
  const foundFillers: string[] = []
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = lowerTranscript.match(regex)
    if (matches) {
      foundFillers.push(...matches.map((m) => m.toLowerCase()))
    }
  }

  const fillerCount = foundFillers.length
  const durationMinutes = duration / 60
  const fillerPerMinute = durationMinutes > 0 ? fillerCount / durationMinutes : 0

  // Calculate speaking pace (words per minute)
  const speakingPace = durationMinutes > 0 ? wordCount / durationMinutes : 0

  return {
    fillerWords: foundFillers,
    fillerCount,
    fillerPerMinute: Math.round(fillerPerMinute * 10) / 10,
    wordCount,
    speakingPace: Math.round(speakingPace),
    duration,
  }
}

export function getConfidenceScore(fillerPerMinute: number, speakingPace: number): number {
  // Lower filler words = higher confidence
  const fillerScore = Math.max(0, 100 - fillerPerMinute * 5)

  // Speaking pace between 120-180 WPM is ideal
  const paceDiff = Math.abs(speakingPace - 150)
  const paceScore = Math.max(0, 100 - paceDiff)

  return Math.round((fillerScore * 0.6 + paceScore * 0.4) / 100 * 100)
}

export function analyzeCommunication(
  transcript: string,
  metrics: VoiceMetricsResult
): { clarity: number; confidence: number; structure: number } {
  if (!transcript) {
    return { clarity: 0, confidence: 0, structure: 0 }
  }

  // Clarity based on sentence structure and length
  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim())
  const avgSentenceLength = sentences.length > 0 ? metrics.wordCount / sentences.length : 0
  const clarityScore = avgSentenceLength > 8 ? 85 : avgSentenceLength > 4 ? 75 : 60

  // Confidence based on filler words
  const confidenceScore = getConfidenceScore(metrics.fillerPerMinute, metrics.speakingPace)

  // Structure based on length and sentence count (longer, more structured responses are better)
  const structureScore =
    metrics.wordCount > 100 ? 85 : metrics.wordCount > 50 ? 70 : metrics.wordCount > 20 ? 50 : 30

  return {
    clarity: Math.round(clarityScore),
    confidence: confidenceScore,
    structure: Math.round(structureScore),
  }
}
