import { useRef, useEffect } from "react"
import { useStore } from "@/store"

export function useSpeech() {
  const recognitionRef = useRef<any>(null)
  const { status, showCaptions, setActiveCaptions, addCaption } = useStore()

  useEffect(() => {
    if (!showCaptions || status !== "recording") {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results as SpeechRecognitionResultList)
      const latest = results[results.length - 1]
      const transcript = latest[0].transcript.trim()
      if (!transcript) return

      const caption = {
        id: Date.now().toString(),
        text: transcript.toUpperCase(),
        startTime: Date.now() / 1000,
        endTime: Date.now() / 1000 + 3,
      }

      if (latest.isFinal) addCaption(caption)
      setActiveCaptions([caption])
      setTimeout(() => setActiveCaptions([]), 3000)
    }

    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech") console.warn("Speech error:", e.error)
    }

    recognition.onend = () => {
      if (showCaptions && useStore.getState().status === "recording") {
        recognition.start()
      }
    }

    recognition.start()
    recognitionRef.current = recognition

    return () => recognition.stop()
  }, [showCaptions, status])
}