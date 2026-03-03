"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import type { InterviewStats } from "@/lib/types"

interface WeakTopicsProps {
  stats: InterviewStats
}

export function WeakTopics({ stats }: WeakTopicsProps) {
  if (stats.weakTopics.length === 0) return null

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="size-4 text-warning" />
          Topics to Improve
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {stats.weakTopics.map(({ topic, accuracy }) => (
            <Badge
              key={topic}
              variant="outline"
              className="gap-1.5 border-warning/30 text-warning"
            >
              {topic}
              <span className="text-warning/60">{Math.round(accuracy)}%</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
