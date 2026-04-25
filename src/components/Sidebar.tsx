import { useStore } from "@/store"

type Tool = "cursor" | "draw" | "text" | "shape" | "code" | "caption"

const tools: { id: Tool; label: string; icon: string }[] = [
  { id: "cursor", label: "Cursor", icon: "⌖" },
  { id: "draw", label: "Draw", icon: "✏" },
  { id: "text", label: "Text", icon: "T" },
  { id: "shape", label: "Shape", icon: "◻" },
  { id: "code", label: "Code", icon: "</>" },
  { id: "caption", label: "Caption", icon: "CC" },
]

export default function Sidebar() {
  const { tool, setTool, setShowCode, setShowWhiteboard, setCodeContent, codeLanguage } = useStore()

  function handleToolClick(id: Tool) {
  setTool(id)
  if (id !== "code") setShowCode(false)
  if (id !== "draw") setShowWhiteboard(false)
  if (id === "code") {
    setShowCode(true)
    if (!useStore.getState().codeContent) {
      setCodeContent(codeLanguage === "rust"
        ? `async fn fetch(url: &str) {\n  let res = reqwest::get(url).await?;\n  println!("{}", res.text().await?);\n}`
        : `async def fetch(url):\n  async with aiohttp.ClientSession() as s:\n    r = await s.get(url)\n    print(await r.text())`
      )
    }
  }
  if (id === "draw") setShowWhiteboard(true)
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
          {i === 4 && (
            <div style={{
              width: "28px",
              height: "0.5px",
              background: "var(--border)",
              margin: "6px 0",
            }} />
          )}
          <button
            className={`icon-btn ${tool === t.id ? "active" : ""}`}
            title={t.label}
            onClick={() => handleToolClick(t.id)}
            style={{
              width: "36px",
              height: "36px",
              fontSize: t.id === "code" ? "9px" : "14px",
              fontWeight: "600",
              color: tool === t.id ? "var(--accent-light)" : "var(--text-secondary)",
            }}
          >
            {t.icon}
          </button>
        </div>
      ))}
    </div>
  )
}