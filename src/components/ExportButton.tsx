"use client"

import { useCallback } from "react"
import { Download, Loader2, CheckCircle, XCircle, Film } from "lucide-react"
import { useFFmpeg } from "@/hooks/useFFmpeg"
import { useStore } from "@/store"

export default function ExportButton() {
  const { schema } = useStore()
  const { status, progress, errorMsg, videoURL, exportVideo, reset } = useFFmpeg()

  const handleExport = useCallback(async () => {
    if (!schema) return

    const durations = schema.scenes.map((s) => s.duration ?? 3)
    const fps = schema.meta?.fps ?? 30

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".scene-root")
    )

    await exportVideo(elements, fps, durations)
  }, [schema, exportVideo])

  const handleDownload = useCallback(() => {
    if (!videoURL) return
    const a = document.createElement("a")
    a.href = videoURL
    a.download = `${schema?.meta?.title?.replace(/\s+/g, "_") ?? "reel"}.mp4`
    a.click()
  }, [videoURL, schema])

  if (!schema) return null

  return (
    <div className="export-wrapper">
      {status === "idle" && (
        <button className="export-btn" onClick={handleExport}>
          <Film size={15} />
          Export MP4
        </button>
      )}

      {(status === "loading" || status === "capturing" || status === "encoding") && (
        <div className="export-progress">
          <div className="export-progress-bar">
            <div
              className="export-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="export-progress-label">
            <Loader2 size={13} className="export-spinner" />
            <span>
              {status === "loading"   && "Loading FFmpeg…"}
              {status === "capturing" && `Capturing frames… ${progress}%`}
              {status === "encoding"  && `Encoding… ${progress}%`}
            </span>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="export-done">
          <div className="export-done-badge">
            <CheckCircle size={14} />
            <span>Ready</span>
          </div>
          <button
            className="export-btn export-btn--download"
            onClick={handleDownload}
          >
            <Download size={14} />
            Download
          </button>
          <button className="export-btn export-btn--ghost" onClick={reset}>
            New export
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="export-error">
          <div className="export-error-badge">
            <XCircle size={14} />
            <span>{errorMsg ?? "Export failed"}</span>
          </div>
          <button className="export-btn export-btn--ghost" onClick={reset}>
            Retry
          </button>
        </div>
      )}
    </div>
  )
}