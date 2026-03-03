"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Minus,
} from "lucide-react"
import type { InterviewSession, Question, CodingQuestion } from "@/lib/types"

interface AnswerReviewProps {
  session: InterviewSession
}

function isMcq(q: Question | CodingQuestion): q is Question {
  return "options" in q
}

export function AnswerReview({ session }: AnswerReviewProps) {
  const [expanded, setExpanded] = useState(false)

  const reviewItems = session.questions.map((question, index) => {
    const answer = session.answers.find(
      (a) => a.questionId === question.id
    )
    return { question, answer, index }
  })

  const displayItems = expanded ? reviewItems : reviewItems.slice(0, 3)

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">Answer Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {displayItems.map(({ question, answer, index }) => (
            <div
              key={question.id}
              className="rounded-lg border border-border/50 px-4 py-3"
            >
              <div className="flex items-start gap-2">
                {answer?.isCorrect ? (
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-success" />
                ) : answer ? (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                ) : (
                  <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">
                      Q{index + 1}.{" "}
                    </span>
                    {isMcq(question) ? question.question : question.title}
                  </p>
                  {isMcq(question) && (
                    <div className="mt-2 flex flex-col gap-1 text-xs">
                      {answer && answer.selectedOption !== null ? (
                        <p
                          className={cn(
                            answer.isCorrect
                              ? "text-success"
                              : "text-destructive"
                          )}
                        >
                          Your answer:{" "}
                          {question.options[answer.selectedOption]}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">Not answered</p>
                      )}
                      {!answer?.isCorrect && (
                        <p className="text-success">
                          Correct answer:{" "}
                          {question.options[question.correctAnswer]}
                        </p>
                      )}
                      {"explanation" in question && (
                        <p className="mt-1 text-muted-foreground">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {question.topic}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {reviewItems.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-3 w-full gap-2"
          >
            {expanded ? (
              <>
                Show Less <ChevronUp className="size-3" />
              </>
            ) : (
              <>
                Show All {reviewItems.length} Questions{" "}
                <ChevronDown className="size-3" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
