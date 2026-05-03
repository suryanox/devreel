"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useStore } from "@/store"
import { parseSchema } from "@/engine/parser"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { highlight } from "@/lib/highlight"

const EXAMPLE_SCHEMA = `meta:
  title: "Why Every Program Starts From main()"
  aspect_ratio: "9:16"
  fps: 30
  background: "#080810"

scenes:
  - id: 1
    duration: 4
    background:
      type: grid_3d
    elements:
      - type: code_highlight
        language: c
        value: "int main() {"
        highlight_token: "main"
        highlight_color: "#facc15"
        position: top
        animation_in: fade_in
        delay: 0.2
      - type: text
        value: "Who called this?"
        style: hook
        position: center
        animation_in: zoom_in
        idle: float
        delay: 0.5
      - type: text
        value: "It wasn't you."
        style: subtitle
        position: bottom
        animation_in: slide_up
        delay: 1.2`

export default function Editor() {
  const {
    rawInput,
    setRawInput,
    schema,
    setSchema,
    parseError,
    setParseError,
    setCurrentScene,
  } = useStore()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const [highlightedYaml, setHighlightedYaml] = useState<string>("")

  // Load example on first mount if empty
  useEffect(() => {
    if (!rawInput) {
      handleInput(EXAMPLE_SCHEMA)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-highlight whenever rawInput changes
  useEffect(() => {
    if (!rawInput.trim()) {
      setHighlightedYaml("")
      return
    }
    highlight(rawInput, "yaml").then(html => {
      setHighlightedYaml(html)
    })
  }, [rawInput])

  // Sync highlight div scroll with textarea scroll
  const syncScroll = useCallback(() => {
    if (!textareaRef.current || !highlightRef.current) return
    highlightRef.current.scrollTop = textareaRef.current.scrollTop
    highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
  }, [])

  function handleInput(value: string) {
    setRawInput(value)

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

  // Handle tab key in textarea
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const newVal = el.value.slice(0, start) + "  " + el.value.slice(end)
      handleInput(newVal)
      requestAnimationFrame(() => {
        el.selectionStart = start + 2
        el.selectionEnd = start + 2
      })
    }
  }, [])

  return (
    <div className="editor-panel">
      {/* Header */}
      <div className="editor-header">
        <div className="editor-header-left">
          <span className="editor-logo">DevReel</span>
          <span className="editor-badge">YAML</span>
        </div>
        {schema && !parseError && (
          <div className="editor-status editor-status--ok">
            <CheckCircle2 size={11} />
            {schema.scenes.length} scene{schema.scenes.length !== 1 ? "s" : ""}
          </div>
        )}
        {parseError && (
          <div className="editor-status editor-status--err">
            <AlertCircle size={11} />
            error
          </div>
        )}
      </div>

      {/* Editor body — highlight layer + textarea overlay */}
      <div className="editor-body">
        {/* Highlighted YAML layer */}
        <div
          ref={highlightRef}
          className="editor-highlight-layer"
          dangerouslySetInnerHTML={{ __html: highlightedYaml }}
          aria-hidden="true"
        />

        {/* Transparent textarea on top for input */}
        <textarea
          ref={textareaRef}
          className="editor-textarea editor-textarea--overlay"
          value={rawInput}
          onChange={e => handleInput(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          placeholder="Paste your YAML schema here..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      {/* Error bar */}
      {parseError && (
        <div className="editor-error-bar">
          <AlertCircle size={11} />
          <span>{parseError}</span>
        </div>
      )}
    </div>
  )
}