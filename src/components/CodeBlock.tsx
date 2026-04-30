"use client"

import { useEffect, useRef, useState } from "react"
import { useStore } from "@/store"
import { Play, X, ChevronDown, ChevronUp, Terminal } from "lucide-react"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { rust } from "@codemirror/lang-rust"
import { python } from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark"

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
    "     Running \`target/debug/devreel\`",
    "Hello, World!",
  ],
  python: ["Hello, World!"],
}

export default function CodeBlock() {
  const { showCode, codeLanguage, codeContent, setShowCode, setCodeContent } = useStore()
  const [showTerminal, setShowTerminal] = useState(false)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (showCode && !codeContent) {
      setCodeContent(DEFAULTS[codeLanguage])
    }
  }, [showCode])

  useEffect(() => {
    if (!showCode) return
    setCodeContent(DEFAULTS[codeLanguage])
  }, [codeLanguage])

  useEffect(() => {
    if (!editorRef.current || !showCode) return

    viewRef.current?.destroy()

    const langExt = codeLanguage === "rust" ? rust() : python()

    const view = new EditorView({
      state: EditorState.create({
        doc: codeContent || DEFAULTS[codeLanguage],
        extensions: [
          basicSetup,
          langExt,
          oneDark,
          EditorView.theme({
            "&": {
              fontSize: "13px",
              height: "100%",
              background: "#1e1e2e",
            },
            ".cm-scroller": {
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineHeight: "1.7",
              overflow: "auto",
            },
            ".cm-content": {
              padding: "10px 0",
              caretColor: "#cdd6f4",
            },
            ".cm-focused": { outline: "none" },
            ".cm-editor": { height: "100%" },
            ".cm-gutters": {
              background: "#181825",
              borderRight: "0.5px solid rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.2)",
              fontSize: "11px",
            },
            ".cm-activeLineGutter": { background: "rgba(255,255,255,0.04)" },
            ".cm-activeLine": { background: "rgba(255,255,255,0.03)" },
            ".cm-cursor": { borderLeftColor: "#cdd6f4" },
            ".cm-selectionBackground": { background: "rgba(139,92,246,0.3) !important" },
            ".cm-tooltip": {
              background: "#181825",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              fontSize: "11px",
            },
            ".cm-tooltip-autocomplete ul li[aria-selected]": {
              background: "rgba(139,92,246,0.3)",
              color: "#cdd6f4",
            },
            ".cm-completionLabel": { color: "#cdd6f4" },
            ".cm-completionDetail": { color: "#6c7086", fontStyle: "italic" },
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setCodeContent(update.state.doc.toString())
            }
          }),
          EditorView.lineWrapping,
        ],
      }),
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [showCode, codeLanguage])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== codeContent) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: codeContent },
      })
    }
  }, [codeContent])

  function handleRun() {
    setShowTerminal(true)
    setRunning(true)
    setTerminalLines([])
    OUTPUTS[codeLanguage].forEach((line, i) => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, line])
        if (i === OUTPUTS[codeLanguage].length - 1) setRunning(false)
      }, i * 200)
    })
  }

  if (!showCode) return null

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
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{
            display: "flex",
            gap: 5,
            padding: "2px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 6,
            border: "0.5px solid var(--border)",
          }}>
            {(["rust", "python"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => useStore.getState().setCodeLanguage(lang)}
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: codeLanguage === lang ? "#1e1e2e" : "var(--text-muted)",
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: codeLanguage === lang ? "var(--accent-light)" : "transparent",
                  border: "none",
                  transition: "all 0.15s",
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={handleRun}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: 6,
              background: "rgba(16,185,129,0.15)",
              border: "0.5px solid rgba(16,185,129,0.3)",
              color: "#10b981",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            <Play size={10} /> Run
          </button>
          <button
            onClick={() => setShowCode(false)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid var(--border)",
            }}
          >
            <X size={11} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      <div ref={editorRef} style={{ flex: 1, overflow: "hidden" }} />

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
            height: 110,
            overflowY: "auto",
            padding: "6px 12px 10px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            borderTop: "0.5px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
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