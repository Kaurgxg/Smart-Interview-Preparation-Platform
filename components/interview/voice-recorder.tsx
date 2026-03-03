'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useVoiceRecorder } from '@/lib/use-voice-recorder'
import { analyzeVoiceMetrics } from '@/lib/voice-analysis'
import { Mic, Square, RotateCcw } from 'lucide-react'

interface VoiceRecorderProps {
  onSubmit: (transcript: string, duration: number, fillerCount: number, speakingPace: number, confidence: number) => void
  isSubmitting?: boolean
  disabled?: boolean
}

export function VoiceRecorder({ onSubmit, isSubmitting = false, disabled = false }: VoiceRecorderProps) {
  const { isRecording, transcript, interimTranscript, isSupported, startRecording, stopRecording, resetTranscript } =
    useVoiceRecorder()
  const [isAnswerRecorded, setIsAnswerRecorded] = useState(false)
  const [duration, setDuration] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Track recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const handleStartRecording = () => {
    setDuration(0)
    setIsAnswerRecorded(false)
    resetTranscript()
    startRecording()
  }

  const handleStopRecording = () => {
    stopRecording()
    if (transcript.trim()) {
      setIsAnswerRecorded(true)
    }
  }

  const handleSubmitAnswer = () => {
    const metrics = analyzeVoiceMetrics(transcript, duration)
    onSubmit(transcript, duration, metrics.fillerCount, metrics.speakingPace, 0)
    resetTranscript()
    setDuration(0)
    setIsAnswerRecorded(false)
  }

  const handleReRecord = () => {
    setDuration(0)
    setIsAnswerRecorded(false)
    resetTranscript()
  }

  const fullTranscript = transcript + interimTranscript
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isSupported) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Your browser doesn't support voice recording. Please use Chrome, Edge, or Safari.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isRecording && <div className="size-3 animate-pulse rounded-full bg-destructive" />}
            <span className="text-sm font-medium text-muted-foreground">{formatTime(duration)}</span>
          </div>

          <div className="flex gap-2">
            {!isRecording && !isAnswerRecorded ? (
              <Button
                onClick={handleStartRecording}
                disabled={disabled}
                size="sm"
                className="gap-2"
              >
                <Mic className="size-4" />
                Start Recording
              </Button>
            ) : isRecording ? (
              <Button onClick={handleStopRecording} disabled={disabled} size="sm" variant="destructive" className="gap-2">
                <Square className="size-4" />
                Stop Recording
              </Button>
            ) : null}

            {isAnswerRecorded && (
              <>
                <Button onClick={handleReRecord} disabled={disabled || isSubmitting} size="sm" variant="outline" className="gap-2">
                  <RotateCcw className="size-4" />
                  Re-record
                </Button>
                <Button onClick={handleSubmitAnswer} disabled={disabled || isSubmitting} size="sm">
                  Submit Answer
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Transcript Display */}
      {fullTranscript && (
        <Card className="p-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Your Response:</label>
            <div className="min-h-24 rounded-lg bg-muted p-3 text-sm leading-relaxed">
              {transcript}
              {interimTranscript && <span className="italic text-muted-foreground">{interimTranscript}</span>}
            </div>
          </div>
        </Card>
      )}

      {/* No Transcript Yet */}
      {!fullTranscript && !isRecording && (
        <Card className="border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">Click "Start Recording" and speak your answer clearly.</p>
        </Card>
      )}
    </div>
  )
}
