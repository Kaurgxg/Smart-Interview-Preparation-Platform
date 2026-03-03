"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Question } from "@/lib/types"

interface QuestionCardProps {
  question: Question
  selectedOption: number | null | undefined
  onSelect: (option: number) => void
  questionNumber: number
}

export function QuestionCard({
  question,
  selectedOption,
  onSelect,
  questionNumber,
}: QuestionCardProps) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {question.topic}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              question.difficulty === "easy"
                ? "border-success/50 text-success"
                : question.difficulty === "medium"
                  ? "border-warning/50 text-warning"
                  : "border-destructive/50 text-destructive"
            )}
          >
            {question.difficulty}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-relaxed">
          <span className="text-muted-foreground">Q{questionNumber}. </span>
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                selectedOption === index
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/50 bg-card hover:border-primary/30 hover:bg-accent/50 text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-medium",
                  selectedOption === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
