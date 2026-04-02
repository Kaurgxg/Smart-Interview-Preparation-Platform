const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

interface Answer {
  questionId: string
  transcript: string
  duration: number
  fillerWords: number
  speakingPace: number
}

interface Question {
  id: string
  question: string
  category: 'behavioral' | 'technical' | 'problem-solving'
  expectedDuration: number
  expectedKeywords?: string[]
  expectedSentences?: string[]
}

function getConfidenceMark(
  speakingPace: number,
  fillerWords: number,
  duration: number,
  transcript: string
): { mark: number; breakdown: string } {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length
  if (wordCount < 5 || duration < 3) {
    return { mark: 0, breakdown: 'No answer recorded' }
  }

  let score = 0

  if (speakingPace >= 110 && speakingPace <= 170) score += 2
  else if (
    (speakingPace >= 80 && speakingPace < 110) ||
    (speakingPace > 170 && speakingPace <= 200)
  ) score += 1

  const fillerRate = duration > 0 ? (fillerWords / duration) * 60 : 0
  if (fillerRate <= 1.0) score += 2
  else if (fillerRate <= 2.5) score += 1

  const mark = score >= 2 ? 1 : 0

  const paceLabel =
    speakingPace >= 110 && speakingPace <= 170
      ? 'ideal'
      : speakingPace < 80
        ? 'too slow'
        : speakingPace > 200
          ? 'too fast'
          : 'acceptable'
  const fillerLabel =
    fillerRate <= 1.0 ? 'excellent' : fillerRate <= 2.5 ? 'moderate' : 'high'

  return {
    mark,
    breakdown: `${speakingPace} WPM (${paceLabel} pace) | ${fillerWords} filler words (${fillerLabel}, ${fillerRate.toFixed(1)}/min)`,
  }
}

function getKeywordMark(
  transcript: string,
  expectedKeywords: string[]
): { mark: number; matched: string[]; missed: string[] } {
  if (!expectedKeywords?.length || !transcript?.trim()) {
    return { mark: 0, matched: [], missed: expectedKeywords ?? [] }
  }

  const lower = transcript.toLowerCase()
  const matched: string[] = []
  const missed: string[] = []

  for (const keyword of expectedKeywords) {
    const normalized = keyword.toLowerCase()
    const found =
      lower.includes(normalized) ||
      lower.includes(normalized.replace(/s$/, '')) ||
      lower.includes(`${normalized}s`)

    if (found) matched.push(keyword)
    else missed.push(keyword)
  }

  const ratio = matched.length / expectedKeywords.length
  const mark = ratio >= 0.6 ? 2 : ratio >= 0.3 ? 1 : 0

  return { mark, matched, missed }
}

async function getRelevanceFromGroq(questions: Question[], answers: Answer[]) {
  const interviewData = questions
    .map((question, index) => {
      const answer = answers.find((item) => item.questionId === question.id)
      const transcript =
        answer?.transcript?.trim() || '[NO ANSWER - candidate did not respond]'
      const keyPoints =
        question.expectedSentences?.map((sentence) => `  - ${sentence}`).join('\n') ??
        '  - N/A'

      return (
        `--- Q${index + 1} [${question.category.toUpperCase()}] ID: ${question.id} ---\n` +
        `Question: ${question.question}\n` +
        `Key concepts a strong answer should cover:\n${keyPoints}\n` +
        `Candidate answered: ${transcript}`
      )
    })
    .join('\n\n')

  const prompt = `You are a strict interview evaluator. Assess ONLY relevance - whether each answer addresses the question and its key concepts.

${interviewData}

Relevance mark per question:
  2 = Answer clearly addresses the question and covers the key concepts
  1 = Answer is partially relevant or only scratches the surface
  0 = Answer is off-topic, empty, or completely misses the point

Return ONLY valid JSON. No markdown, no extra text.

{
  "perQuestion": [
    {
      "questionId": "<exact id string from above>",
      "relevanceMark": <0, 1, or 2>,
      "relevanceFeedback": "<1-2 specific sentences explaining why this mark was given, referencing what they said>",
      "keyPointsCovered": ["<specific concept they addressed well>"],
      "keyPointsMissed": ["<important concept they failed to mention>"]
    }
  ],
  "strengths": [
    "<evidence-based strength referencing something they actually said>",
    "<strength 2>",
    "<strength 3>"
  ],
  "areasToImprove": [
    "<specific, actionable improvement with reference to their actual gaps>",
    "<improvement 2>",
    "<improvement 3>"
  ],
  "detailedFeedback": "<honest 2-paragraph overall performance summary>"
}`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq error: ${response.status}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content?.trim() ?? ''
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  return JSON.parse(cleaned)
}

