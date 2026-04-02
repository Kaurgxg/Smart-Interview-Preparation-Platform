"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { getInterviewModes, subscribeToInterviewCatalogUpdates } from "@/lib/interview-catalog"
import { getStats, getHistory, clearHistory } from "@/lib/store"
import { useAuth } from "@/hooks/use-auth"
import type { InterviewModeConfig, InterviewStats, InterviewSession } from "@/lib/types"
import {
  Brain,
  Code,
  Users,
  Terminal,
  Mic,
  ArrowRight,
  Trash2,
  Rocket,
  LogOut,
  UserCircle2,
} from "lucide-react"
import { toast } from "sonner"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  code: Code,
  users: Users,
  terminal: Terminal,
  microphone: Mic,
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth()
  const [stats, setStats] = useState<InterviewStats | null>(null)
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [clearingData, setClearingData] = useState(false)
  const [modes, setModes] = useState<InterviewModeConfig[]>([])

  const loadData = useCallback(async () => {
    const [rawStats, history] = await Promise.all([getStats(), getHistory()])

    const safeStats: InterviewStats = {
      totalAttempts: rawStats?.totalAttempts ?? 0,
      averageScore: rawStats?.averageScore ?? 0,
      bestScore: rawStats?.bestScore ?? 0,
      totalTime: rawStats?.totalTime ?? 0,
      weakTopics: rawStats?.weakTopics ?? [],
      scoreHistory: rawStats?.scoreHistory ?? [],
    }

    setStats(safeStats)
    setSessions(history ?? [])
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    const loadModes = () => {
      setModes(getInterviewModes())
    }

    loadModes()
    return subscribeToInterviewCatalogUpdates(loadModes)
  }, [])

  const handleClearHistory = async () => {
    const previousStats = stats
    const previousSessions = sessions

    setClearingData(true)
    setSessions([])
    setStats({
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      totalTime: 0,
      weakTopics: [],
      scoreHistory: [],
    })

    try {
      await clearHistory()
      await loadData()
      toast.success("All saved interview data was cleared.")
    } catch (error) {
      setSessions(previousSessions)
      setStats(previousStats)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to clear saved interview data."
      )
    } finally {
      setClearingData(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  if (authLoading || !stats) {
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
            {user && (
              <div className="hidden items-center gap-3 rounded-lg border border-border/60 bg-card/70 px-3 py-2 sm:flex">
                <UserCircle2 className="size-4 text-primary" />
                <div className="leading-tight">
                  <p className="text-sm font-medium text-foreground">
                    {user.fullName || "Candidate"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}
            {sessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <Trash2 className="size-3" />
                    {clearingData ? "Clearing..." : "Clear Data"}
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
                    <AlertDialogAction
                      onClick={() => void handleClearHistory()}
                      disabled={clearingData}
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={() => router.push("/admin")}
              >
                <Brain className="size-3.5" />
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {stats.totalAttempts === 0 ? (
          <EmptyState modes={modes} />
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
                {modes.map((mode) => {
                  const Icon = iconMap[mode.icon] ?? Brain
                  const href =
                    mode.kind === "ai-interviewer"
                      ? `/interview/ai-mode?mode=${encodeURIComponent(mode.id)}`
                      : `/interview/${mode.id}`
                  return (
                    <Button
                      key={mode.id}
                      asChild
                      variant="outline"
                      className="h-auto justify-start gap-3 px-4 py-3"
                    >
                      <Link href={href}>
                        <Icon className="size-5 text-primary" />
                        <div className="text-left">
                          <p className="text-sm font-medium">
                            {mode.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {mode.questionCount} questions
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

function EmptyState({ modes }: { modes: InterviewModeConfig[] }) {
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
        {modes.map((mode) => {
          const Icon = iconMap[mode.icon] ?? Brain
          const href =
            mode.kind === "ai-interviewer"
              ? `/interview/ai-mode?mode=${encodeURIComponent(mode.id)}`
              : `/interview/${mode.id}`
          return (
            <Card
              key={mode.id}
              className="border-border/50 bg-card/50 transition-colors hover:border-primary/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{mode.label}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {mode.questionCount} questions, {mode.timePerQuestion}s
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
