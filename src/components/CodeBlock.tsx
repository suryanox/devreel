import { useEffect, useState } from "react"
import { codeToHtml } from "shiki"
import { useStore } from "@/store"

export default function CodeBlock() {
  const { showCode, codeLanguage, codeContent, setShowCode, setCodeContent } = useStore()
  const [html, setHtml] = useState("")
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!codeContent) return
    codeToHtml(codeContent, {
      lang: codeLanguage,
      theme: "catppuccin-mocha",
    }).then(setHtml)
  }, [codeContent, codeLanguage])

  useEffect(() => {
    if (!showCode) return
    if (!codeContent) {
      setCodeContent(codeLanguage === "rust"
        ? `async fn fetch(url: &str) {\n  let res = reqwest::get(url).await?;\n  println!("{}", res.text().await?);\n}`
        : `async def fetch(url):\n  async with aiohttp.ClientSession() as s:\n    r = await s.get(url)\n    print(await r.text())`
      )
    }
  }, [showCode, codeLanguage])

  if (!showCode) return null

  return (
    <div style={{
      position: "absolute",
      top: 60,
      left: 16,
      right: 16,
      background: "rgba(0,0,0,0.82)",
      borderRadius: 10,
      border: "0.5px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      zIndex: 20,
      overflow: "hidden",
      maxHeight: "60%",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 12px",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          {(["rust", "python"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => useStore.getState().setCodeLanguage(lang)}
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                color: codeLanguage === lang ? "var(--accent-light)" : "var(--text-muted)",
                padding: "2px 6px",
                borderRadius: 4,
                background: codeLanguage === lang ? "var(--accent-dim)" : "transparent",
              }}
            >
              {lang}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setEditing(!editing)}
            style={{ fontSize: 10, color: editing ? "var(--accent-light)" : "var(--text-muted)" }}
          >
            {editing ? "done" : "edit"}
          </button>
          <button onClick={() => setShowCode(false)} style={{ fontSize: 10, color: "var(--text-muted)" }}>
            ✕
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          value={codeContent}
          onChange={(e) => setCodeContent(e.target.value)}
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: 200,
            background: "transparent",
            color: "var(--text-primary)",
            fontSize: 13,
            fontFamily: "monospace",
            lineHeight: 1.7,
            padding: "12px 16px",
            border: "none",
            outline: "none",
            resize: "none",
          }}
        />
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ fontSize: 13, lineHeight: 1.7, padding: "12px 16px", overflowX: "auto" }}
        />
      )}
    </div>
  )
}