'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAIInterview } from '@/lib/use-ai-interview'
import { VoiceRecorder } from '@/components/interview/voice-recorder'
import { QuestionProgress } from '@/components/interview/progress-bar'
import { ArrowLeft } from 'lucide-react'

export default function AIInterviewPage() {
  const router = useRouter()
  const {
    ready,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    progress,
    isFinished,
    sessionId,
    initializeInterview,
    submitAnswer,
    goToNext,
    goToPrevious,
    finishInterview,
  } = useAIInterview()

  useEffect(() => {
    initializeInterview()
  }, [initializeInterview])

  // Redirect when interview is finished
  useEffect(() => {
    if (isFinished) {
      router.push(`/results/${sessionId}`)
    }
  }, [isFinished, sessionId, router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Preparing your AI interview...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Interview not available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="size-4" />
                Back
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-lg font-semibold">AI Interviewer</h1>
              <p className="text-xs text-muted-foreground">
                Question {currentIndex + 1} of {totalQuestions}
              </p>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-8">
          <QuestionProgress 
            current={currentIndex} 
            total={totalQuestions}
            answeredIds={new Set()}
            questionIds={questions.map((q: any) => q.id)}
            onJump={() => {}}
          />
        </div>

        {/* Question Card */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Take your time to answer. Aim for a 2-3 minute response.
            </p>
          </CardHeader>
        </Card>

        {/* Voice Recorder */}
        <div className="mb-8">
          <VoiceRecorder
            onSubmit={(transcript, duration, fillerCount, speakingPace, confidence) => {
              submitAnswer(transcript, duration, fillerCount, speakingPace, confidence)
            }}
            disabled={false}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            variant="outline"
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </div>

          {currentIndex === totalQuestions - 1 ? (
            <Button
              onClick={() => {
                finishInterview()
              }}
            >
              Finish Interview
            </Button>
          ) : (
            <Button onClick={goToNext} disabled={!currentQuestion}>
              Next
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
