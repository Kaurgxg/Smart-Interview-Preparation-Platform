'use client'

import { useEffect, useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Target,
  XCircle,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAIFeedbackSummary } from '@/lib/store'
import type { AIAnswer, AIFeedback, AIQuestion, QuestionScore } from '@/lib/types'

interface AIInterviewerResultsProps {
  sessionId?: string
  questions: AIQuestion[]
  answers: AIAnswer[]
}

function MarkDots({ earned, max }: { earned: number; max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, index) => (
        <span
          key={index}
          className={`inline-block size-3 rounded-full border-2 transition-colors ${
            index < earned
              ? 'border-primary bg-primary'
              : 'border-muted-foreground/30 bg-transparent'
          }`}
        />
      ))}
    </div>
  )
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color =
    score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'
  const stroke =
    score >= 75 ? 'stroke-emerald-500' : score >= 50 ? 'stroke-amber-500' : 'stroke-red-500'
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-24">
        <svg className="size-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} className="fill-none stroke-muted/40" strokeWidth="7" />
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={`fill-none ${stroke}`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums ${color}`}
        >
          {score}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function AIInterviewerResults({
  sessionId,
  questions,
  answers,
}: AIInterviewerResultsProps) {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedQ, setExpandedQ] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const res = await fetch('/api/evaluate-ai-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions, answers }),
        })

        if (!res.ok) {
          throw new Error('Failed to evaluate interview')
        }

        const result = (await res.json()) as AIFeedback
        if (!cancelled) {
          setFeedback(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [questions, answers])

  useEffect(() => {
    if (!sessionId || !feedback) return

    void saveAIFeedbackSummary(sessionId, {
      overallScore: feedback.overallScore,
      rawScore: feedback.rawScore,
      maxScore: feedback.maxScore,
    })
  }, [feedback, sessionId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="relative size-14">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <div className="absolute inset-2 animate-spin rounded-full border-2 border-primary/40 border-t-transparent [animation-direction:reverse]" />
          </div>
          <div>
            <p className="font-semibold">Evaluating your interview...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Checking keyword coverage, relevance, and confidence
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !feedback) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-10 text-center">
          <XCircle className="mx-auto mb-3 size-9 text-destructive" />
          <p className="font-medium text-destructive">Could not load feedback</p>
          <p className="mt-1 text-sm text-muted-foreground">{error ?? 'Please try again'}</p>
        </CardContent>
      </Card>
    )
  }

  const scoreColor =
    feedback.overallScore >= 75
      ? 'text-emerald-500'
      : feedback.overallScore >= 50
        ? 'text-amber-500'
        : 'text-red-500'
  const progressColor =
    feedback.overallScore >= 75
      ? 'bg-emerald-500'
      : feedback.overallScore >= 50
        ? 'bg-amber-500'
        : 'bg-red-500'
  const radarData = [
    { subject: 'Relevance', score: feedback.answerRelevance },
    { subject: 'Keywords', score: feedback.keywordCoverage },
    { subject: 'Confidence', score: feedback.confidence },
  ]

  return (
    <div className="space-y-6">
      {feedback.usedFallback && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertTriangle className="size-4 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              AI evaluation is unavailable, so basic scoring is being shown instead.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className={`h-1 w-full ${progressColor}`} />
        <CardContent className="py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Overall Score
          </p>
          <div className={`mt-2 text-7xl font-bold leading-none tabular-nums ${scoreColor}`}>
            {feedback.overallScore}
            <span className="text-2xl font-normal text-muted-foreground">/100</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Raw: {feedback.rawScore}/{feedback.maxScore} marks | {feedback.maxScore / 5} questions x
            {' '}5 marks each
          </p>
          <Badge
            className="mt-3"
            variant={
              feedback.overallScore >= 75
                ? 'default'
                : feedback.overallScore >= 50
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {feedback.overallScore >= 75
              ? 'Excellent'
              : feedback.overallScore >= 50
                ? 'Good'
                : 'Keep Practicing'}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around py-2">
              <ScoreRing score={feedback.answerRelevance} label="Relevance" />
              <ScoreRing score={feedback.keywordCoverage} label="Keywords" />
              <ScoreRing score={feedback.confidence} label="Confidence" />
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="size-3.5 text-primary" />
                <span><strong>Relevance (2 pts)</strong> | how directly the answer addresses the question</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="size-3.5 text-primary" />
                <span><strong>Keywords (2 pts)</strong> | expected concepts and phrases covered</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="size-3.5 text-primary" />
                <span><strong>Confidence (1 pt)</strong> | pace, fillers, and delivery quality</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                />
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.areasToImprove.map((area, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                  {area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {feedback.detailedFeedback}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question-by-Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {answers.map((answer, index) => {
            const question = questions.find((item) => item.id === answer.questionId)
            const score = feedback.perQuestionScores?.find(
              (item) => item.questionId === answer.questionId
            )
            const isExpanded = expandedQ === answer.questionId
            const isUnanswered = !answer.transcript?.trim()
            const markColor =
              (score?.totalMark ?? 0) >= 4
                ? 'text-emerald-500'
                : (score?.totalMark ?? 0) >= 2
                  ? 'text-amber-500'
                  : 'text-red-500'

            return (
              <QuestionBreakdown
                key={answer.questionId}
                answer={answer}
                question={question}
                score={score}
                isExpanded={isExpanded}
                isUnanswered={isUnanswered}
                index={index}
                markColor={markColor}
                onToggle={() =>
                  setExpandedQ(isExpanded ? null : answer.questionId)
                }
              />
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

interface QuestionBreakdownProps {
  answer: AIAnswer
  question: AIQuestion | undefined
  score: QuestionScore | undefined
  isExpanded: boolean
  isUnanswered: boolean
  index: number
  markColor: string
  onToggle: () => void
}

function QuestionBreakdown({
  answer,
  question,
  score,
  isExpanded,
  isUnanswered,
  index,
  markColor,
  onToggle,
}: QuestionBreakdownProps) {
  const matchedKeywords = score?.matchedKeywords ?? []
  const missedKeywords = score?.missedKeywords ?? []
  const coveredPoints = score?.keyPointsCovered ?? []
  const missedPoints = score?.keyPointsMissed ?? []

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
          {index + 1}
        </span>
        <span className="flex-1 line-clamp-1 text-sm font-medium">
          {question?.question ?? 'Question'}
        </span>
        <div className="flex shrink-0 items-center gap-3">
          {isUnanswered ? (
            <Badge variant="destructive" className="text-xs">
              Unanswered | 0/5
            </Badge>
          ) : (
            <>
              <MarkDots earned={score?.totalMark ?? 0} max={5} />
              <span className={`text-sm font-bold tabular-nums ${markColor}`}>
                {score?.totalMark ?? 0}/5
              </span>
            </>
          )}
          {isExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-5 border-t border-border bg-muted/20 p-4">
          {score && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Relevance',
                  earned: score.relevanceMark,
                  max: 2,
                  icon: <Target className="size-3" />,
                },
                {
                  label: 'Keywords',
                  earned: score.keywordMark,
                  max: 2,
                  icon: <MessageSquare className="size-3" />,
                },
                {
                  label: 'Confidence',
                  earned: score.confidenceMark,
                  max: 1,
                  icon: <Zap className="size-3" />,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 text-center"
                >
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {item.icon}
                    {item.label}
                  </div>
                  <MarkDots earned={item.earned} max={item.max} />
                  <span className="text-xs font-bold">
                    {item.earned}/{item.max}
                  </span>
                </div>
              ))}
            </div>
          )}

          {score?.confidenceBreakdown && (
            <p className="text-xs text-muted-foreground">{score.confidenceBreakdown}</p>
          )}

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Answer
            </p>
            {isUnanswered ? (
              <p className="italic text-sm text-muted-foreground">No answer was recorded.</p>
            ) : (
              <p className="rounded-lg bg-muted p-3 text-sm leading-relaxed">{answer.transcript}</p>
            )}
          </div>

          {score?.relevanceFeedback && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Relevance Feedback
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {score.relevanceFeedback}
              </p>
            </div>
          )}

          {(matchedKeywords.length > 0 || missedKeywords.length > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {matchedKeywords.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Keywords Used
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedKeywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {missedKeywords.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                    Keywords Missed
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {missedKeywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="border-red-500/40 bg-red-500/10 text-xs text-red-700 dark:text-red-300"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(coveredPoints.length > 0 || missedPoints.length > 0) && (
            <div className="space-y-3">
              {coveredPoints.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Key Points Covered
                  </p>
                  <ul className="space-y-1">
                    {coveredPoints.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {missedPoints.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Key Points Missed
                  </p>
                  <ul className="space-y-1">
                    {missedPoints.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
