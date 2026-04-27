"use client"

import { useStore } from "@/store"
import { PenLine, Code2, Captions, MousePointer2, Hand, Video } from "lucide-react"
import { useState } from "react"

type Tool = "draw" | "code"
type CursorStyle = "pointer" | "hand"

const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
  { id: "draw", label: "Canvas", icon: <PenLine size={16} /> },
  { id: "code", label: "Code", icon: <Code2 size={16} /> },
]

const cursors: { id: CursorStyle; label: string; icon: React.ReactNode }[] = [
  { id: "pointer", label: "Pointer", icon: <MousePointer2 size={14} /> },
  { id: "hand", label: "Hand", icon: <Hand size={14} /> },
]

function Divider() {
  return (
    <div style={{
      width: 28,
      height: 0.5,
      background: "var(--border)",
      margin: "6px 0",
    }} />
  )
}

function SidebarButton({
  active,
  title,
  onClick,
  children,
  accentColor = "var(--accent-light)",
}: {
  active: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
  accentColor?: string
}) {
  return (
    <div style={{ position: "relative" }}>
      <button
        className={`icon-btn ${active ? "active" : ""}`}
        title={title}
        onClick={onClick}
        style={{ width: 36, height: 36 }}
      >
        {children}
      </button>
      {active && (
        <div style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 2,
          height: 20,
          background: accentColor,
          borderRadius: "0 2px 2px 0",
        }} />
      )}
    </div>
  )
}

export default function Sidebar() {
  const {
    tool, setTool, setShowCode,
    showCaptions, setShowCaptions,
    showCamera, setShowCamera,
    cameraMode, setCameraMode,
    cursorStyle, setCursorStyle,
  } = useStore()

  const [cameraOpen, setCameraOpen] = useState(false)

  function handleToolClick(id: Tool) {
    setTool(id)
    setShowCode(id === "code")
  }

  function handleCameraClick() {
    if (!showCamera) {
      setShowCamera(true)
      setCameraOpen(true)
    } else {
      setCameraOpen(!cameraOpen)
    }
  }

  return (
    <div style={{
      width: "var(--sidebar-w)",
      background: "var(--bg-surface)",
      borderRight: "0.5px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "12px 0",
      gap: 4,
      zIndex: 10,
      flexShrink: 0,
      position: "relative",
    }}>
      {tools.map((t, i) => (
        <div key={t.id} style={{ display: "contents" }}>
          {i === 1 && <Divider />}
          <SidebarButton
            active={tool === t.id}
            title={t.label}
            onClick={() => handleToolClick(t.id)}
          >
            {t.icon}
          </SidebarButton>
        </div>
      ))}

      <Divider />

      <SidebarButton
        active={showCaptions}
        title="Captions"
        onClick={() => setShowCaptions(!showCaptions)}
        accentColor="var(--caption-yellow)"
      >
        <Captions size={16} />
      </SidebarButton>

      <div style={{ position: "relative" }}>
        <SidebarButton
          active={showCamera}
          title="Camera"
          onClick={handleCameraClick}
          accentColor="var(--green)"
        >
          <Video size={16} />
        </SidebarButton>

        {cameraOpen && showCamera && (
          <div style={{
            position: "absolute",
            left: 44,
            top: "50%",
            transform: "translateY(-50%)",
            background: "var(--bg-elevated)",
            border: "0.5px solid var(--border)",
            borderRadius: 10,
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            zIndex: 100,
            minWidth: 130,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}>
            <div className="label" style={{ marginBottom: 4, paddingLeft: 4 }}>Camera mode</div>

            {[
              { id: "pip", label: "□ Picture in picture" },
              { id: "half", label: "▄ Half screen" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setCameraMode(m.id as "pip" | "half")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontSize: 10,
                  textAlign: "left",
                  background: cameraMode === m.id ? "var(--bg-active)" : "transparent",
                  border: `0.5px solid ${cameraMode === m.id ? "var(--border-accent)" : "transparent"}`,
                  color: cameraMode === m.id ? "var(--accent-light)" : "var(--text-secondary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {m.label}
              </button>
            ))}

            <div style={{ height: 0.5, background: "var(--border)", margin: "2px 0" }} />

            <button
              onClick={() => { setShowCamera(false); setCameraOpen(false) }}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 10,
                textAlign: "left",
                color: "var(--red)",
                cursor: "pointer",
                background: "transparent",
                border: "none",
              }}
            >
              ✕ Turn off camera
            </button>
          </div>
        )}
      </div>

      <Divider />

      <div className="label" style={{ marginBottom: 2 }}>PTR</div>

      {cursors.map((c) => (
        <SidebarButton
          key={c.id}
          active={cursorStyle === c.id}
          title={c.label}
          onClick={() => setCursorStyle(c.id)}
          accentColor="var(--green)"
        >
          {c.id === "hand" ? "👆" : c.icon}
        </SidebarButton>
      ))}
    </div>
  )
}