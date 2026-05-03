"use client"

import { useEffect, useRef, useState } from "react"

const LINES = [
  { prompt: true,  text: "cargo build --release" },
  { prompt: false, text: "   Compiling tokio v1.35.1" },
  { prompt: false, text: "   Compiling serde v1.0.193" },
  { prompt: false, text: "   Compiling axum v0.7.2" },
  { prompt: false, text: "    Finished release [optimized] in 4.2s" },
  { prompt: true,  text: "./target/release/server --port 8080" },
  { prompt: false, text: "→  listening on 0.0.0.0:8080" },
]

export default function Terminal() {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [currentChar, setCurrentChar] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setVisibleLines([])
    setLineIndex(0)
    setCurrentChar(0)
  }, [])

  useEffect(() => {
    if (lineIndex >= LINES.length) return
    const line = LINES[lineIndex]
    const full = (line.prompt ? "❯ " : "  ") + line.text

    if (currentChar < full.length) {
      timeoutRef.current = setTimeout(() => {
        setVisibleLines(prev => {
          const updated = [...prev]
          updated[lineIndex] = full.slice(0, currentChar + 1)
          return updated
        })
        setCurrentChar(c => c + 1)
      }, line.prompt ? 42 : 14)
    } else {
      timeoutRef.current = setTimeout(() => {
        setLineIndex(l => l + 1)
        setCurrentChar(0)
      }, line.prompt ? 160 : 55)
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [lineIndex, currentChar])

  return (
    <div className="terminal-bg">
      <div className="terminal-scanlines" />
      <div className="terminal-chrome">
        <div className="terminal-chrome-dots">
          <span className="code-dot code-dot--red" />
          <span className="code-dot code-dot--yellow" />
          <span className="code-dot code-dot--green" />
        </div>
        <span className="terminal-chrome-title">zsh — devproject</span>
      </div>
      <div className="terminal-body">
        {visibleLines.map((line, i) => {
          const isPrompt = LINES[i]?.prompt
          const isFinished = line.includes("Finished")
          const isListening = line.includes("listening")
          const isCompiling = line.includes("Compiling")
          let color = "#4a6741"
          if (isPrompt) color = "#b5e890"
          else if (isFinished) color = "#4ade80"
          else if (isListening) color = "#34d399"
          else if (isCompiling) color = "#3d5c38"
          return (
            <div key={i} className="terminal-line">
              <span className="terminal-text" style={{ color }}>{line}</span>
              {i === visibleLines.length - 1 && lineIndex < LINES.length && (
                <span className="terminal-cursor" style={{ background: "#4ade80" }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
