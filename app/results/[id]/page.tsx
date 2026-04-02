"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScoreSummary } from "@/components/results/score-summary"
import { TopicBreakdown } from "@/components/results/topic-breakdown"
import { AiFeedback } from "@/components/results/ai-feedback"
import { AnswerReview } from "@/components/results/answer-review"
import { AIInterviewerResults } from "@/components/results/ai-interviewer-results"
import { getAISession, getSession } from "@/lib/store"
import type { InterviewSession, AIQuestion, AIAnswer } from "@/lib/types"
import {
  Brain,
  ArrowLeft,
  RotateCcw,
  LayoutDashboard,
  Mic,
} from "lucide-react"

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [aiSession, setAISession] = useState<{
    sessionId: string
    questions: AIQuestion[]
    answers: AIAnswer[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadResults = async () => {
      const data = await getSession(id)
      if (cancelled) return

      if (data) {
        setSession(data)
        setAISession(null)
        setLoading(false)
        return
      }

      const aiData = await getAISession(id)
      if (cancelled) return

      setAISession(aiData)
      setLoading(false)
    }

    void loadResults()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading results...
        </div>
      </div>
    )
  }

  if (!session && !aiSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <p className="text-muted-foreground">Session not found</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    )
  }

  // AI Interview Session
  if (aiSession) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon-sm">
                <Link href="/">
                  <ArrowLeft className="size-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Mic className="size-3.5" />
                </div>
                <span className="text-sm font-semibold">AI Interviewer Results</span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">
          <AIInterviewerResults 
            sessionId={aiSession.sessionId}
            questions={aiSession.questions as AIQuestion[]} 
            answers={aiSession.answers as AIAnswer[]} 
          />

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <Link href="/interview/ai-mode">
                <RotateCcw className="size-4" />
                Practice Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Regular Interview Session
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon-sm">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
                <span className="sr-only">Back to dashboard</span>
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Brain className="size-3.5" />
              </div>
              <span className="text-sm font-semibold">
                {session.type.charAt(0).toUpperCase() +
                  session.type.slice(1)}{" "}
                Results
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Left Column - Score */}
          <div>
            <ScoreSummary session={session} />
          </div>

          {/* Right Column - Details */}
          <div className="flex flex-col gap-6">
            <TopicBreakdown session={session} />
            <AiFeedback session={session} />
            <AnswerReview session={session} />

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button asChild className="gap-2">
                <Link href={`/interview/${session.type}`}>
                  <RotateCcw className="size-4" />
                  Try Again
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
