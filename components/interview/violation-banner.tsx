"use client"

import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ViolationBannerProps {
  show: boolean
  violations: number
  remaining: number
  type: string | null
  onDismiss: () => void
}

export function ViolationBanner({
  show,
  violations,
  remaining,
  type,
  onDismiss,
}: ViolationBannerProps) {
  if (!show) return null

  const typeLabel =
    type === "tab-switch"
      ? "Tab switch detected"
      : type === "paste"
        ? "Paste detected"
        : type === "copy"
          ? "Copy detected"
          : "Violation detected"

  return (
    <div
      className={cn(
        "fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b px-4 py-3 transition-all",
        remaining <= 1
          ? "border-destructive/50 bg-destructive/10 text-destructive"
          : "border-warning/50 bg-warning/10 text-warning-foreground"
      )}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="size-5 shrink-0" />
        <div>
          <p className="text-sm font-medium">{typeLabel}</p>
          <p className="text-xs opacity-80">
            Warning {violations}/3 -- {remaining > 0
              ? `${remaining} remaining before auto-submit`
              : "Auto-submitting..."}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDismiss}
        className="shrink-0"
      >
        <X className="size-4" />
        <span className="sr-only">Dismiss warning</span>
      </Button>
    </div>
  )
}
