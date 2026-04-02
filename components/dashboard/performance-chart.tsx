"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { InterviewStats } from "@/lib/types"

interface PerformanceChartProps {
  stats: InterviewStats | null | undefined
}

export function PerformanceChart({ stats }: PerformanceChartProps) {
  const scoreHistory = stats?.scoreHistory ?? []

  if (scoreHistory.length === 0) return null

  const chartData = scoreHistory.map((entry, index) => ({
    attempt: `Attempt ${index + 1}`,
    score: entry.score ?? 0,
    type: entry.type ?? "Unknown",
  }))

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            score: {
              label: "Score",
            },
          }}
          className="h-[300px] w-full"
        >
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="attempt"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="currentColor"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}