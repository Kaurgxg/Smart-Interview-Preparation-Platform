"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TimerProps {
  duration: number
  onTimeUp: () => void
  isPaused?: boolean
  questionKey: string
}

export function Timer({ duration, onTimeUp, isPaused, questionKey }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const onTimeUpRef = useRef(onTimeUp)
  onTimeUpRef.current = onTimeUp

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(duration)
  }, [questionKey, duration])

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimeout(() => onTimeUpRef.current(), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const percentage = (timeLeft / duration) * 100

  const isLow = percentage <= 25
  const isMedium = percentage <= 50 && !isLow

  return (
    <div className="flex items-center gap-2">
      <Clock
        className={cn(
          "size-4",
          isLow
            ? "text-destructive"
            : isMedium
              ? "text-warning"
              : "text-muted-foreground"
        )}
      />
      <div
        className={cn(
          "font-mono text-sm font-medium",
          isLow
            ? "text-destructive"
            : isMedium
              ? "text-warning"
              : "text-muted-foreground"
        )}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-1000",
            isLow
              ? "bg-destructive"
              : isMedium
                ? "bg-warning"
                : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
