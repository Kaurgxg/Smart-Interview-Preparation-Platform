import type { AIQuestion } from "@/lib/types"

export const aiInterviewerQuestions: AIQuestion[] = [
  {
    id: "ai-1",
    question:
      "Tell me about a challenging project you've worked on. What was the problem, your role, and how did you overcome the obstacles?",
    category: "behavioral",
    expectedDuration: 180,
  },
  {
    id: "ai-2",
    question:
      "Describe a time when you had to learn something new quickly. How did you approach it, and what was the outcome?",
    category: "behavioral",
    expectedDuration: 180,
  },
  {
    id: "ai-3",
    question:
      "Walk me through your approach to solving a complex technical problem. How do you break it down and what tools or methodologies do you use?",
    category: "technical",
    expectedDuration: 180,
  },
  {
    id: "ai-4",
    question:
      "Tell me about a time when you disagreed with a team member or manager. How did you handle it and what did you learn?",
    category: "behavioral",
    expectedDuration: 180,
  },
]
