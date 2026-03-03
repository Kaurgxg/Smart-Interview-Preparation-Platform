"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import type { InterviewSession } from "@/lib/types"

interface ScoreSummaryProps {
  session: InterviewSession
}

export function ScoreSummary({ session }: ScoreSummaryProps) {
  const percentage = Math.round(
    (session.score / session.totalQuestions) * 100
  )
  const timeTaken = Math.round(
    (session.endTime - session.startTime) / 1000 / 60
  )
  const incorrect = session.totalQuestions - session.score

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: "Excellent", color: "text-success" }
    if (pct >= 70) return { label: "Good", color: "text-chart-2" }
    if (pct >= 50) return { label: "Average", color: "text-warning" }
    return { label: "Needs Improvement", color: "text-destructive" }
  }

  const grade = getGrade(percentage)

  return (
    <div className="flex flex-col gap-6">
      {/* Score Circle */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="relative flex size-36 items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.64} ${264 - percentage * 2.64}`}
                className={cn(
                  percentage >= 70
                    ? "text-success"
                    : percentage >= 50
                      ? "text-warning"
                      : "text-destructive"
                )}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">
                {percentage}%
              </span>
              <span className="text-xs text-muted-foreground">Score</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("text-sm", grade.color)}
          >
            {grade.label}
          </Badge>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <CheckCircle className="size-5 text-success" />
            <div>
              <p className="text-2xl font-bold text-foreground">{session.score}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <XCircle className="size-5 text-destructive" />
            <div>
              <p className="text-2xl font-bold text-foreground">{incorrect}</p>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <Clock className="size-5 text-chart-2" />
            <div>
              <p className="text-2xl font-bold text-foreground">{timeTaken}m</p>
              <p className="text-xs text-muted-foreground">Time Taken</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <AlertTriangle
              className={cn(
                "size-5",
                session.violations > 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {session.violations}
              </p>
              <p className="text-xs text-muted-foreground">Violations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
