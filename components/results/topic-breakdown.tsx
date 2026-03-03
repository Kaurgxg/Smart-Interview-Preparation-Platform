"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { InterviewSession, Question, CodingQuestion } from "@/lib/types"

interface TopicBreakdownProps {
  session: InterviewSession
}

export function TopicBreakdown({ session }: TopicBreakdownProps) {
  const topicMap = new Map<string, { correct: number; total: number }>()

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

  const topics = Array.from(topicMap.entries())
    .map(([topic, data]) => ({
      topic,
      correct: data.correct,
      total: data.total,
      percentage: Math.round((data.correct / data.total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)

  if (topics.length === 0) return null

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">Topic Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {topics.map(({ topic, correct, total, percentage }) => (
            <div key={topic} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{topic}</span>
                <span className="text-muted-foreground">
                  {correct}/{total} ({percentage}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    percentage >= 70
                      ? "bg-success"
                      : percentage >= 50
                        ? "bg-warning"
                        : "bg-destructive"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
