'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceRecorderReturn {
  isRecording: boolean
  transcript: string
  interimTranscript: string
  isSupported: boolean
  startRecording: () => void
  stopRecording: () => void
  resetTranscript: () => void
  browserSupportsSpeechRecognition: boolean
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptSegment + ' ')
        } else {
          interim += transcriptSegment
        }
      }

      setInterimTranscript(interim)

      // Reset silence timer on each result
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return

    setTranscript('')
    setInterimTranscript('')
    recognitionRef.current.start()
  }, [])

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isRecording,
    transcript,
    interimTranscript,
    isSupported,
    startRecording,
    stopRecording,
    resetTranscript,
    browserSupportsSpeechRecognition: isSupported,
  }
}
