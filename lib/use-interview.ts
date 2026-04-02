"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type {
  InterviewModeConfig,
  InterviewType,
  Question,
  CodingQuestion,
  Answer,
  InterviewSession,
} from "./types"
import { getQuestions } from "./questions"
import { saveSession } from "./store"

function isCodingQuestion(
  q: Question | CodingQuestion
): q is CodingQuestion {
  return "starterCode" in q
}

export type StandardInterviewType = Exclude<InterviewType, "ai-interviewer">

export function useInterview(type: StandardInterviewType, config: InterviewModeConfig) {
  const [questions, setQuestions] = useState<(Question | CodingQuestion)[]>([])
  const [ready, setReady] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Defer random shuffling to client-only to avoid hydration mismatch
  useEffect(() => {
    setQuestions(getQuestions(type, config.questionCount) as (Question | CodingQuestion)[])
    setReady(true)
  }, [type, config.questionCount])
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map())
  const [isFinished, setIsFinished] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const startTimeRef = useRef(Date.now())
  const questionStartRef = useRef(Date.now())

  useEffect(() => {
    setAnswers(new Map())
    setIsFinished(false)
    setSessionId(null)
    setCurrentIndex(0)
    startTimeRef.current = Date.now()
    questionStartRef.current = Date.now()
  }, [type])

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const progress = ((currentIndex + 1) / totalQuestions) * 100

  const selectAnswer = useCallback(
    (questionId: string, selectedOption: number) => {
      const question = questions.find((q) => q.id === questionId)
      if (!question || isCodingQuestion(question)) return

      const timeSpent = (Date.now() - questionStartRef.current) / 1000
      const isCorrect = selectedOption === question.correctAnswer

      setAnswers((prev) => {
        const next = new Map(prev)
        next.set(questionId, {
          questionId,
          selectedOption,
          timeSpent,
          isCorrect,
        })
        return next
      })
    },
    [questions]
  )

  const submitCode = useCallback(
    (questionId: string, code: string) => {
      const timeSpent = (Date.now() - questionStartRef.current) / 1000
      // For coding questions, we can't auto-grade perfectly,
      // but we check if the user wrote something meaningful
      const isCorrect = code.trim().length > 20

      setAnswers((prev) => {
        const next = new Map(prev)
        next.set(questionId, {
          questionId,
          selectedOption: null,
          codeAnswer: code,
          timeSpent,
          isCorrect,
        })
        return next
      })
    },
    []
  )

  const goToNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
      questionStartRef.current = Date.now()
    }
  }, [currentIndex, totalQuestions])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      questionStartRef.current = Date.now()
    }
  }, [currentIndex])

  const finishInterview = useCallback(
    (violations: number) => {
      const endTime = Date.now()
      const answersArray = Array.from(answers.values())
      const score = answersArray.filter((a) => a.isCorrect).length

      const id = `session-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`

      const session: InterviewSession = {
        id,
        type,
        questions,
        answers: answersArray,
        startTime: startTimeRef.current,
        endTime,
        violations,
        score,
        totalQuestions,
      }

      saveSession(session)
      setSessionId(id)
      setIsFinished(true)

      return id
    },
    [answers, questions, totalQuestions, type]
  )

  const getAnswer = useCallback(
    (questionId: string) => answers.get(questionId),
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
    selectAnswer,
    submitCode,
    goToNext,
    goToPrevious,
    finishInterview,
    getAnswer,
    isCodingQuestion,
    config,
  }
}
