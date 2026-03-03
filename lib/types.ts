export type InterviewType = "aptitude" | "technical" | "hr" | "coding" | "ai-interviewer"
export type Difficulty = "easy" | "medium" | "hard"

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  topic: string
  difficulty: Difficulty
  explanation: string
}

export interface AIQuestion {
  id: string
  question: string
  category: "behavioral" | "technical" | "problem-solving"
  expectedDuration: number
}

export interface CodingQuestion {
  id: string
  title: string
  description: string
  starterCode: string
  expectedOutput: string
  topic: string
  difficulty: Difficulty
  hints: string[]
}

export interface Answer {
  questionId: string
  selectedOption: number | null
  codeAnswer?: string
  timeSpent: number
  isCorrect: boolean
}

export interface AIAnswer {
  questionId: string
  transcript: string
  duration: number
  fillerWords: number
  speakingPace: number
  confidence: number
}

export interface VoiceMetrics {
  fillerWords: string[]
  fillerCount: number
  speakingPace: number
  totalDuration: number
  averageFillerPerMinute: number
}

export interface AIFeedback {
  answerQuality: number
  communication: number
  technicalDepth: number
  softSkills: number
  confidence?: number
  plagiarismScore?: number
  overallScore: number
  strengths: string[]
  areasToImprove: string[]
  detailedFeedback: string
}

export interface InterviewSession {
  id: string
  type: InterviewType
  questions: (Question | CodingQuestion)[]
  answers: Answer[]
  startTime: number
  endTime: number
  violations: number
  score: number
  totalQuestions: number
}

export interface InterviewStats {
  totalAttempts: number
  averageScore: number
  bestScore: number
  totalTime: number
  weakTopics: { topic: string; accuracy: number }[]
  scoreHistory: { date: string; score: number; type: InterviewType }[]
}

export const INTERVIEW_TYPE_CONFIG: Record<
  InterviewType,
  {
    label: string
    description: string
    timePerQuestion: number
    questionCount: number
    icon: string
  }
> = {
  aptitude: {
    label: "Aptitude",
    description:
      "Test your logical reasoning, quantitative skills, and verbal ability",
    timePerQuestion: 60,
    questionCount: 10,
    icon: "brain",
  },
  technical: {
    label: "Technical",
    description: "DSA, OOP, DBMS, OS, and networking fundamentals",
    timePerQuestion: 90,
    questionCount: 10,
    icon: "code",
  },
  hr: {
    label: "HR",
    description:
      "Behavioral questions, situational judgment, and soft skills",
    timePerQuestion: 120,
    questionCount: 10,
    icon: "users",
  },
  coding: {
    label: "Coding",
    description:
      "Solve coding challenges with real-world problem statements",
    timePerQuestion: 300,
    questionCount: 5,
    icon: "terminal",
  },
  "ai-interviewer": {
    label: "AI Interviewer",
    description:
      "Have a natural conversation with AI and get feedback on communication, confidence, and thinking",
    timePerQuestion: 180,
    questionCount: 4,
    icon: "microphone",
  },
}

export const VIOLATION_THRESHOLD = 3
