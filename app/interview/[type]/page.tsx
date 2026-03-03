"use client"

import { use, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
import { Timer } from "@/components/interview/timer"
import { ViolationBanner } from "@/components/interview/violation-banner"
import { QuestionProgress } from "@/components/interview/progress-bar"
import { QuestionCard } from "@/components/interview/question-card"
import { CodingEditor } from "@/components/interview/coding-editor"
import { useInterview } from "@/lib/use-interview"
import { useAntiCheat } from "@/lib/use-anti-cheat"
import type { InterviewType, Question, CodingQuestion } from "@/lib/types"
import { INTERVIEW_TYPE_CONFIG } from "@/lib/types"
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Send,
  ArrowLeft,
} from "lucide-react"

function isCodingQ(q: Question | CodingQuestion): q is CodingQuestion {
  return "starterCode" in q
}

export default function InterviewPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type: rawType } = use(params)
  const type = rawType as InterviewType
  const router = useRouter()
  const config = INTERVIEW_TYPE_CONFIG[type]

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Interview Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              The interview type &quot;{rawType}&quot; is not recognized.
            </p>
            <Button asChild>
              <Link href="/">Go Back Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <InterviewSession type={type} config={config} />
}

function InterviewSession({
  type,
  config,
}: {
  type: InterviewType
  config: (typeof INTERVIEW_TYPE_CONFIG)[InterviewType]
}) {
  const router = useRouter()
  const {
    ready,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    answers,
    selectAnswer,
    submitCode,
    goToNext,
    goToPrevious,
    finishInterview,
    getAnswer,
  } = useInterview(type)

  const [codeAnswers, setCodeAnswers] = useState<Map<string, string>>(new Map())

  // Initialize coding starter code once questions are ready
  const [codeInitialized, setCodeInitialized] = useState(false)
  if (ready && !codeInitialized) {
    const map = new Map<string, string>()
    for (const q of questions) {
      if (isCodingQ(q)) {
        map.set(q.id, q.starterCode)
      }
    }
    setCodeAnswers(map)
    setCodeInitialized(true)
  }

  const handleFinish = useCallback(
    (violations: number) => {
      // Submit any unsaved coding answers
      for (const [qId, code] of codeAnswers) {
        if (!answers.has(qId)) {
          submitCode(qId, code)
        }
      }
      const sessionId = finishInterview(violations)
      router.push(`/results/${sessionId}`)
    },
    [codeAnswers, answers, submitCode, finishInterview, router]
  )

  const {
    violations,
    lastViolationType,
    showWarning,
    dismissWarning,
    remainingViolations,
  } = useAntiCheat(() => handleFinish(violations))

  const handleTimeUp = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      goToNext()
    } else {
      handleFinish(violations)
    }
  }, [currentIndex, totalQuestions, goToNext, handleFinish, violations])

  const handleCodeChange = useCallback(
    (questionId: string, code: string) => {
      setCodeAnswers((prev) => {
        const next = new Map(prev)
        next.set(questionId, code)
        return next
      })
      submitCode(questionId, code)
    },
    [submitCode]
  )

  const answeredIds = useMemo(
    () => new Set(answers.keys()),
    [answers]
  )

  const questionIds = useMemo(
    () => questions.map((q) => q.id),
    [questions]
  )

  const handleJump = useCallback(
    (index: number) => {
      // Using goToNext/goToPrevious in sequence would be slow.
      // Directly setting by clicking the progress dots.
      // We'll need to adapt the hook -- for now use next/prev
      const diff = index - currentIndex
      if (diff > 0) {
        for (let i = 0; i < diff; i++) goToNext()
      } else {
        for (let i = 0; i < Math.abs(diff); i++) goToPrevious()
      }
    },
    [currentIndex, goToNext, goToPrevious]
  )

  const currentAnswer = currentQuestion
    ? getAnswer(currentQuestion.id)
    : undefined

  const isCoding = currentQuestion ? isCodingQ(currentQuestion) : false

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Preparing your interview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ViolationBanner
        show={showWarning}
        violations={violations}
        remaining={remainingViolations}
        type={lastViolationType}
        onDismiss={dismissWarning}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon-sm">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
                <span className="sr-only">Back to dashboard</span>
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Brain className="size-3.5" />
              </div>
              <span className="text-sm font-semibold">{config.label} Interview</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {violations > 0 && (
              <span className="text-xs text-destructive">
                {violations} violation{violations !== 1 ? "s" : ""}
              </span>
            )}
            {currentQuestion && (
              <Timer
                duration={config.timePerQuestion}
                onTimeUp={handleTimeUp}
                questionKey={currentQuestion.id}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        <QuestionProgress
          current={currentIndex}
          total={totalQuestions}
          answeredIds={answeredIds}
          questionIds={questionIds}
          onJump={handleJump}
        />

        <div className="mt-6">
          {currentQuestion && !isCoding && (
            <QuestionCard
              question={currentQuestion as Question}
              selectedOption={currentAnswer?.selectedOption}
              onSelect={(option) =>
                selectAnswer(currentQuestion.id, option)
              }
              questionNumber={currentIndex + 1}
            />
          )}

          {currentQuestion && isCoding && (
            <CodingEditor
              question={currentQuestion as CodingQuestion}
              code={codeAnswers.get(currentQuestion.id) || ""}
              onCodeChange={(code) =>
                handleCodeChange(currentQuestion.id, code)
              }
              questionNumber={currentIndex + 1}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentIndex < totalQuestions - 1 ? (
              <Button onClick={goToNext} className="gap-2">
                Next
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="gap-2">
                    <Send className="size-4" />
                    Submit Interview
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit Interview?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You have answered {answeredIds.size} out of{" "}
                      {totalQuestions} questions. Unanswered questions will be
                      marked as incorrect. Are you sure you want to submit?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Practicing</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleFinish(violations)}
                    >
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
