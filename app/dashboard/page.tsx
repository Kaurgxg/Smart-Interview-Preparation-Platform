"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { WeakTopics } from "@/components/dashboard/weak-topics"
import { HistoryTable } from "@/components/dashboard/history-table"
import { getStats, getHistory, clearHistory } from "@/lib/store"
import { INTERVIEW_TYPE_CONFIG } from "@/lib/types"
import type { InterviewStats, InterviewSession, InterviewType } from "@/lib/types"
import {
  Brain,
  Code,
  Users,
  Terminal,
  Mic,
  ArrowRight,
  Trash2,
  Rocket,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  code: Code,
  users: Users,
  terminal: Terminal,
  microphone: Mic,
}

const typeOrder: InterviewType[] = ["aptitude", "technical", "hr", "coding", "ai-interviewer"]

export default function DashboardPage() {
  const [stats, setStats] = useState<InterviewStats | null>(null)
  const [sessions, setSessions] = useState<InterviewSession[]>([])

  const loadData = useCallback(() => {
    setStats(getStats())
    setSessions(getHistory())
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleClearHistory = () => {
    clearHistory()
    loadData()
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="size-4" />
            </div>
            <span className="text-lg font-bold">InterviewAce</span>
          </Link>
          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <Trash2 className="size-3" />
                    Clear Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your interview history,
                      scores, and progress. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearHistory}>
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {stats.totalAttempts === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-6">
            <StatsCards stats={stats} />
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <PerformanceChart stats={stats} />
              <WeakTopics stats={stats} />
            </div>
            <HistoryTable sessions={sessions} />

            {/* Quick Start Section */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Quick Start
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {typeOrder.map((type) => {
                  const config = INTERVIEW_TYPE_CONFIG[type]
                  const Icon = iconMap[config.icon]
                  const href = type === "ai-interviewer" ? `/interview/ai-mode` : `/interview/${type}`
                  return (
                    <Button
                      key={type}
                      asChild
                      variant="outline"
                      className="h-auto justify-start gap-3 px-4 py-3"
                    >
                      <Link href={href}>
                        <Icon className="size-5 text-primary" />
                        <div className="text-left">
                          <p className="text-sm font-medium">
                            {config.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {config.questionCount} questions
                          </p>
                        </div>
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-8 py-20">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Rocket className="size-10" />
      </div>

      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Welcome to InterviewAce
        </h2>
        <p className="max-w-md text-muted-foreground">
          Start your first mock interview to see your performance analytics,
          score history, and personalized AI feedback.
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {typeOrder.map((type) => {
          const config = INTERVIEW_TYPE_CONFIG[type]
          const Icon = iconMap[config.icon]
          const href = type === "ai-interviewer" ? `/interview/ai-mode` : `/interview/${type}`
          return (
            <Card
              key={type}
              className="border-border/50 bg-card/50 transition-colors hover:border-primary/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{config.label}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {config.questionCount} questions, {config.timePerQuestion}s
                  each
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="sm" className="w-full gap-2">
                  <Link href={href}>
                    Start
                    <ArrowRight className="size-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
