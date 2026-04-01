// app/api/evaluate-ai-interview/route.ts

interface Answer {
  questionId: string
  transcript: string
  duration: number
  fillerWords: number
  speakingPace: number
  confidence?: number
}

interface Question {
  id: string
  question: string
  category: 'behavioral' | 'technical' | 'problem-solving'
  expectedDuration: number
}

// ─── Local communication scoring (objective math, no AI needed) ───────────────
function evaluateCommunication(
  fillerWords: number,
  speakingPace: number,
  duration: number,
  transcript: string
): number {
  let score = 80

  const fillerRate = duration > 0 ? (fillerWords / duration) * 60 : 0
  if (fillerRate > 4) score -= 22
  else if (fillerRate > 2.5) score -= 14
  else if (fillerRate > 1.5) score -= 7
  else if (fillerRate <= 0.5 && fillerWords >= 0) score += 5

  // Ideal pace: 120–160 WPM
  if (speakingPace < 80) score -= 12
  else if (speakingPace < 100) score -= 6
  else if (speakingPace > 200) score -= 10
  else if (speakingPace > 175) score -= 4
  else if (speakingPace >= 120 && speakingPace <= 160) score += 6

  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 4)
  if (sentences.length >= 6) score += 5
  else if (sentences.length <= 1) score -= 8

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length
  if (wordCount < 10) return Math.min(score, 30)

  return Math.max(20, Math.min(100, Math.round(score)))
}

