// lib/store.ts
// Now saves to Supabase for logged-in users, falls back to localStorage for guests

import type {
  AIAnswer,
  AIQuestion,
  Answer,
  CodingQuestion,
  InterviewSession,
  InterviewStats,
  InterviewType,
  Question,
} from './types'
import { getSupabase } from './supabase'

export interface AIInterviewSessionRecord {
  sessionId: string
  questions: AIQuestion[]
  answers: AIAnswer[]
  createdAt?: number
  userId?: string | null
  modeId?: InterviewType
  feedbackSummary?: {
    overallScore: number
    rawScore: number
    maxScore: number
  }
}

function getClearedAtStorageKey(userId: string | null) {
  return `interview-history-cleared-at:${userId ?? 'guest'}`
}

function getClearedAt(userId: string | null): number {
  if (typeof window === 'undefined') return 0

  const raw = localStorage.getItem(getClearedAtStorageKey(userId))
  const value = raw ? Number(raw) : 0
  return Number.isFinite(value) ? value : 0
}

function setClearedAt(userId: string | null, timestamp: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(getClearedAtStorageKey(userId), String(timestamp))
}

function filterSessionsSinceClear(
  sessions: InterviewSession[],
  clearedAt: number
) {
  if (!clearedAt) return sessions
  return sessions.filter((session) => session.endTime > clearedAt)
}

function getSessionTimestampFromId(sessionId: string) {
  const maybeTimestamp = Number(sessionId.split('-')[2])
  return Number.isFinite(maybeTimestamp) ? maybeTimestamp : 0
}

function getLocalAISessionsStorageKey() {
  return 'aiInterviews'
}

function getLocalAISessions(userId: string | null): AIInterviewSessionRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(getLocalAISessionsStorageKey())
    const parsed = raw ? (JSON.parse(raw) as AIInterviewSessionRecord[]) : []

    return parsed
      .map((record) => ({
        ...record,
        createdAt:
          record.createdAt ??
          getSessionTimestampFromId(record.sessionId) ??
          Date.now(),
        modeId: record.modeId ?? 'ai-interviewer',
      }))
      .filter((record) => {
        if (!userId) {
          return !record.userId
        }

        return !record.userId || record.userId === userId
      })
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
  } catch {
    return []
  }
}

function upsertLocalAISession(record: AIInterviewSessionRecord) {
  if (typeof window === 'undefined') return

  const existing = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(getLocalAISessionsStorageKey()) ?? '[]'
      ) as AIInterviewSessionRecord[]
    } catch {
      return [] as AIInterviewSessionRecord[]
    }
  })()

  const filtered = existing.filter((item) => item.sessionId !== record.sessionId)
  filtered.unshift(record)
  localStorage.setItem(getLocalAISessionsStorageKey(), JSON.stringify(filtered))
}

function buildAIHistoryEntry(session: AIInterviewSessionRecord): InterviewSession {
  const questionCount = session.questions.length
  const maxScore = session.feedbackSummary?.maxScore ?? Math.max(questionCount * 5, 1)
  const answeredCount = session.answers.filter(
    (answer) => answer.transcript?.trim().length
  ).length
  const rawScore = session.feedbackSummary?.rawScore ?? Math.min(answeredCount * 5, maxScore)
  const totalDurationMs = session.answers.reduce(
    (total, answer) => total + Math.max(answer.duration ?? 0, 0) * 1000,
    0
  )
  const endTime =
    session.createdAt ?? getSessionTimestampFromId(session.sessionId) ?? Date.now()
  const startTime = Math.max(endTime - totalDurationMs, 0)

  return {
    id: session.sessionId,
    type: session.modeId ?? 'ai-interviewer',
    score: rawScore,
    totalQuestions: maxScore,
    startTime,
    endTime,
    violations: 0,
    questions: [],
    answers: [],
  }
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────
async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ─── Save session ─────────────────────────────────────────────────────────────
export async function saveSession(session: InterviewSession): Promise<void> {
  const userId = await getCurrentUserId()

  if (userId) {
    const supabase = getSupabase()
    const { error } = await supabase.from('interview_sessions').upsert({
      id: session.id,
      user_id: userId,
      type: session.type,
      score: session.score,
      total_questions: session.totalQuestions,
      start_time: session.startTime,
      end_time: session.endTime,
      violations: session.violations,
      questions: session.questions,
      answers: session.answers,
    })
    if (error) {
      throw new Error(error.message)
    }
  } else {
    // Guest fallback: localStorage
    const sessions = getLocalSessions()
    sessions.push(session)
    localStorage.setItem('interview-prep-sessions', JSON.stringify(sessions))
  }
}

// ─── Get single session ───────────────────────────────────────────────────────
export async function getSession(id: string): Promise<InterviewSession | null> {
  const userId = await getCurrentUserId()
  const clearedAt = getClearedAt(userId)

  if (userId) {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!data) return null
    const session = mapDbSession(data)
    return !clearedAt || session.endTime > clearedAt ? session : null
  }

  const session = getLocalSessions().find((s) => s.id === id) ?? null
  return session && (!clearedAt || session.endTime > clearedAt) ? session : null
}

