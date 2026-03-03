import { aptitudeQuestions } from "./aptitude"
import { technicalQuestions } from "./technical"
import { hrQuestions } from "./hr"
import { codingQuestions } from "./coding"
import { aiInterviewerQuestions } from "./ai-interviewer"
import type { InterviewType, Question, CodingQuestion, AIQuestion } from "@/lib/types"

export function getQuestions(
  type: InterviewType,
  count: number
): (Question | CodingQuestion | AIQuestion)[] {
  let pool: (Question | CodingQuestion | AIQuestion)[]

  switch (type) {
    case "aptitude":
      pool = aptitudeQuestions
      break
    case "technical":
      pool = technicalQuestions
      break
    case "hr":
      pool = hrQuestions
      break
    case "coding":
      pool = codingQuestions
      break
    case "ai-interviewer":
      pool = aiInterviewerQuestions
      break
    default:
      pool = []
  }

  // Shuffle and pick `count` questions
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export { aptitudeQuestions, technicalQuestions, hrQuestions, codingQuestions, aiInterviewerQuestions }
