"use client"

import { useStore } from "@/store"
import { PenLine, Code2, Captions, MousePointer2, Hand } from "lucide-react"

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

export default function Sidebar() {
  const { tool, setTool, setShowCode, showCaptions, setShowCaptions, cursorStyle, setCursorStyle } = useStore()

  function handleToolClick(id: Tool) {
    setTool(id)
    setShowCode(id === "code")
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
    }}>
      {tools.map((t, i) => (
        <div key={t.id} style={{ display: "contents" }}>
          {i === 1 && (
            <div style={{
              width: 28,
              height: 0.5,
              background: "var(--border)",
              margin: "6px 0",
            }} />
          )}
          <div style={{ position: "relative" }}>
            <button
              className={`icon-btn ${tool === t.id ? "active" : ""}`}
              title={t.label}
              onClick={() => handleToolClick(t.id)}
              style={{ width: 36, height: 36 }}
            >
              {t.icon}
            </button>
            {tool === t.id && (
              <div style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: 2,
                height: 20,
                background: "var(--accent-light)",
                borderRadius: "0 2px 2px 0",
              }} />
            )}
          </div>
        </div>
      ))}

      <div style={{ width: 28, height: 0.5, background: "var(--border)", margin: "6px 0" }} />

      <div style={{ position: "relative" }}>
        <button
          className={`icon-btn ${showCaptions ? "active" : ""}`}
          title="Captions"
          onClick={() => setShowCaptions(!showCaptions)}
          style={{ width: 36, height: 36 }}
        >
          <Captions size={16} />
        </button>
        {showCaptions && (
          <div style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 2,
            height: 20,
            background: "var(--caption-yellow)",
            borderRadius: "0 2px 2px 0",
          }} />
        )}
      </div>

      <div style={{ width: 28, height: 0.5, background: "var(--border)", margin: "6px 0" }} />

      <div className="label" style={{ marginBottom: 4 }}>PTR</div>

      {cursors.map((c) => (
        <div key={c.id} style={{ position: "relative" }}>
          <button
            className={`icon-btn ${cursorStyle === c.id ? "active" : ""}`}
            title={c.label}
            onClick={() => setCursorStyle(c.id)}
            style={{ width: 36, height: 36 }}
          >
            {c.icon}
          </button>
          {cursorStyle === c.id && (
            <div style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 2,
              height: 20,
              background: "var(--green)",
              borderRadius: "0 2px 2px 0",
            }} />
          )}
        </div>
      ))}
    </div>
  )
}