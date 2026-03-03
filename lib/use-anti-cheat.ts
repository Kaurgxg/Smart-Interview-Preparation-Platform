"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { VIOLATION_THRESHOLD } from "./types"

export function useAntiCheat(onAutoSubmit: () => void) {
  const [violations, setViolations] = useState(0)
  const [lastViolationType, setLastViolationType] = useState<string | null>(
    null
  )
  const [showWarning, setShowWarning] = useState(false)
  const autoSubmitRef = useRef(onAutoSubmit)
  autoSubmitRef.current = onAutoSubmit

  const addViolation = useCallback((type: string) => {
    setViolations((prev) => {
      const next = prev + 1
      if (next >= VIOLATION_THRESHOLD) {
        // Defer the auto-submit to avoid state update during render
        setTimeout(() => autoSubmitRef.current(), 0)
      }
      return next
    })
    setLastViolationType(type)
    setShowWarning(true)
    setTimeout(() => setShowWarning(false), 3000)
  }, [])

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        addViolation("tab-switch")
      }
    }

    function handlePaste(e: ClipboardEvent) {
      e.preventDefault()
      addViolation("paste")
    }

    function handleCopy(e: ClipboardEvent) {
      e.preventDefault()
      addViolation("copy")
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("paste", handlePaste, true)
    document.addEventListener("copy", handleCopy, true)

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      )
      document.removeEventListener("paste", handlePaste, true)
      document.removeEventListener("copy", handleCopy, true)
    }
  }, [addViolation])

  const dismissWarning = useCallback(() => {
    setShowWarning(false)
  }, [])

  return {
    violations,
    lastViolationType,
    showWarning,
    dismissWarning,
    remainingViolations: VIOLATION_THRESHOLD - violations,
  }
}
