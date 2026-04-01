'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { AIFeedback, AIQuestion, AIAnswer } from '@/lib/types'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface AIInterviewerResultsProps {
  questions: AIQuestion[]
  answers: AIAnswer[]
}

export function AIInterviewerResults({ questions, answers }: AIInterviewerResultsProps) {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  useEffect(() => {
    const evaluateInterview = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/evaluate-ai-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions, answers }),
        })
        if (!response.ok) throw new Error('Failed to evaluate interview')
        const data = await response.json()
        setFeedback(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    evaluateInterview()
  }, [questions, answers])

  const getScoreColor = (score: number) =>
    score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500'

  const getScoreBadge = (score: number) =>
    score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'

  const getScoreLabel = (score: number) =>
    score >= 80 ? 'Strong' : score >= 60 ? 'Good' : 'Needs Work'

  const getProgressColor = (score: number) =>
    score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-12">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <div className="absolute inset-2 animate-spin rounded-full border-2 border-primary/40 border-t-transparent [animation-direction:reverse]" />
            </div>
            <div className="text-center">
              <p className="font-medium">Analyzing your interview...</p>
              <p className="mt-1 text-sm text-muted-foreground">Our AI is reviewing each of your responses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !feedback) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="py-8 text-center">
          <XCircle className="mx-auto mb-3 size-8 text-destructive" />
          <p className="font-medium text-destructive">Could not load feedback</p>
          <p className="mt-1 text-sm text-muted-foreground">{error || 'Please try again'}</p>
        </CardContent>
      </Card>
    )
  }

  const scoreBreakdown = [
    { name: 'Answer Quality', value: feedback.answerQuality, key: 'answerQuality' },
    { name: 'Communication', value: feedback.communication, key: 'communication' },
    { name: 'Technical Depth', value: feedback.technicalDepth, key: 'technicalDepth' },
    { name: 'Soft Skills', value: feedback.softSkills, key: 'softSkills' },
  ]

  const radarData = scoreBreakdown.map((item) => ({
    subject: item.name.split(' ')[0], // Short label for radar
    score: item.value,
    fullMark: 100,
  }))

  return (
    <div className="space-y-6">
      {/* Fallback warning */}
      {feedback.usedFallback && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="size-4 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              AI feedback is currently unavailable. Showing basic evaluation. Try again for detailed analysis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Overall Score */}
      <Card className="border-border overflow-hidden">
        <div className={`h-1 w-full ${getProgressColor(feedback.overallScore)}`} />
        <CardContent className="py-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Overall Score</p>
          <div className={`mt-2 text-7xl font-bold tabular-nums ${getScoreColor(feedback.overallScore)}`}>
            {feedback.overallScore}
            <span className="text-2xl font-normal text-muted-foreground">/100</span>
          </div>
          <Badge className="mt-3" variant={getScoreBadge(feedback.overallScore)}>
            {getScoreLabel(feedback.overallScore)}
          </Badge>
          <p className="mt-3 text-sm text-muted-foreground">
            {feedback.overallScore >= 80
              ? 'Excellent performance — you are interview-ready!'
              : feedback.overallScore >= 60
                ? 'Good performance with some areas to refine.'
                : 'Keep practicing — focus on the areas below.'}
          </p>
        </CardContent>
      </Card>

      {/* Score Breakdown + Radar side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bars */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {scoreBreakdown.map((item) => (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className={`font-bold tabular-nums ${getScoreColor(item.value)}`}>
                    {item.value}/100
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getProgressColor(item.value)}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Radar */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.75rem',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Strengths + Areas to Improve */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.areasToImprove.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                  {area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Feedback */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {feedback.detailedFeedback}
          </p>
        </CardContent>
      </Card>

      {/* Per-Question Feedback (expandable) */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Question-by-Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {answers.map((answer, idx) => {
            const question = questions.find((q) => q.id === answer.questionId)
            const qFeedback = feedback.perQuestionFeedback?.find(
              (f) => f.questionId === answer.questionId
            )
            const isExpanded = expandedQuestion === answer.questionId

            return (
              <div
                key={answer.questionId}
                className="overflow-hidden rounded-lg border border-border"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedQuestion(isExpanded ? null : answer.questionId)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="line-clamp-1 text-sm font-medium">
                      {question?.question ?? 'Unknown question'}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {qFeedback && (
                      <span className={`text-sm font-bold tabular-nums ${getScoreColor(qFeedback.score)}`}>
                        {qFeedback.score}/100
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Voice metrics */}
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="outline" className="text-xs">
                        ⏱ {answer.duration}s
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        🗣 {answer.speakingPace} WPM
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        💬 {answer.fillerWords} filler words
                      </Badge>
                    </div>

                    {/* Transcript */}
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Your Answer
                      </p>
                      <p className="rounded-lg bg-muted p-3 text-sm leading-relaxed">
                        {answer.transcript || <span className="italic text-muted-foreground">No answer recorded</span>}
                      </p>
                    </div>

                    {/* AI feedback */}
                    {qFeedback && (
                      <>
                        <div>
                          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Feedback
                          </p>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {qFeedback.feedback}
                          </p>
                        </div>

                        {qFeedback.keyPoints?.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              What you did well
                            </p>
                            <ul className="space-y-1">
                              {qFeedback.keyPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {qFeedback.missedPoints?.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              What to improve
                            </p>
                            <ul className="space-y-1">
                              {qFeedback.missedPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}