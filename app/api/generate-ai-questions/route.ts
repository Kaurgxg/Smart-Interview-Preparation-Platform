// app/api/generate-ai-questions/route.ts
// Generates interview questions + expected keywords/sentences via Groq (free, no credit card)
// Get your free API key at: https://console.groq.com
// Add to .env.local: GROQ_API_KEY=your_key_here

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

export async function POST(request: Request) {
  try {
    const { role, experience, focus } = await request.json()

    const prompt = `You are an expert technical interviewer. Generate exactly 4 interview questions for:
Role: ${role || 'Software Developer'}
Experience: ${experience || 'fresher / entry-level'}
Focus area: ${focus || 'general software engineering'}

For each question you MUST also produce:
- expectedKeywords: 5-7 specific words or short phrases a strong answer MUST contain
- expectedSentences: 2-3 complete key points or concepts the candidate should express

Return ONLY a valid JSON array. No markdown, no explanation, no text outside the JSON.

[
  {
    "id": "q1",
    "question": "<interview question text>",
    "category": "behavioral" | "technical" | "problem-solving",
    "expectedDuration": <integer seconds, between 60 and 180>,
    "expectedKeywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
    "expectedSentences": [
      "<complete key point the candidate should express>",
      "<another key point or concept>"
    ]
  }
]

Rules:
- Mix of categories: 2 behavioral, 1 technical, 1 problem-solving
- Keywords must be SPECIFIC and MEANINGFUL — not generic words like "good", "work", "think"
- For behavioral questions: use action-oriented terms like "conflict resolution", "ownership", "STAR method", "cross-functional"
- For technical questions: use actual technical terms relevant to the question topic
- For problem-solving: use terms reflecting analytical steps like "edge cases", "time complexity", "trade-offs"
- expectedSentences are the ideal thoughts a strong candidate would express — used to judge relevance`

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error: ${res.status} — ${err}`)
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content?.trim() ?? ''
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    const questions = JSON.parse(cleaned)
    return Response.json({ questions })
  } catch (error) {
    console.error('Question generation error:', error)
    return Response.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}