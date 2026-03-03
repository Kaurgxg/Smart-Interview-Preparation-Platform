"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { InterviewStats } from "@/lib/types"

interface PerformanceChartProps {
  stats: InterviewStats
}

export function PerformanceChart({ stats }: PerformanceChartProps) {
  if (stats.scoreHistory.length === 0) return null

  // Create indexed data for the chart
  const chartData = stats.scoreHistory.map((entry, index) => ({
    attempt: index + 1,
    score: entry.score,
    type: entry.type,
    date: entry.date,
  }))

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">Score History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.25 0.02 280)"
              />
              <XAxis
                dataKey="attempt"
                tick={{ fontSize: 12, fill: "oklch(0.6 0.02 280)" }}
                axisLine={{ stroke: "oklch(0.25 0.02 280)" }}
                label={{
                  value: "Attempt",
                  position: "insideBottom",
                  offset: -2,
                  style: { fontSize: 11, fill: "oklch(0.6 0.02 280)" },
                }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "oklch(0.6 0.02 280)" }}
                axisLine={{ stroke: "oklch(0.25 0.02 280)" }}
                label={{
                  value: "Score %",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11, fill: "oklch(0.6 0.02 280)" },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.015 280)",
                  border: "1px solid oklch(0.25 0.02 280)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0.01 280)",
                  fontSize: "12px",
                }}
                labelFormatter={(value) => `Attempt ${value}`}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  "Score",
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="oklch(0.65 0.2 270)"
                strokeWidth={2}
                dot={{
                  fill: "oklch(0.65 0.2 270)",
                  r: 4,
                  stroke: "oklch(0.17 0.015 280)",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
