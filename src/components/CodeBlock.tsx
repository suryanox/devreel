"use client"

import { useEffect, useRef, useState } from "react"
import { useStore } from "@/store"
import { Play, X, ChevronDown, ChevronUp, Terminal } from "lucide-react"

const DEFAULTS: Record<string, string> = {
  rust: `fn main() {
    println!("Hello, World!");
}`,
  python: `def main():
    print("Hello, World!")

main()`,
}

const OUTPUTS: Record<string, string[]> = {
  rust: [
    "   Compiling devreel v0.1.0",
    "    Finished dev profile in 0.42s",
    "     Running `target/debug/devreel`",
    "Hello, World!",
  ],
  python: [
    "Hello, World!",
  ],
}

function tokenize(code: string, lang: string): string {
  const lines = code.split("\n")
  return lines.map(line => {
    const parts: { text: string; color?: string; style?: string }[] = []
    let remaining = line

    while (remaining.length > 0) {
      if (lang === "rust" && remaining.startsWith("//")) {
        parts.push({ text: remaining, color: "#6c7086", style: "italic" })
        remaining = ""
        continue
      }
      if (lang === "python" && remaining.startsWith("#")) {
        parts.push({ text: remaining, color: "#6c7086", style: "italic" })
        remaining = ""
        continue
      }

      const strMatch = remaining.match(/^(["'])(?:(?!\1)[^\\]|\\.)*\1/)
      if (strMatch) {
        parts.push({ text: strMatch[0], color: "#a6e3a1" })
        remaining = remaining.slice(strMatch[0].length)
        continue
      }

      const kwRust = /^(fn|let|mut|struct|impl|pub|use|mod|match|if|else|for|while|return|self|async|await|move|trait|type|enum|const|static|where|unsafe|true|false|Some|None|Ok|Err)\b/
      const kwPython = /^(def|class|import|from|return|if|else|elif|for|while|in|not|and|or|True|False|None|self|with|as|try|except|finally|raise|pass|print|async|await)\b/
      const kwRegex = lang === "rust" ? kwRust : kwPython
      const kwMatch = remaining.match(kwRegex)
      if (kwMatch) {
        parts.push({ text: kwMatch[0], color: "#cba6f7" })
        remaining = remaining.slice(kwMatch[0].length)
        continue
      }

      const numMatch = remaining.match(/^\d+\.?\d*/)
      if (numMatch) {
        parts.push({ text: numMatch[0], color: "#fab387" })
        remaining = remaining.slice(numMatch[0].length)
        continue
      }

      const fnMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*[!(])/)
      if (fnMatch) {
        parts.push({ text: fnMatch[0], color: "#89b4fa" })
        remaining = remaining.slice(fnMatch[0].length)
        continue
      }

      const typeMatch = remaining.match(/^[A-Z][a-zA-Z0-9_]*/)
      if (typeMatch) {
        parts.push({ text: typeMatch[0], color: "#f38ba8" })
        remaining = remaining.slice(typeMatch[0].length)
        continue
      }

      parts.push({ text: remaining[0] })
      remaining = remaining.slice(1)
    }

    const html = parts.map(p => {
      if (p.color) {
        return `<span style="color:${p.color};${p.style ? `font-style:${p.style}` : ""}">${p.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`
      }
      return p.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }).join("")

    return html
  }).join("\n")
}

export default function CodeBlock() {
  const { showCode, codeLanguage, codeContent, setShowCode, setCodeContent } = useStore()
  const [showTerminal, setShowTerminal] = useState(false)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showCode && !codeContent) {
      setCodeContent(DEFAULTS[codeLanguage])
    }
  }, [showCode])

  useEffect(() => {
    if (!showCode) return
    setCodeContent(DEFAULTS[codeLanguage])
  }, [codeLanguage])

  function syncScroll() {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  function handleTab(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault()
      const ta = textareaRef.current!
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newVal = codeContent.substring(0, start) + "    " + codeContent.substring(end)
      setCodeContent(newVal)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4
      })
    }
  }

  function handleRun() {
    setShowTerminal(true)
    setRunning(true)
    setTerminalLines([])
    const lines = OUTPUTS[codeLanguage]
    lines.forEach((line, i) => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, line])
        if (i === lines.length - 1) setRunning(false)
      }, i * 200)
    })
  }

  if (!showCode) return null

  const lines = codeContent.split("\n")
  const highlighted = tokenize(codeContent, codeLanguage)

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      background: "#1e1e2e",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 10px",
        background: "#181825",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["rust", "python"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => useStore.getState().setCodeLanguage(lang)}
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                color: codeLanguage === lang ? "var(--accent-light)" : "var(--text-muted)",
                padding: "2px 7px",
                borderRadius: 4,
                background: codeLanguage === lang ? "var(--accent-dim)" : "transparent",
                border: `0.5px solid ${codeLanguage === lang ? "var(--border-accent)" : "transparent"}`,
              }}
            >
              {lang}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={handleRun}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 8px",
              borderRadius: 5,
              background: "rgba(16,185,129,0.15)",
              border: "0.5px solid rgba(16,185,129,0.3)",
              color: "#10b981",
              fontSize: 9,
              fontWeight: 600,
            }}
          >
            <Play size={9} /> Run
          </button>
          <button onClick={() => setShowCode(false)}>
            <X size={12} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          background: "#181825",
          borderRight: "0.5px solid rgba(255,255,255,0.05)",
          padding: "10px 6px 10px 8px",
          userSelect: "none",
          flexShrink: 0,
          minWidth: 32,
          alignItems: "flex-end",
        }}>
          {lines.map((_, i) => (
            <div key={i} style={{
              fontSize: 9,
              lineHeight: "1.7",
              color: "rgba(255,255,255,0.2)",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
            }}>
              {i + 1}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <div
            ref={highlightRef}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              padding: "10px 10px",
              fontSize: 10,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              color: "#cdd6f4",
              pointerEvents: "none",
              overflow: "hidden",
            }}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
          <textarea
            ref={textareaRef}
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleTab}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            style={{
              position: "absolute",
              inset: 0,
              padding: "10px 10px",
              fontSize: 10,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              background: "transparent",
              color: "transparent",
              caretColor: "#cdd6f4",
              border: "none",
              outline: "none",
              resize: "none",
              overflow: "hidden",
              width: "100%",
              height: "100%",
              cursor: "none",
            }}
          />
        </div>
      </div>

      <div style={{
        background: "#11111b",
        borderTop: "0.5px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <button
          onClick={() => setShowTerminal(!showTerminal)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            color: "var(--text-muted)",
            fontSize: 9,
            fontWeight: 500,
          }}
        >
          <Terminal size={10} />
          Terminal
          {running && (
            <span style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#10b981",
              animation: "pulse 1s infinite",
              marginLeft: 2,
            }} />
          )}
          <span style={{ marginLeft: "auto" }}>
            {showTerminal ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
          </span>
        </button>

        {showTerminal && (
          <div style={{
            height: 100,
            overflowY: "auto",
            padding: "4px 10px 8px",
            fontFamily: "monospace",
            fontSize: 9,
            borderTop: "0.5px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>
              $ {codeLanguage === "rust" ? "cargo run" : "python main.py"}
            </div>
            {terminalLines.map((line, i) => (
              <div key={i} style={{
                color: line.startsWith("error") ? "#f38ba8"
                  : line.startsWith("   Compiling") ? "#89b4fa"
                  : line.startsWith("    Finished") ? "#a6e3a1"
                  : line.startsWith("     Running") ? "#cba6f7"
                  : "#cdd6f4",
                lineHeight: 1.6,
              }}>
                {line}
              </div>
            ))}
            {running && (
              <span style={{ color: "#a6e3a1", animation: "pulse 1s infinite" }}>▋</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}