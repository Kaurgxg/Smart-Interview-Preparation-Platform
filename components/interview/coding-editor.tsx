"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react"
import type { CodingQuestion } from "@/lib/types"

interface CodingEditorProps {
  question: CodingQuestion
  code: string
  onCodeChange: (code: string) => void
  questionNumber: number
}

export function CodingEditor({
  question,
  code,
  onCodeChange,
  questionNumber,
}: CodingEditorProps) {
  const [showHints, setShowHints] = useState(false)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Problem Description */}
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
          <CardTitle className="text-lg">
            <span className="text-muted-foreground">Q{questionNumber}. </span>
            {question.title}
          </CardTitle>
          <CardDescription className="whitespace-pre-wrap leading-relaxed text-foreground/80">
            {question.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">
                Expected Output
              </p>
              <p className="mt-1 font-mono text-sm text-foreground">
                {question.expectedOutput}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHints(!showHints)}
              className="w-fit gap-2 text-muted-foreground"
            >
              <Lightbulb className="size-4" />
              {showHints ? "Hide" : "Show"} Hints
              {showHints ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </Button>

            {showHints && (
              <div className="flex flex-col gap-2 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
                {question.hints.map((hint, i) => (
                  <p key={i} className="text-sm text-foreground/80">
                    <span className="font-medium text-warning">
                      Hint {i + 1}:{" "}
                    </span>
                    {hint}
                  </p>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Your Solution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="min-h-[400px] resize-none font-mono text-sm bg-muted/30 border-border/50 text-foreground"
            placeholder="Write your code here..."
            spellCheck={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}
