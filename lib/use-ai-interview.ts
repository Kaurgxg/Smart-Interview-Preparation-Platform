'use client'

import { useState, useCallback } from 'react'
import type { AIQuestion, AIAnswer } from './types'
import type { InterviewModeConfig, InterviewType } from './types'
import { getQuestions } from './questions'
import { saveAISession } from './store'

export function useAIInterview(modeId: InterviewType, config: InterviewModeConfig) {
  const [questions, setQuestions] = useState<AIQuestion[]>([])
  const [ready, setReady] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AIAnswer[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [sessionId] = useState(() => `ai-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  // Initialize interview on mount
  const initializeInterview = useCallback(() => {
    const loadedQuestions = getQuestions(modeId, config.questionCount) as AIQuestion[]
    setQuestions(loadedQuestions)
    setAnswers([])
    setCurrentIndex(0)
    setIsFinished(false)
    setReady(true)
  }, [config.questionCount, modeId])

  const currentQuestion = ready ? questions[currentIndex] : null
  const totalQuestions = questions.length
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0

  const submitAnswer = useCallback(
    (transcript: string, duration: number, fillerCount: number, speakingPace: number, confidence: number) => {
      if (!currentQuestion) return

      const answer: AIAnswer = {
        questionId: currentQuestion.id,
        transcript,
        duration,
        fillerWords: fillerCount,
        speakingPace,
        confidence,
      }

      setAnswers((prev) => {
        // Remove old answer for this question if it exists
        const filtered = prev.filter((a) => a.questionId !== currentQuestion.id)
        return [...filtered, answer]
      })

      // Auto advance to next question
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1)
      }
    },
    [currentQuestion, currentIndex, totalQuestions]
  )

  const goToNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, totalQuestions])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const finishInterview = useCallback(async () => {
    const session = {
      sessionId,
      questions,
      answers,
      modeId,
    }

    await saveAISession(session)
    setIsFinished(true)
  }, [sessionId, questions, answers])

  const getAnswer = useCallback(
    (questionId: string) => {
      return answers.find((a) => a.questionId === questionId)
    },
    [answers]
  )

  return {
    ready,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    progress,
    answers,
    isFinished,
    sessionId,
    initializeInterview,
    submitAnswer,
    goToNext,
    goToPrevious,
    finishInterview,
    getAnswer,
  }
}
