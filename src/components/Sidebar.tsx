import { useStore } from "@/store"
import {
  MousePointer2,
  PenLine,
  Code2,
  Captions
} from "lucide-react"

type Tool = "cursor" | "draw" | "code" | "caption" | "browser"

const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
  { id: "cursor", label: "Cursor", icon: <MousePointer2 size={16} /> },
  { id: "draw", label: "Canvas", icon: <PenLine size={16} /> },
  { id: "code", label: "Code", icon: <Code2 size={16} /> },
  { id: "caption", label: "Captions", icon: <Captions size={16} /> }
]

export default function Sidebar() {
  const { tool, setTool, setShowCode, setShowBrowser } = useStore()

  function handleToolClick(id: Tool) {
    setTool(id)
    if (id === "code") setShowCode(true)
    else setShowCode(false)
    if (id === "browser") setShowBrowser(true)
    else setShowBrowser(false)
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
      gap: "4px",
      zIndex: 10,
    }}>
      {tools.map((t, i) => (
        <div key={t.id} style={{ display: "contents" }}>
          {i === 2 && (
            <div style={{
              width: "28px",
              height: "0.5px",
              background: "var(--border)",
              margin: "6px 0",
            }} />
          )}
          <div style={{ position: "relative" }}>
            <button
              className={`icon-btn ${tool === t.id ? "active" : ""}`}
              title={t.label}
              onClick={() => handleToolClick(t.id)}
              style={{
                width: "36px",
                height: "36px",
                color: tool === t.id ? "var(--accent-light)" : "var(--text-secondary)",
              }}
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
    </div>
  )
}