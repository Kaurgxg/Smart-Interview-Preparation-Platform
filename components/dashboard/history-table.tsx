"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"
import type { InterviewSession } from "@/lib/types"

interface HistoryTableProps {
  sessions: InterviewSession[]
}

export function HistoryTable({ sessions }: HistoryTableProps) {
  if (sessions.length === 0) return null

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">Recent Attempts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Score</TableHead>
              <TableHead className="text-muted-foreground">Accuracy</TableHead>
              <TableHead className="text-right text-muted-foreground">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.slice(0, 10).map((session) => {
              const percentage = Math.round(
                (session.score / session.totalQuestions) * 100
              )
              return (
                <TableRow key={session.id} className="border-border/50">
                  <TableCell className="text-sm text-foreground">
                    {new Date(session.endTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {session.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {session.score}/{session.totalQuestions}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        percentage >= 70
                          ? "text-success"
                          : percentage >= 50
                            ? "text-warning"
                            : "text-destructive"
                      )}
                    >
                      {percentage}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/results/${session.id}`}>
                        <ExternalLink className="size-3" />
                        <span className="sr-only">View results</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
