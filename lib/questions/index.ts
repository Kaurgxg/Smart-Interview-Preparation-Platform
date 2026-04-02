import { getQuestionsForMode } from "@/lib/interview-catalog"
import type {
  AIQuestion,
  CodingQuestion,
  InterviewType,
  Question,
} from "@/lib/types"

export function getQuestions(
  type: InterviewType,
  count: number
): (Question | CodingQuestion | AIQuestion)[] {
  return getQuestionsForMode(type, count) as (Question | CodingQuestion | AIQuestion)[]
}
