"use client"

import { useStore } from "@/store"

const CAPTION_STYLES = [
  { id: "bold-yellow", label: "Bold Yellow" },
  { id: "white", label: "White" },
  { id: "kinetic", label: "Kinetic" },
] as const

export default function SidePanel() {
  const {
    captionStyle, setCaptionStyle,
    ffmpegLoaded, ffmpegLoading,
    exportStage,
  } = useStore()

  return (
    <div style={{
      width: "var(--panel-w)",
      background: "var(--bg-surface)",
      borderLeft: "0.5px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <div style={{
        padding: "14px 12px",
        borderBottom: "0.5px solid var(--border)",
      }}>
        <div className="label" style={{ marginBottom: 10 }}>Caption Style</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CAPTION_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setCaptionStyle(s.id)}
              style={{
                padding: "7px 10px",
                borderRadius: "var(--radius-md)",
                border: `0.5px solid ${captionStyle === s.id ? "var(--border-accent)" : "var(--border)"}`,
                background: captionStyle === s.id ? "var(--bg-active)" : "rgba(255,255,255,0.03)",
                color: captionStyle === s.id
                  ? s.id === "bold-yellow" ? "var(--caption-yellow)" : "var(--accent-light)"
                  : "var(--text-secondary)",
                fontSize: 11,
                fontWeight: captionStyle === s.id ? 600 : 400,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        padding: 12,
        borderTop: "0.5px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: ffmpegLoaded ? "var(--green)" : ffmpegLoading ? "var(--amber)" : "var(--red)",
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
            FFmpeg {ffmpegLoaded ? "ready" : ffmpegLoading ? "loading..." : "not loaded"}
          </span>
        </div>
      </div>
    </div>
  )
}