function buildFallback(questions: Question[], answers: Answer[]) {
  return {
    perQuestion: questions.map((question) => {
      const answer = answers.find((item) => item.questionId === question.id)
      return {
        questionId: question.id,
        relevanceMark: (answer?.transcript?.trim().length ?? 0) > 30 ? 1 : 0,
        relevanceFeedback: answer?.transcript?.trim()
          ? 'Answer recorded. Retry for AI-powered relevance feedback.'
          : 'No answer was recorded for this question.',
        keyPointsCovered: [],
        keyPointsMissed: ['Retry for detailed feedback'],
      }
    }),
    strengths: [
      'Completed the interview session',
      'Attempted to engage with the questions',
      'Showed willingness to practice',
    ],
    areasToImprove: [
      'Use the STAR method for behavioral questions (Situation, Task, Action, Result)',
      'Include domain-specific keywords and terminology in your answers',
      'Speak at a steady, confident pace with minimal filler words',
    ],
    detailedFeedback:
      'AI feedback is temporarily unavailable. Your answers have been recorded below. Please retry the interview for a full AI-powered evaluation with keyword and relevance analysis.',
  }
}

export async function POST(request: Request) {
  try {
    const { questions, answers = [] } = (await request.json()) as {
      questions: Question[]
      answers?: Answer[]
    }

    if (!questions?.length) {
      return Response.json({ error: 'Missing questions' }, { status: 400 })
    }

    let aiResult
    let usedFallback = false

    try {
      aiResult = await getRelevanceFromGroq(questions, answers)
    } catch (error) {
      console.error('Groq evaluation failed, using fallback:', error)
      aiResult = buildFallback(questions, answers)
      usedFallback = true
    }

    const perQuestionScores = questions.map((question) => {
      const answer = answers.find((item) => item.questionId === question.id)
      const aiQuestionResult = aiResult.perQuestion.find(
        (item: { questionId: string }) => item.questionId === question.id
      )

      const isUnanswered =
        !answer || !answer.transcript?.trim() || answer.transcript.trim().length < 5

      if (isUnanswered) {
        return {
          questionId: question.id,
          totalMark: 0,
          maxMark: 5,
          relevanceMark: 0,
          keywordMark: 0,
          confidenceMark: 0,
          confidenceBreakdown: 'No answer recorded',
          matchedKeywords: [],
          missedKeywords: question.expectedKeywords ?? [],
          relevanceFeedback: 'No answer was given - 0 marks awarded.',
          keyPointsCovered: [],
          keyPointsMissed: aiQuestionResult?.keyPointsMissed ?? [],
        }
      }

      const safeAnswer = answer
      const relevanceMark: number = aiQuestionResult?.relevanceMark ?? 0
      const { mark: keywordMark, matched, missed } = getKeywordMark(
        safeAnswer.transcript,
        question.expectedKeywords ?? []
      )
      const { mark: confidenceMark, breakdown: confidenceBreakdown } =
        getConfidenceMark(
          safeAnswer.speakingPace ?? 0,
          safeAnswer.fillerWords ?? 0,
          safeAnswer.duration ?? 0,
          safeAnswer.transcript
        )

      return {
        questionId: question.id,
        totalMark: relevanceMark + keywordMark + confidenceMark,
        maxMark: 5,
        relevanceMark,
        keywordMark,
        confidenceMark,
        confidenceBreakdown,
        matchedKeywords: matched,
        missedKeywords: missed,
        relevanceFeedback: aiQuestionResult?.relevanceFeedback ?? '',
        keyPointsCovered: aiQuestionResult?.keyPointsCovered ?? [],
        keyPointsMissed: aiQuestionResult?.keyPointsMissed ?? [],
      }
    })

    const rawTotal = perQuestionScores.reduce(
      (sum: number, question) => sum + question.totalMark,
      0
    )
    const maxPossible = questions.length * 5
    const overallScore = Math.round((rawTotal / maxPossible) * 100)

    const questionCount = questions.length
    const answerRelevance = Math.round(
      (perQuestionScores.reduce((sum: number, question) => sum + question.relevanceMark, 0) /
        (questionCount * 2)) *
        100
    )
    const keywordCoverage = Math.round(
      (perQuestionScores.reduce((sum: number, question) => sum + question.keywordMark, 0) /
        (questionCount * 2)) *
        100
    )
    const confidence = Math.round(
      (perQuestionScores.reduce((sum: number, question) => sum + question.confidenceMark, 0) /
        questionCount) *
        100
    )

    return Response.json({
      overallScore,
      rawScore: rawTotal,
      maxScore: maxPossible,
      answerRelevance,
      keywordCoverage,
      confidence,
      strengths: aiResult.strengths,
      areasToImprove: aiResult.areasToImprove,
      detailedFeedback: aiResult.detailedFeedback,
      perQuestionScores,
      usedFallback,
    })
  } catch (error) {
    console.error('Evaluation error:', error)
    return Response.json({ error: 'Failed to evaluate interview' }, { status: 500 })
  }
}
