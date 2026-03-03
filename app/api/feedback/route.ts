import { streamText } from "ai"

export async function POST(req: Request) {
  const {
    score,
    totalQuestions,
    interviewType,
    weakTopics,
    avgTimePerQuestion,
    violations,
  } = await req.json()

  const percentage = Math.round((score / totalQuestions) * 100)

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: `You are an expert interview coach. Analyze the candidate's interview performance and provide specific, actionable feedback. Be encouraging but honest. Structure your response with clear sections. Use plain text, no markdown headers.`,
    prompt: `Analyze this interview performance:

Interview Type: ${interviewType}
Score: ${score}/${totalQuestions} (${percentage}%)
Average Time Per Question: ${avgTimePerQuestion} seconds
Weak Topics: ${weakTopics.length > 0 ? weakTopics.join(", ") : "None identified"}
Integrity Violations (tab switches/copy/paste): ${violations}

Please provide:
1. Overall Assessment - Brief summary of performance
2. Strengths - What the candidate did well
3. Areas for Improvement - Specific topics and skills to work on
4. Study Recommendations - Concrete resources and strategies for the weak areas
5. Tips for Next Attempt - Practical advice for improving the score`,
    maxOutputTokens: 800,
    temperature: 0.7,
  })

  return result.toTextStreamResponse()
}
