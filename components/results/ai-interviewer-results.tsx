'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { AIFeedback, AIQuestion, AIAnswer } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AIInterviewerResultsProps {
  questions: AIQuestion[]
  answers: AIAnswer[]
}

export function AIInterviewerResults({ questions, answers }: AIInterviewerResultsProps) {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const evaluateInterview = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/evaluate-ai-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions, answers }),
        })

        if (!response.ok) {
          throw new Error('Failed to evaluate interview')
        }

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-destructive'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success/10'
    if (score >= 60) return 'bg-warning/10'
    return 'bg-destructive/10'
  }

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Analyzing your interview...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !feedback) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="py-6">
          <p className="text-sm text-destructive">{error || 'Failed to load feedback'}</p>
        </CardContent>
      </Card>
    )
  }

  const scoreData = [
    { name: 'Answer Quality', value: feedback.answerQuality },
    { name: 'Communication', value: feedback.communication },
    { name: 'Technical Depth', value: feedback.technicalDepth },
    { name: 'Soft Skills', value: feedback.softSkills },
    { name: 'Authenticity', value: 100 - (feedback.plagiarismScore || 0) },
  ]

  const chartData = scoreData.map((item) => ({
    name: item.name,
    score: item.value,
  }))

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className={`border-border ${getScoreBg(feedback.overallScore)}`}>
        <CardHeader>
          <CardTitle className="text-center">Overall Performance</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className={`text-5xl font-bold ${getScoreColor(feedback.overallScore)}`}>
            {feedback.overallScore}
            <span className="text-lg">/100</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {feedback.overallScore >= 80
              ? 'Excellent performance!'
              : feedback.overallScore >= 60
                ? 'Good performance. Areas for improvement below.'
                : 'Keep practicing. Focus on the areas below.'}
          </p>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scoreData.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name}</span>
                <span className={`text-sm font-bold ${getScoreColor(item.value)}`}>
                  {item.value}/100
                </span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--primary)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-success">Your Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 inline-block size-2 rounded-full bg-success" />
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Areas to Improve */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-warning">Areas to Improve</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {feedback.areasToImprove.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 inline-block size-2 rounded-full bg-warning" />
                <span className="text-sm">{area}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Detailed Feedback */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Detailed Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {feedback.detailedFeedback}
          </p>
        </CardContent>
      </Card>

      {/* Answer Details */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Your Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {answers.map((answer, idx) => {
            const question = questions.find((q) => q.id === answer.questionId)
            return (
              <div key={answer.questionId} className="border-b border-border pb-4 last:border-0">
                <h4 className="mb-2 font-medium">{question?.question}</h4>
                <div className="mb-3 flex gap-4 text-xs text-muted-foreground">
                  <span>Duration: {answer.duration}s</span>
                  <span>Filler words: {answer.fillerWords}</span>
                  <span>Pace: {answer.speakingPace} WPM</span>
                </div>
                <p className="rounded-lg bg-muted p-3 text-sm">{answer.transcript}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
