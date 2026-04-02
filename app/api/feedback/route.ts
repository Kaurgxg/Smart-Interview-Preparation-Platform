const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

interface FeedbackRequest {
  score: number
  totalQuestions: number
  interviewType: string
  weakTopics: string[]
  avgTimePerQuestion: number
  violations: number
}

function buildFallbackFeedback({
  score,
  totalQuestions,
  interviewType,
  weakTopics,
  avgTimePerQuestion,
  violations,
}: FeedbackRequest) {
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0
  const weakTopicsText =
    weakTopics.length > 0 ? weakTopics.join(', ') : 'No clear weak topics yet'

  return [
    `Overall Assessment: You scored ${score}/${totalQuestions} (${percentage}%) in the ${interviewType} interview.`,
    '',
    `Strengths: You completed the interview, maintained an average pace of about ${avgTimePerQuestion} seconds per question, and created enough data to review.`,
    '',
    `Areas for Improvement: Focus on ${weakTopicsText}. Keep reducing avoidable mistakes and aim to explain answers more completely.`,
    '',
    `Study Recommendations: Re-practice the weaker topics, review missed concepts one by one, and do another timed attempt after revising.`,
    '',
    `Tips for Next Attempt: Keep your pace steady, answer every question, and avoid integrity violations. Current recorded violations: ${violations}.`,
  ].join('\n')
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FeedbackRequest
    const {
      score,
      totalQuestions,
      interviewType,
      weakTopics,
      avgTimePerQuestion,
      violations,
    } = body

    if (!totalQuestions || !interviewType) {
      return Response.json(
        { error: 'Missing interview details for feedback.' },
        { status: 400 }
      )
    }

    const percentage = Math.round((score / totalQuestions) * 100)

    if (!process.env.GROQ_API_KEY) {
      return new Response(buildFallbackFeedback(body), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    const prompt = `You are an expert interview coach. Give plain-text feedback only, with short section labels and practical advice.

Interview Type: ${interviewType}
Score: ${score}/${totalQuestions} (${percentage}%)
Average Time Per Question: ${avgTimePerQuestion} seconds
Weak Topics: ${weakTopics.length > 0 ? weakTopics.join(', ') : 'None identified'}
Integrity Violations: ${violations}

Write these sections in plain text:
Overall Assessment
Strengths
Areas for Improvement
Study Recommendations
Tips for Next Attempt

Be specific, encouraging, and actionable. Do not use markdown fences.`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.5,
        max_tokens: 700,
        messages: [
          {
            role: 'system',
            content:
              'You are a sharp but encouraging interview coach. Return plain text only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const fallback = buildFallbackFeedback(body)
      return new Response(fallback, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      const fallback = buildFallbackFeedback(body)
      return new Response(fallback, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Feedback route failed:', error)

    return Response.json(
      { error: 'Unable to generate AI feedback right now.' },
      { status: 500 }
    )
  }
}
