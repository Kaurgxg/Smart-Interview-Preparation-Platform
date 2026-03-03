"use client"

import { cn } from "@/lib/utils"

interface QuestionProgressProps {
  current: number
  total: number
  answeredIds: Set<string>
  questionIds: string[]
  onJump: (index: number) => void
}

export function QuestionProgress({
  current,
  total,
  answeredIds,
  questionIds,
  onJump,
}: QuestionProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {current + 1} of {total}
        </span>
        <span>{answeredIds.size} answered</span>
      </div>
      <div className="flex gap-1">
        {questionIds.map((id, index) => (
          <button
            key={id}
            onClick={() => onJump(index)}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              index === current
                ? "bg-primary"
                : answeredIds.has(id)
                  ? "bg-primary/40"
                  : "bg-muted"
            )}
            aria-label={`Go to question ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
