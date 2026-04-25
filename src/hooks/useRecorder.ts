import { useRef } from "react"
import { useStore } from "@/store"

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef(0)

  const { setStatus, setDuration, setHasRecording, setRecordingBlob } = useStore()

  function startTimer() {
    timerRef.current = setInterval(() => {
      durationRef.current += 1
      setDuration(durationRef.current)
    }, 1000)
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    durationRef.current = 0
    setDuration(0)
  }

  async function startRecording() {
    chunksRef.current = []
    setHasRecording(false)
    setRecordingBlob(null)

    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: { ideal: 30 },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: true,
    })

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })
      micStream.getAudioTracks().forEach((t) => displayStream.addTrack(t))
    } catch {
      console.warn("Mic not available")
    }

    streamRef.current = displayStream

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm"

    const recorder = new MediaRecorder(displayStream, {
      mimeType,
      videoBitsPerSecond: 8_000_000,
    })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    displayStream.getVideoTracks()[0].onended = () => {
      if (mediaRecorderRef.current?.state !== "inactive") {
        stopRecording()
      }
    }

    recorder.start(500)
    mediaRecorderRef.current = recorder
    setStatus("recording")
    startTimer()
  }

  function pauseRecording() {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    if (recorder.state === "recording") {
      recorder.pause()
      setStatus("paused")
      stopTimer()
    } else if (recorder.state === "paused") {
      recorder.resume()
      setStatus("recording")
      startTimer()
    }
  }

  function stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === "inactive") {
        resolve(new Blob())
        return
      }

      stopTimer()

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        setRecordingBlob(blob)
        setHasRecording(true)
        resolve(blob)
      }

      recorder.stop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      setStatus("idle")
    })
  }

  return { startRecording, pauseRecording, stopRecording }
}