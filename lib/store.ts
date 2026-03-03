import type { InterviewSession, InterviewStats, InterviewType } from "./types"

const STORAGE_KEY = "interview-prep-sessions"

function getSessions(): InterviewSession[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveSession(session: InterviewSession): void {
  const sessions = getSessions()
  sessions.push(session)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function getSession(id: string): InterviewSession | null {
  const sessions = getSessions()
  return sessions.find((s) => s.id === id) || null
}

export function getHistory(): InterviewSession[] {
  return getSessions().sort((a, b) => b.endTime - a.endTime)
}

export function getStats(): InterviewStats {
  const sessions = getSessions()

  if (sessions.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      totalTime: 0,
      weakTopics: [],
      scoreHistory: [],
    }
  }

  const totalAttempts = sessions.length
  const scores = sessions.map((s) => (s.score / s.totalQuestions) * 100)
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const bestScore = Math.max(...scores)
  const totalTime = sessions.reduce(
    (acc, s) => acc + (s.endTime - s.startTime),
    0
  )

  // Calculate topic performance
  const topicMap = new Map<string, { correct: number; total: number }>()
  for (const session of sessions) {
    for (const answer of session.answers) {
      const question = session.questions.find(
        (q) => q.id === answer.questionId
      )
      if (!question) continue
      const topic = question.topic
      const existing = topicMap.get(topic) || { correct: 0, total: 0 }
      existing.total++
      if (answer.isCorrect) existing.correct++
      topicMap.set(topic, existing)
    }
  }

  const weakTopics = Array.from(topicMap.entries())
    .map(([topic, data]) => ({
      topic,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
    }))
    .filter((t) => t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)

  const scoreHistory = sessions.map((s) => ({
    date: new Date(s.endTime).toLocaleDateString(),
    score: Math.round((s.score / s.totalQuestions) * 100),
    type: s.type as InterviewType,
  }))

  return {
    totalAttempts,
    averageScore: Math.round(averageScore),
    bestScore: Math.round(bestScore),
    totalTime,
    weakTopics,
    scoreHistory,
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
