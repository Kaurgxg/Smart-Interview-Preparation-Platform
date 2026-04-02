import { aiInterviewerQuestions } from "@/lib/questions/ai-interviewer"
import { aptitudeQuestions } from "@/lib/questions/aptitude"
import { codingQuestions } from "@/lib/questions/coding"
import { hrQuestions } from "@/lib/questions/hr"
import { technicalQuestions } from "@/lib/questions/technical"
import type {
  AIQuestion,
  CodingQuestion,
  InterviewModeConfig,
  InterviewType,
  ManagedAIQuestion,
  ManagedCodingQuestion,
  ManagedInterviewQuestion,
  ManagedMCQQuestion,
  ModeKind,
  Question,
} from "@/lib/types"
import { INTERVIEW_TYPE_CONFIG } from "@/lib/types"

const CATALOG_STORAGE_KEY = "interview-catalog"
const CATALOG_UPDATED_EVENT = "interview-catalog-updated"

export const AVAILABLE_MODE_ICONS = [
  "brain",
  "code",
  "users",
  "terminal",
  "microphone",
] as const

interface InterviewCatalog {
  modes: InterviewModeConfig[]
  questions: ManagedInterviewQuestion[]
}

type EditableManagedQuestion =
  | Omit<ManagedMCQQuestion, "id">
  | Omit<ManagedCodingQuestion, "id">
  | Omit<ManagedAIQuestion, "id">

function mapDefaultMcqQuestions(
  modeId: InterviewType,
  questions: Question[]
): ManagedMCQQuestion[] {
  return questions.map((question) => ({
    ...question,
    modeId,
    kind: "mcq",
    active: true,
  }))
}

function mapDefaultCodingQuestions(
  modeId: InterviewType,
  questions: CodingQuestion[]
): ManagedCodingQuestion[] {
  return questions.map((question) => ({
    ...question,
    modeId,
    kind: "coding",
    active: true,
  }))
}

function mapDefaultAIQuestions(
  modeId: InterviewType,
  questions: AIQuestion[]
): ManagedAIQuestion[] {
  return questions.map((question) => ({
    ...question,
    modeId,
    kind: "ai-interviewer",
    active: true,
  }))
}

function buildDefaultCatalog(): InterviewCatalog {
  return {
    modes: Object.values(INTERVIEW_TYPE_CONFIG),
    questions: [
      ...mapDefaultMcqQuestions("aptitude", aptitudeQuestions),
      ...mapDefaultMcqQuestions("technical", technicalQuestions),
      ...mapDefaultMcqQuestions("hr", hrQuestions),
      ...mapDefaultCodingQuestions("coding", codingQuestions),
      ...mapDefaultAIQuestions("ai-interviewer", aiInterviewerQuestions),
    ],
  }
}

function cloneCatalog(catalog: InterviewCatalog): InterviewCatalog {
  return {
    modes: [...catalog.modes],
    questions: [...catalog.questions],
  }
}

function canUseStorage() {
  return typeof window !== "undefined"
}

function emitCatalogUpdated() {
  if (!canUseStorage()) return
  window.dispatchEvent(new CustomEvent(CATALOG_UPDATED_EVENT))
}

function parseCatalog(raw: string | null): InterviewCatalog | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as InterviewCatalog
    if (!Array.isArray(parsed.modes) || !Array.isArray(parsed.questions)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function getInterviewCatalog(): InterviewCatalog {
  const defaults = buildDefaultCatalog()

  if (!canUseStorage()) {
    return defaults
  }

  const stored = parseCatalog(localStorage.getItem(CATALOG_STORAGE_KEY))
  if (!stored) {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(defaults))
    return defaults
  }

  return stored
}

function saveCatalog(catalog: InterviewCatalog) {
  if (!canUseStorage()) return
  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog))
  emitCatalogUpdated()
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

export function subscribeToInterviewCatalogUpdates(callback: () => void) {
  if (!canUseStorage()) return () => {}

  const handler = () => callback()
  window.addEventListener(CATALOG_UPDATED_EVENT, handler)
  window.addEventListener("storage", handler)

  return () => {
    window.removeEventListener(CATALOG_UPDATED_EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}

export function getInterviewModes() {
  return getInterviewCatalog().modes
}

export function getInterviewMode(modeId: InterviewType) {
  return getInterviewCatalog().modes.find((mode) => mode.id === modeId) ?? null
}

export function getQuestionsForMode(modeId: InterviewType, count?: number) {
  const catalog = getInterviewCatalog()
  const mode = catalog.modes.find((item) => item.id === modeId)
  if (!mode) return []

  const activeQuestions = catalog.questions.filter(
    (question) => question.modeId === modeId && question.active
  )

  const questionLimit = count ?? mode.questionCount
  return shuffle(activeQuestions).slice(0, Math.min(questionLimit, activeQuestions.length))
}

export function getQuestionsForAdmin(modeId?: InterviewType) {
  const catalog = getInterviewCatalog()
  const questions = modeId
    ? catalog.questions.filter((question) => question.modeId === modeId)
    : catalog.questions

  return [...questions].sort((left, right) => right.id.localeCompare(left.id))
}

export function saveInterviewMode(mode: InterviewModeConfig) {
  const catalog = cloneCatalog(getInterviewCatalog())
  const index = catalog.modes.findIndex((item) => item.id === mode.id)

  if (index >= 0) {
    catalog.modes[index] = mode
  } else {
    catalog.modes.push(mode)
  }

  saveCatalog(catalog)
}

export function deleteInterviewMode(modeId: InterviewType) {
  const catalog = cloneCatalog(getInterviewCatalog())
  const mode = catalog.modes.find((item) => item.id === modeId)

  if (mode?.builtIn) {
    throw new Error("Built-in modes cannot be deleted.")
  }

  catalog.modes = catalog.modes.filter((item) => item.id !== modeId)
  catalog.questions = catalog.questions.filter((question) => question.modeId !== modeId)
  saveCatalog(catalog)
}

export function saveInterviewQuestion(
  question: EditableManagedQuestion,
  existingId?: string
) {
  const catalog = cloneCatalog(getInterviewCatalog())
  const id =
    existingId ??
    `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const nextQuestion = {
    ...question,
    id,
  } as ManagedInterviewQuestion

  const index = catalog.questions.findIndex((item) => item.id === id)
  if (index >= 0) {
    catalog.questions[index] = nextQuestion
  } else {
    catalog.questions.push(nextQuestion)
  }

  saveCatalog(catalog)
  return id
}

export function deleteInterviewQuestion(questionId: string) {
  const catalog = cloneCatalog(getInterviewCatalog())
  catalog.questions = catalog.questions.filter((question) => question.id !== questionId)
  saveCatalog(catalog)
}

export function toggleInterviewQuestion(questionId: string) {
  const catalog = cloneCatalog(getInterviewCatalog())
  const index = catalog.questions.findIndex((question) => question.id === questionId)
  if (index === -1) return

  const current = catalog.questions[index]
  catalog.questions[index] = {
    ...current,
    active: !current.active,
  }

  saveCatalog(catalog)
}

export function getModeKindsForCreation(): ModeKind[] {
  return ["mcq", "coding", "ai-interviewer"]
}