// ─── Get all sessions (history) ───────────────────────────────────────────────
export async function getHistory(): Promise<InterviewSession[]> {
  const userId = await getCurrentUserId()
  const clearedAt = getClearedAt(userId)
  const aiSessions = filterSessionsSinceClear(
    getLocalAISessions(userId).map(buildAIHistoryEntry),
    clearedAt
  )

  if (userId) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('end_time', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return [...filterSessionsSinceClear((data ?? []).map(mapDbSession), clearedAt), ...aiSessions]
      .sort((a, b) => b.endTime - a.endTime)
  }

  return [
    ...filterSessionsSinceClear(
      getLocalSessions().sort((a, b) => b.endTime - a.endTime),
      clearedAt
    ),
    ...aiSessions,
  ].sort((a, b) => b.endTime - a.endTime)
}

// ─── Get stats ────────────────────────────────────────────────────────────────
export async function getStats(): Promise<InterviewStats> {
  const sessions = await getHistory()

  if (sessions.length === 0) {
    return { totalAttempts: 0, averageScore: 0, bestScore: 0, totalTime: 0, weakTopics: [], scoreHistory: [] }
  }

  const scores = sessions.map((s) => (s.score / s.totalQuestions) * 100)
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const bestScore = Math.max(...scores)
  const totalTime = sessions.reduce((acc, s) => acc + (s.endTime - s.startTime), 0)

  const topicMap = new Map<string, { correct: number; total: number }>()
  for (const session of sessions) {
    for (const answer of session.answers) {
      const question = session.questions.find((q) => q.id === answer.questionId)
      if (!question || !('topic' in question)) continue
      const topic = question.topic
      const existing = topicMap.get(topic) ?? { correct: 0, total: 0 }
      existing.total++
      if (answer.isCorrect) existing.correct++
      topicMap.set(topic, existing)
    }
  }

  const weakTopics = Array.from(topicMap.entries())
    .map(([topic, data]) => ({ topic, accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0 }))
    .filter((t) => t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)

  const scoreHistory = sessions.map((s) => ({
    date: new Date(s.endTime).toLocaleDateString(),
    score: Math.round((s.score / s.totalQuestions) * 100),
    type: s.type as InterviewType,
  }))

  return {
    totalAttempts: sessions.length,
    averageScore: Math.round(averageScore),
    bestScore: Math.round(bestScore),
    totalTime,
    weakTopics,
    scoreHistory,
  }
}

// ─── Save AI interview session ────────────────────────────────────────────────
export async function saveAISession(sessionData: {
  sessionId: string
  questions: AIQuestion[]
  answers: AIAnswer[]
  modeId?: InterviewType
}): Promise<void> {
  const userId = await getCurrentUserId()
  const localRecord: AIInterviewSessionRecord = {
    sessionId: sessionData.sessionId,
    questions: sessionData.questions,
    answers: sessionData.answers,
    createdAt: getSessionTimestampFromId(sessionData.sessionId) || Date.now(),
    userId,
    modeId: sessionData.modeId ?? 'ai-interviewer',
  }

  upsertLocalAISession(localRecord)

  if (userId) {
    const supabase = getSupabase()
    const { error } = await supabase.from('ai_interview_sessions').upsert({
      id: sessionData.sessionId,
      user_id: userId,
      session_id: sessionData.sessionId,
      questions: sessionData.questions,
      answers: sessionData.answers,
    })
    if (error) {
      console.warn('AI session cloud save failed, using local fallback:', error.message)
    }
  }
}