// ─── Claude AI evaluation ─────────────────────────────────────────────────────
async function evaluateWithClaude(
  questions: Question[],
  answers: Answer[]
): Promise<{
  answerQuality: number
  technicalDepth: number
  softSkills: number
  overallScore: number
  strengths: string[]
  areasToImprove: string[]
  detailedFeedback: string
  perQuestionFeedback: {
    questionId: string
    score: number
    feedback: string
    keyPoints: string[]
    missedPoints: string[]
  }[]
}> {
  const interviewTranscript = answers
    .map((a, i) => {
      const q = questions.find((q) => q.id === a.questionId)
      if (!q) return null
      const transcript = a.transcript?.trim() || '[No response — candidate did not answer]'
      return `--- Question ${i + 1} [${q.category.toUpperCase()}] ---
Question: ${q.question}
Duration: ${a.duration}s | Speaking Pace: ${a.speakingPace} WPM | Filler Words: ${a.fillerWords}
Answer: ${transcript}`
    })
    .filter(Boolean)
    .join('\n\n')

  const prompt = `You are an expert interview coach and evaluator with 15+ years of experience assessing candidates at top tech companies like Google, Meta, and Amazon.

Evaluate the following mock interview session and return ONLY a valid JSON object. No markdown, no preamble, no explanation outside the JSON.

INTERVIEW TRANSCRIPT:
${interviewTranscript}

SCORING RUBRIC:
- answerQuality (0–100): Did the candidate actually answer the question? Penalise heavily for vague, off-topic, or empty answers. Reward structured, specific, example-driven answers. Use STAR method adherence for behavioral questions.
- technicalDepth (0–100): For technical/problem-solving: correctness of concepts, use of proper terminology, depth of explanation. For behavioral questions: analytical thinking and logical reasoning shown. Score 0 only if truly no technical content exists.
- softSkills (0–100): Collaboration, ownership, empathy, adaptability, communication mindset — shown through specific examples and framing, not just buzzwords.
- overallScore (0–100): Holistic assessment. Weighted toward answerQuality (40%) and communication clarity (25%). Do NOT average mechanically — use professional judgment.
- perQuestionFeedback: Evaluate each question individually. Be specific — reference what the candidate actually said, not generic advice.
- strengths: 3 specific, evidence-based strengths. Reference actual things they said or demonstrated.
- areasToImprove: 3 specific, actionable improvement points. Reference actual gaps observed.
- detailedFeedback: 2–3 paragraph honest narrative. Be encouraging but direct about weaknesses.

Return this exact JSON structure:
{
  "answerQuality": <integer 0-100>,
  "technicalDepth": <integer 0-100>,
  "softSkills": <integer 0-100>,
  "overallScore": <integer 0-100>,
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "areasToImprove": ["<actionable improvement 1>", "<actionable improvement 2>", "<actionable improvement 3>"],
  "detailedFeedback": "<honest 2-3 paragraph summary>",
  "perQuestionFeedback": [
    {
      "questionId": "<id>",
      "score": <integer 0-100>,
      "feedback": "<2-3 sentence specific feedback referencing their actual answer>",
      "keyPoints": ["<something they did well>", "<another positive>"],
      "missedPoints": ["<key thing they missed or could improve>"]
    }
  ]
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content
    .map((block: { type: string; text?: string }) => (block.type === 'text' ? block.text : ''))
    .join('')
    .trim()

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(cleaned)
}

// ─── Fallback evaluation (if Claude API fails) ────────────────────────────────
function fallbackEvaluation(questions: Question[], answers: Answer[]) {
  const hasContent = answers.some((a) => a.transcript?.trim().length > 20)

  return {
    answerQuality: hasContent ? 55 : 20,
    technicalDepth: hasContent ? 50 : 15,
    softSkills: hasContent ? 55 : 20,
    overallScore: hasContent ? 52 : 18,
    strengths: hasContent
      ? ['Attempted to answer the questions provided', 'Engaged with the interview process', 'Demonstrated willingness to practice']
      : ['Completed the interview session'],
    areasToImprove: [
      'Provide more detailed and structured answers',
      'Use specific examples to support your points',
      'Practice the STAR method (Situation, Task, Action, Result)',
    ],
    detailedFeedback:
      'We were unable to generate detailed AI feedback at this time. Please try reviewing your answers below and consider re-attempting the interview for a full evaluation.',
    perQuestionFeedback: answers.map((a) => ({
      questionId: a.questionId,
      score: a.transcript?.trim().length > 20 ? 55 : 20,
      feedback: a.transcript?.trim()
        ? 'Answer recorded. Re-attempt for detailed AI feedback.'
        : 'No answer was recorded for this question.',
      keyPoints: a.transcript?.trim() ? ['Answer was recorded successfully'] : [],
      missedPoints: ['Detailed AI feedback unavailable — please retry'],
    })),
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { questions, answers } = await request.json()

    if (!questions?.length || !answers?.length) {
      return Response.json({ error: 'Missing questions or answers' }, { status: 400 })
    }

    // Always compute communication score locally (it's objective)
    const communicationScores = answers.map((a: Answer) =>
      evaluateCommunication(a.fillerWords ?? 0, a.speakingPace ?? 0, a.duration ?? 0, a.transcript ?? '')
    )
    const communication = Math.round(
      communicationScores.reduce((sum: number, s: number) => sum + s, 0) / communicationScores.length
    )

    // Try Claude AI evaluation, fall back gracefully
    let aiResult
    let usedFallback = false
    try {
      aiResult = await evaluateWithClaude(questions, answers)
    } catch (err) {
      console.error('Claude evaluation failed, using fallback:', err)
      aiResult = fallbackEvaluation(questions, answers)
      usedFallback = true
    }

    // Merge: AI scores + local communication score → final overall
    const overallScore = Math.round(
      aiResult.answerQuality * 0.35 +
      communication * 0.25 +
      aiResult.technicalDepth * 0.22 +
      aiResult.softSkills * 0.18
    )

    return Response.json({
      ...aiResult,
      communication,
      overallScore, // override AI's overall with our weighted formula
      usedFallback,
    })
  } catch (error) {
    console.error('Evaluation error:', error)
    return Response.json({ error: 'Failed to evaluate interview' }, { status: 500 })
  }
}