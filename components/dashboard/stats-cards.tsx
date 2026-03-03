"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target, Trophy, TrendingUp, Clock } from "lucide-react"
import type { InterviewStats } from "@/lib/types"

interface StatsCardsProps {
  stats: InterviewStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatTime = (ms: number) => {
    const minutes = Math.round(ms / 1000 / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const cards = [
    {
      label: "Total Attempts",
      value: stats.totalAttempts.toString(),
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Average Score",
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "Best Score",
      value: `${stats.bestScore}%`,
      icon: Trophy,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Total Time",
      value: formatTime(stats.totalTime),
      icon: Clock,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/50 bg-card/80">
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <div
              className={`flex size-10 items-center justify-center rounded-lg ${card.bgColor}`}
            >
              <card.icon className={`size-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