export async function saveAIFeedbackSummary(
  sessionId: string,
  summary: {
    overallScore: number
    rawScore: number
    maxScore: number
  }
): Promise<void> {
  const userId = await getCurrentUserId()
  const existing = getLocalAISessions(userId).find((item) => item.sessionId === sessionId)

  if (!existing) {
    return
  }

  upsertLocalAISession({
    ...existing,
    feedbackSummary: summary,
  })
}

// ─── Get AI session ───────────────────────────────────────────────────────────
export async function getAISession(id: string): Promise<AIInterviewSessionRecord | null> {
  const userId = await getCurrentUserId()
  const clearedAt = getClearedAt(userId)
  const localSession = getLocalAISessions(userId).find((session) => session.sessionId === id) ?? null

  if (userId) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('ai_interview_sessions')
      .select('*')
      .eq('session_id', id)
      .eq('user_id', userId)
      .single()
    if (error) {
      console.warn('AI session cloud read failed, using local fallback:', error.message)
    }

    if (!data) {
      return localSession &&
        (!clearedAt || getSessionTimestampFromId(localSession.sessionId) > clearedAt)
        ? localSession
        : null
    }

    const session = {
      sessionId: (data.session_id as string) ?? id,
      questions: ((data.questions as AIQuestion[] | null) ?? []),
      answers: ((data.answers as AIAnswer[] | null) ?? []),
      createdAt:
        localSession?.createdAt ??
        getSessionTimestampFromId((data.session_id as string) ?? id),
      userId,
      modeId: localSession?.modeId ?? 'ai-interviewer',
      feedbackSummary: localSession?.feedbackSummary,
    } satisfies AIInterviewSessionRecord

    return !clearedAt || getSessionTimestampFromId(session.sessionId) > clearedAt
      ? session
      : null
  }

  const session = localSession
  return session && (!clearedAt || getSessionTimestampFromId(session.sessionId) > clearedAt)
    ? session
    : null
}

// ─── Clear history ────────────────────────────────────────────────────────────
export async function clearHistory(): Promise<void> {
  const userId = await getCurrentUserId()
  const clearedAt = Date.now()

  setClearedAt(userId, clearedAt)

  if (userId) {
    const supabase = getSupabase()
    const [interviewResult, aiInterviewResult] = await Promise.allSettled([
      supabase.from('interview_sessions').delete().eq('user_id', userId),
      supabase.from('ai_interview_sessions').delete().eq('user_id', userId),
    ])

    const firstError =
      interviewResult.status === 'fulfilled'
        ? interviewResult.value.error
        : interviewResult.reason
    const secondError =
      aiInterviewResult.status === 'fulfilled'
        ? aiInterviewResult.value.error
        : aiInterviewResult.reason

    if (firstError || secondError) {
      console.warn('Remote interview history delete failed:', firstError || secondError)
    }
  }
  localStorage.removeItem('interview-prep-sessions')
  localStorage.removeItem(getLocalAISessionsStorageKey())
}

// ─── Local helpers ────────────────────────────────────────────────────────────
function getLocalSessions(): InterviewSession[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('interview-prep-sessions')
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function mapDbSession(data: Record<string, unknown>): InterviewSession {
  return {
    id: data.id as string,
    type: data.type as InterviewType,
    score: data.score as number,
    totalQuestions: data.total_questions as number,
    startTime: data.start_time as number,
    endTime: data.end_time as number,
    violations: data.violations as number,
    questions: ((data.questions as (Question | CodingQuestion)[] | null) ?? []),
    answers: ((data.answers as Answer[] | null) ?? []),
  }
}
