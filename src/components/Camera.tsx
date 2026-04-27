"use client"

import { useEffect, useRef, useState } from "react"
import { useStore } from "@/store"

export default function Camera() {
  const { showCamera, cameraMode, setCameraMode, setShowCamera } = useStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const pipVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!showCamera) {
      stopStream()
      return
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        if (pipVideoRef.current) {
          pipVideoRef.current.srcObject = stream
          pipVideoRef.current.play()
        }
      })
      .catch(() => setError(true))

    return () => stopStream()
  }, [showCamera])

  useEffect(() => {
    const stream = streamRef.current
    if (!stream) return
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
    if (pipVideoRef.current) {
      pipVideoRef.current.srcObject = stream
      pipVideoRef.current.play().catch(() => {})
    }
  }, [cameraMode])

  function stopStream() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    if (pipVideoRef.current) pipVideoRef.current.srcObject = null
  }

  if (!showCamera) return null

  if (error) return (
    <div style={{
      position: "absolute",
      bottom: 80,
      right: 12,
      background: "rgba(239,68,68,0.15)",
      border: "0.5px solid rgba(239,68,68,0.3)",
      borderRadius: 8,
      padding: "6px 10px",
      fontSize: 9,
      color: "var(--red)",
      zIndex: 35,
    }}>
      Camera not available
    </div>
  )

  return (
    <>
      {cameraMode === "pip" && (
        <div style={{
          position: "absolute",
          bottom: 40,
          right: 12,
          width: 100,
          height: 130,
          borderRadius: 10,
          overflow: "hidden",
          border: "1.5px solid rgba(255,255,255,0.15)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          zIndex: 35,
        }}>
          <video
            ref={pipVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
            }}
          />
        </div>
      )}

      {cameraMode === "half" && (
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          overflow: "hidden",
          zIndex: 35,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "#000",
        }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scaleX(-1)",
              minWidth: "100%",
              minHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "cover",
            }}
          />
        </div>
      )}
    </>
  )
}