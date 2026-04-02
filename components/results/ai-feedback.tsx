"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import type { InterviewSession } from "@/lib/types"

interface AiFeedbackProps {
  session: InterviewSession
}

export function AiFeedback({ session }: AiFeedbackProps) {
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestFeedback = async () => {
    setIsLoading(true)
    setError(null)
    setFeedback("")
    setHasRequested(true)

    // Calculate topic performance for the AI
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

    const weakTopics = Array.from(topicMap.entries())
      .filter(([, data]) => data.correct / data.total < 0.6)
      .map(([topic]) => topic)

    const avgTimePerQuestion =
      session.answers.reduce((acc, a) => acc + a.timeSpent, 0) /
      session.answers.length

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: session.score,
          totalQuestions: session.totalQuestions,
          interviewType: session.type,
          weakTopics,
          avgTimePerQuestion: Math.round(avgTimePerQuestion),
          violations: session.violations,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.error || "Failed to get feedback right now."
        )
      }

      const contentType = response.headers.get("content-type") || ""

      if (contentType.includes("application/json")) {
        const data = await response.json().catch(() => null)
        const text = data?.feedback || data?.message || ""
        if (!text) {
          throw new Error("AI feedback returned an empty response.")
        }
        setFeedback(text)
        return
      }

      const text = (await response.text()).trim()
      if (!text) {
        throw new Error("AI feedback returned an empty response.")
      }

      setFeedback(text)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            AI Feedback
          </CardTitle>
          {!isLoading && (
            <Button
              size="sm"
              variant={hasRequested ? "outline" : "default"}
              onClick={requestFeedback}
              className="gap-2"
            >
              <Sparkles className="size-3" />
              {hasRequested ? "Regenerate" : "Get AI Feedback"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasRequested && (
          <p className="text-sm text-muted-foreground">
            Click the button above to get personalized feedback on your
            interview performance from AI.
          </p>
        )}

        {isLoading && !feedback && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Analyzing your performance...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {feedback && (
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {feedback}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
