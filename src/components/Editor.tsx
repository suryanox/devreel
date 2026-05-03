"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useStore } from "@/store"
import { parseSchema } from "@/engine/parser"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { highlight } from "@/lib/highlight"

const EXAMPLE_SCHEMA = `meta:
  title: "Why main() gets called"
  aspect_ratio: "9:16"
  fps: 30
  background: "#080810"

scenes:
  - id: 1
    duration: 5
    background:
      type: solid
      color: black
    elements:
      - type: text
        value: "Every program starts somewhere..."
        style: hook
        position: center
        animation_in: fade_in
        idle: float

      - type: text
        value: "But why main()?"
        style: title
        position: bottom
        highlight_token: "main()"
        highlight_color: "#ffb703"
        animation_in: zoom_in

  - id: 2
    duration: 5
    background:
      type: solid
      color: grey
    elements:
      - type: code
        value: |
          int main() {
              return 0;
          }
        language: cpp
        position: center
        animation_in: type_in

      - type: text
        value: "This is where your code begins"
        style: subtitle
        position: top
        animation_in: fade_in

  - id: 3
    duration: 5
    background:
      type: solid
      color: black
    elements:
      - type: stack_diagram
        title: "What really happens first"
        position: center
        animation_in: slide_up
        layers:
          - label: "main()"
            sublabel: "your function"
            color: "#ffb703"
            accent: true
          - label: "runtime setup"
            sublabel: "args, memory, startup"
            color: "#8ecae6"
          - label: "_start"
            sublabel: "real entry from the loader"
            color: "#90be6d"`

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
