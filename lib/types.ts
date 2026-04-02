export type BuiltInInterviewType =
  | "aptitude"
  | "technical"
  | "hr"
  | "coding"
  | "ai-interviewer"

export type InterviewType = BuiltInInterviewType | (string & {})
export type Difficulty = "easy" | "medium" | "hard"
export type ModeKind = "mcq" | "coding" | "ai-interviewer"

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
  expectedKeywords?: string[]
  expectedSentences?: string[]
}

export interface QuestionScore {
  questionId: string
  totalMark: number
  maxMark: 5
  relevanceMark: number
  keywordMark: number
  confidenceMark: number
  confidenceBreakdown: string
  matchedKeywords: string[]
  missedKeywords: string[]
  relevanceFeedback: string
  keyPointsCovered: string[]
  keyPointsMissed: string[]
}

export interface AIFeedback {
  overallScore: number
  rawScore: number
  maxScore: number
  answerRelevance: number
  keywordCoverage: number
  confidence: number
  strengths: string[]
  areasToImprove: string[]
  detailedFeedback: string
  perQuestionScores: QuestionScore[]
  usedFallback?: boolean
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

export interface InterviewModeConfig {
  id: InterviewType
  label: string
  description: string
  timePerQuestion: number
  questionCount: number
  icon: string
  kind: ModeKind
  builtIn?: boolean
}

export interface ManagedQuestionBase {
  modeId: InterviewType
  kind: ModeKind
  active: boolean
}

export interface ManagedMCQQuestion extends Question, ManagedQuestionBase {
  kind: "mcq"
}

export interface ManagedCodingQuestion extends CodingQuestion, ManagedQuestionBase {
  kind: "coding"
}

export interface ManagedAIQuestion extends AIQuestion, ManagedQuestionBase {
  kind: "ai-interviewer"
}

export type ManagedInterviewQuestion =
  | ManagedMCQQuestion
  | ManagedCodingQuestion
  | ManagedAIQuestion

export interface Answer {
  questionId: string
  selectedOption: number | null
  codeAnswer?: string
  timeSpent: number
  isCorrect: boolean
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

export const INTERVIEW_TYPE_CONFIG: Record<BuiltInInterviewType, InterviewModeConfig> = {
  aptitude: {
    id: "aptitude",
    label: "Aptitude",
    description: "Test your logical reasoning, quantitative skills, and verbal ability",
    timePerQuestion: 60,
    questionCount: 10,
    icon: "brain",
    kind: "mcq",
    builtIn: true,
  },
  technical: {
    id: "technical",
    label: "Technical",
    description: "DSA, OOP, DBMS, OS, and networking fundamentals",
    timePerQuestion: 90,
    questionCount: 10,
    icon: "code",
    kind: "mcq",
    builtIn: true,
  },
  hr: {
    id: "hr",
    label: "HR",
    description: "Behavioral questions, situational judgment, and soft skills",
    timePerQuestion: 120,
    questionCount: 10,
    icon: "users",
    kind: "mcq",
    builtIn: true,
  },
  coding: {
    id: "coding",
    label: "Coding",
    description: "Solve coding challenges with real-world problem statements",
    timePerQuestion: 300,
    questionCount: 5,
    icon: "terminal",
    kind: "coding",
    builtIn: true,
  },
  "ai-interviewer": {
    id: "ai-interviewer",
    label: "AI Interviewer",
    description: "Have a natural conversation with AI and get feedback on communication, confidence, and thinking",
    timePerQuestion: 180,
    questionCount: 4,
    icon: "microphone",
    kind: "ai-interviewer",
    builtIn: true,
  },
}

export const VIOLATION_THRESHOLD = 3
