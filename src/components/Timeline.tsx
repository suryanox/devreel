"use client"

import { useStore } from "@/store"
import { useRecorder } from "@/hooks/useRecorder"
import { useFFmpeg } from "@/hooks/useFFmpeg"

export default function Timeline() {
  const { status, duration, hasRecording, recordingBlob, exportProgress, exportStage } = useStore()
  const { startRecording, pauseRecording, stopRecording } = useRecorder()
  const { exportVideo, ffmpegLoaded } = useFFmpeg()

  const isRecording = status === "recording"
  const isPaused = status === "paused"
  const isExporting = exportStage !== "" && exportStage !== "Done"

  const mins = String(Math.floor(duration / 60)).padStart(2, "0")
  const secs = String(duration % 60).padStart(2, "0")

  async function handleRecord() {
    try {
      if (status === "idle") await startRecording()
      else pauseRecording()
    } catch (e) {
      console.error("Record error:", e)
    }
  }

  async function handleStop() {
    try {
      await stopRecording()
    } catch (e) {
      console.error("Stop error:", e)
    }
  }

  async function handleExport() {
    if (!recordingBlob || !ffmpegLoaded) return
    try {
      const mp4 = await exportVideo(recordingBlob)
      const url = URL.createObjectURL(mp4)
      const a = document.createElement("a")
      a.href = url
      a.download = `devreel_${Date.now()}.mp4`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Export error:", e)
    }
  }

  return (
    <div style={{
      height: "var(--timeline-h)",
      background: "#0a0a0c",
      borderTop: "0.5px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 14px",
      gap: 8,
      flexShrink: 0,
      position: "relative",
    }}>
      {isExporting ? (
        <div style={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              {exportStage}
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--accent-light)" }}>
              {exportProgress}%
            </span>
          </div>

          <div style={{
            width: "100%",
            height: 4,
            background: "var(--bg-elevated)",
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${exportProgress}%`,
              background: `linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%)`,
              borderRadius: 2,
              transition: "width 0.3s ease",
            }} />
          </div>

          <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
            Do not close this tab
          </span>
        </div>
      ) : (
        <>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <button
              className="icon-btn"
              onClick={handleRecord}
              disabled={hasRecording && status === "idle"}
              style={{
                background: isRecording ? "rgba(239,68,68,0.15)" : "var(--bg-elevated)",
                borderColor: isRecording ? "rgba(239,68,68,0.3)" : "var(--border)",
                width: 36,
                height: 36,
                opacity: hasRecording && status === "idle" ? 0.3 : 1,
              }}
            >
              {isRecording ? (
                <svg width="12" height="12" viewBox="0 0 10 10">
                  <rect x="1" y="1" width="3" height="8" rx="0.5" fill="rgba(255,255,255,0.7)" />
                  <rect x="6" y="1" width="3" height="8" rx="0.5" fill="rgba(255,255,255,0.7)" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 10 10">
                  <circle cx="5" cy="5" r="4" fill="var(--red)" />
                </svg>
              )}
            </button>

            <button
              className="icon-btn"
              onClick={handleStop}
              disabled={status === "idle"}
              style={{
                width: 36,
                height: 36,
                opacity: status === "idle" ? 0.3 : 1,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 10 10">
                <rect x="1" y="1" width="8" height="8" rx="1" fill="rgba(255,255,255,0.6)" />
              </svg>
            </button>

            <button
              className="btn btn-accent"
              onClick={handleExport}
              disabled={!hasRecording || !ffmpegLoaded}
              style={{ fontSize: 11, padding: "5px 16px" }}
            >
              Export ↗
            </button>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 16,
          }}>
            {(isRecording || isPaused) && (
              <>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isRecording ? "var(--red)" : "var(--amber)",
                  animation: isRecording ? "pulse 1.2s infinite" : "none",
                  flexShrink: 0,
                }} />
                <span className="mono" style={{
                  fontSize: 11,
                  color: isRecording ? "var(--red)" : "var(--amber)",
                }}>
                  {isPaused ? "PAUSED" : "REC"} {mins}:{secs}
                </span>
              </>
            )}
            {hasRecording && status === "idle" && (
              <span style={{ fontSize: 9, color: "var(--green)" }}>● ready to export</span>
            )}
            {!isRecording && !isPaused && !hasRecording && (
              <span style={{ fontSize: 9, color: "var(--text-muted)" }}>ready to record</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}