"use client"

import { useState } from "react"
import { useStore } from "@/store"
import { parseSchema } from "@/engine/parser"
import { Play, Download, ChevronRight, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react"

const EXAMPLE_SCHEMA = `meta:
  title: "Why Rust is Fast"
  aspect_ratio: "9:16"
  fps: 30
  background: "#020617"

scenes:
  - id: 1
    duration: 3
    background:
      type: gradient
      gradient: ["#020617", "#0f172a", "#1e1b4b"]
    elements:
      - type: text
        value: "🦀 Why Rust is Fast"
        style: hook
        position: center
        animation_in: zoom_in
        animation_out: fade_out

  - id: 2
    duration: 4
    background:
      type: terminal
      theme: dark
    elements:
      - type: text
        value: "No Garbage Collector"
        style: title
        position: top
        animation_in: slide_up
        delay: 0.2
      - type: code
        language: rust
        value: |
          fn main() {
              let s = String::from("hello");
              println!("{}", s);
              // s is freed here automatically
          }
        animation_in: fade_in
        delay: 0.6

  - id: 3
    duration: 3.5
    background:
      type: gradient
      gradient: ["#020617", "#1a0533"]
    elements:
      - type: text
        value: "Zero-cost abstractions"
        style: title
        position: top
        animation_in: slide_up
      - type: bullet_list
        items:
          - "✓ Ownership system"
          - "✓ Borrow checker"
          - "✓ No runtime overhead"
        position: center
        animation_in: slide_up
        stagger: 0.3
        delay: 0.4

  - id: 4
    duration: 2.5
    background:
      type: gradient
      gradient: ["#020617", "#0f172a"]
    elements:
      - type: text
        value: "Fast by design 🚀"
        style: hook
        position: center
        animation_in: zoom_in`

export default function Editor() {
  const {
    rawInput, setRawInput,
    schema, setSchema,
    parseError, setParseError,
    isPlaying, setIsPlaying,
    currentScene, setCurrentScene,
    isExporting,
  } = useStore()

  const [showExample, setShowExample] = useState(!rawInput)

  function handleInput(value: string) {
    setRawInput(value)
    setShowExample(false)

    if (!value.trim()) {
      setSchema(null)
      setParseError(null)
      return
    }

    const result = parseSchema(value)
    if (result.error) {
      setParseError(result.error)
      setSchema(null)
    } else {
      setParseError(null)
      setSchema(result.schema)
      setCurrentScene(0)
    }
  }

  function loadExample() {
    handleInput(EXAMPLE_SCHEMA)
    setShowExample(false)
  }

  function handleRun() {
    if (!schema) return
    setCurrentScene(0)
    setIsPlaying(true)
  }

  const displayValue = showExample ? EXAMPLE_SCHEMA : rawInput

  return (
    <div style={{
      width: 420,
      flexShrink: 0,
      background: "var(--bg-surface)",
      borderRight: "0.5px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 16px 12px",
        borderBottom: "0.5px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--accent-dim)",
              border: "0.5px solid var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: 14 }}>🎬</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                DevReel
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                Schema Editor
              </div>
            </div>
          </div>

          <button
            onClick={loadExample}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--accent-dim)",
              border: "0.5px solid var(--accent)",
              color: "var(--accent-light)",
              fontSize: 10,
              fontWeight: 500,
            }}
          >
            <Sparkles size={10} />
            Load example
          </button>
        </div>
      </div>

      <div style={{
        padding: "10px 16px 6px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div className="label">Schema — YAML or JSON</div>
        {schema && !parseError && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 10,
            color: "var(--green)",
          }}>
            <CheckCircle2 size={10} />
            {schema.scenes.length} scene{schema.scenes.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <textarea
          value={displayValue}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={`Paste your schema here...\n\nTip: Use the "Load example" button to see a working schema, or generate one with AI using the schema spec below.`}
          spellCheck={false}
          style={{
            width: "100%",
            height: "100%",
            background: "transparent",
            color: showExample ? "var(--text-muted)" : "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            lineHeight: 1.7,
            padding: "12px 16px",
            border: "none",
            outline: "none",
            resize: "none",
            tabSize: 2,
          }}
        />
      </div>

      {parseError && (
        <div style={{
          margin: "0 12px 8px",
          padding: "8px 12px",
          borderRadius: "var(--radius-md)",
          background: "rgba(239,68,68,0.08)",
          border: "0.5px solid rgba(239,68,68,0.2)",
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          flexShrink: 0,
        }}>
          <AlertCircle size={12} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 10, color: "var(--red)", lineHeight: 1.5 }}>
            {parseError}
          </span>
        </div>
      )}

      <div style={{
        padding: "10px 12px",
        borderTop: "0.5px solid var(--border)",
        display: "flex",
        gap: 8,
        flexShrink: 0,
      }}>
        <button
          className="btn btn-primary"
          onClick={handleRun}
          disabled={!schema || isPlaying}
          style={{ flex: 1, fontSize: 12 }}
        >
          <Play size={13} />
          {isPlaying ? "Playing..." : "Run Preview"}
        </button>

        <button
          className="btn"
          disabled={!schema || isExporting}
          style={{ fontSize: 12, padding: "8px 14px" }}
          onClick={() => useStore.getState().setIsExporting(true)}
        >
          <Download size={13} />
          Export
        </button>
      </div>

      <div style={{
        padding: "8px 12px 12px",
        flexShrink: 0,
      }}>
        <div style={{
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          background: "var(--bg-elevated)",
          border: "0.5px solid var(--border)",
        }}>
          <div className="label" style={{ marginBottom: 6 }}>💡 AI Prompt tip</div>
          <p style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Ask ChatGPT/Claude: <em style={{ color: "var(--accent-light)" }}>"Generate a DevReel schema for a 30-second reel about [topic]. Use 9:16 aspect ratio with scenes having backgrounds (terminal/gradient/code_editor), text elements with zoom_in/slide_up animations, and code elements."</em>
          </p>
        </div>
      </div>
    </div>
  )
}