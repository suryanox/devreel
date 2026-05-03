"use client"

import { useEffect, useRef, useState } from "react"
import type { Scene, SceneElement, IdleAnimation } from "@/types/schema"
import { animateIn, staggerIn, applyIdleAnimation } from "@/engine/animator"
import { highlight } from "@/lib/highlight"
import Gradient from "./backgrounds/Gradient"
import Terminal from "./backgrounds/Terminal"
import Blackboard from "./backgrounds/Blackboard"
import CodeEditor from "./backgrounds/CodeEditor"
import Space from "./backgrounds/Space"
import Grid3D from "./backgrounds/Grid3D"
import Circuit from "./backgrounds/Circuit"

interface Props {
  scene: Scene
  isPlaying: boolean
}

const highlightCache = new Map<string, string>()

async function getHighlighted(code: string, lang: string): Promise<string> {
  const key = `${lang}::${code}`
  if (highlightCache.has(key)) return highlightCache.get(key)!
  const html = await highlight(code, lang)
  highlightCache.set(key, html)
  return html
}

export default function SceneRenderer({ scene, isPlaying }: Props) {
  const elementRefs = useRef<(HTMLElement | null)[]>([])
  const idleKillsRef = useRef<(() => void)[]>([])
  const [highlightedCode, setHighlightedCode] = useState<Record<number, string>>({})

  // Pre-highlight all code elements
  useEffect(() => {
    const run = async () => {
      const results: Record<number, string> = {}
      await Promise.all(
        scene.elements.map(async (el, i) => {
          if (el.type === "code" || el.type === "code_highlight") {
            const html = await getHighlighted(el.value, el.language ?? "rust")
            results[i] = html
          }
        })
      )
      setHighlightedCode(results)
    }
    run()
  }, [scene])

  // Kill idle animations on scene change
  useEffect(() => {
    return () => {
      idleKillsRef.current.forEach(kill => kill())
      idleKillsRef.current = []
    }
  }, [scene])

  // Fire animations — re-runs when highlightedCode is ready
  useEffect(() => {
    idleKillsRef.current.forEach(kill => kill())
    idleKillsRef.current = []

    elementRefs.current.forEach((el, i) => {
      if (!el) return
      const element = scene.elements?.[i]
      if (!element) return

      // For code elements wait until highlight is ready
      if (
        (element.type === "code" || element.type === "code_highlight") &&
        !highlightedCode[i]
      ) return

      const idle = (element as any).idle as IdleAnimation | undefined
      const delay = element.delay ?? 0

      if (element.type === "bullet_list") {
        const items = el.querySelectorAll<HTMLElement>(".bullet-item")
        if (items.length > 0) {
          staggerIn(
            Array.from(items),
            element.animation_in ?? "slide_up",
            element.stagger ?? 0.3,
            delay
          )
        }
      } else if (element.type === "flow_diagram") {
        const nodes = el.querySelectorAll<HTMLElement>(".flow-node")
        const edges = el.querySelectorAll<HTMLElement>(".flow-edge")
        staggerIn(Array.from(nodes), element.animation_in ?? "fade_in", 0.15, delay)
        staggerIn(Array.from(edges), "fade_in", 0.1, delay + nodes.length * 0.15)
      } else if (element.type === "stack_diagram") {
        const layers = el.querySelectorAll<HTMLElement>(".stack-layer")
        staggerIn(
          Array.from(layers),
          element.animation_in ?? "slide_up",
          element.stagger ?? 0.2,
          delay
        )
      } else if (element.type === "split_screen") {
        const panels = el.querySelectorAll<HTMLElement>(".split-panel")
        staggerIn(Array.from(panels), element.animation_in ?? "slide_up", 0.2, delay)
      } else {
        animateIn(el, element.animation_in ?? "fade_in", delay)
      }

      if (idle && idle !== "none") {
        const idleDelay = delay + 0.7
        const anim = applyIdleAnimation(el, idle, idleDelay)
        if (anim) idleKillsRef.current.push(() => anim.kill())
      }
    })
  }, [scene, highlightedCode])

  // ─── Background ─────────────────────────────────────────

  const renderBackground = () => {
    const bg = scene.background
    if (!bg) return <div className="scene-bg" style={{ background: "#080810" }} />
    switch (bg.type) {
      case "gradient":    return <Gradient colors={bg.gradient ?? ["#080810", "#0f172a"]} />
      case "solid":       return <div className="scene-bg" style={{ background: bg.color ?? "#080810" }} />
      case "terminal":    return <Terminal />
      case "blackboard":  return <Blackboard />
      case "code_editor": return <CodeEditor />
      case "space":       return <Space />
      case "grid_3d":     return <Grid3D />
      case "circuit":     return <Circuit />
      default:            return <div className="scene-bg" style={{ background: "#080810" }} />
    }
  }

  // ─── Helpers ─────────────────────────────────────────────

  const getPositionClass = (position?: string) => {
    switch (position) {
      case "top":          return "el-pos--top"
      case "bottom":       return "el-pos--bottom"
      case "top_left":     return "el-pos--top-left"
      case "top_right":    return "el-pos--top-right"
      case "bottom_left":  return "el-pos--bottom-left"
      case "bottom_right": return "el-pos--bottom-right"
      default:             return "el-pos--center"
    }
  }

  const getTextClass = (style?: string) => {
    switch (style) {
      case "hook":       return "text-hook"
      case "title":      return "text-title"
      case "subtitle":   return "text-subtitle"
      case "body":       return "text-body"
      case "caption":    return "text-caption"
      case "code_label": return "text-code-label"
      default:           return "text-body"
    }
  }

  // ─── Code block shared JSX ───────────────────────────────

  const renderCodeBlock = (
    index: number,
    posClass: string,
    language: string | undefined,
    html: string | undefined,
    highlightToken?: string,
    highlightColor?: string
  ) => {
    let finalHtml = html

    if (html && highlightToken) {
      const glowColor = highlightColor ?? "#facc15"
      finalHtml = html.replace(
        new RegExp(
          `(>${highlightToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<)`,
          "g"
        ),
        `><span class="code-highlight-token" style="color:${glowColor};text-shadow:0 0 12px ${glowColor},0 0 24px ${glowColor}66;font-weight:700;">${highlightToken}</span><`
      )
    }

    return (
      <div
        ref={el => { elementRefs.current[index] = el }}
        className={`scene-element ${posClass} code-block`}
        style={{ opacity: 0 }}
      >
        <div className="code-block-header">
          <span className="code-dot code-dot--red" />
          <span className="code-dot code-dot--yellow" />
          <span className="code-dot code-dot--green" />
          {language && <span className="code-lang">{language}</span>}
        </div>
        {finalHtml ? (
          <div
            className="code-shiki"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />
        ) : (
          <div className="code-shiki code-shiki--loading">
            <span className="code-loading-dot" />
          </div>
        )}
      </div>
    )
  }

  // ─── Element renderers ────────────────────────────────────

  const renderElement = (element: SceneElement, index: number) => {
    const posClass = getPositionClass(element.position)

    switch (element.type) {

      // ── Text ──────────────────────────────────────────────
      case "text":
        return (
          <div
            key={index}
            ref={el => { elementRefs.current[index] = el }}
            className={`scene-element ${posClass}`}
            style={{ opacity: 0 }}
          >
            <p
              className={getTextClass(element.style)}
              style={{ color: element.color ?? undefined }}
            >
              {element.value}
            </p>
          </div>
        )

      // ── Code ──────────────────────────────────────────────
      case "code":
        return (
          <div key={index}>
            {renderCodeBlock(
              index,
              posClass,
              element.language,
              highlightedCode[index]
            )}
          </div>
        )

      // ── Code Highlight ────────────────────────────────────
      case "code_highlight":
        return (
          <div key={index}>
            {renderCodeBlock(
              index,
              posClass,
              element.language,
              highlightedCode[index],
              element.highlight_token,
              element.highlight_color
            )}
          </div>
        )

      // ── Bullet list ───────────────────────────────────────
      case "bullet_list":
        return (
          <div
            key={index}
            ref={el => { elementRefs.current[index] = el }}
            className={`scene-element ${posClass} bullet-list`}
            style={{ opacity: 1 }}
          >
            {element.items?.map((item, j) => (
              <div key={j} className="bullet-item" style={{ opacity: 0 }}>
                <span className="bullet-dot">▸</span>
                <span
                  className="bullet-text"
                  style={{ color: element.color ?? undefined }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        )

      // ── Callout ───────────────────────────────────────────
      case "callout":
        return (
          <div
            key={index}
            ref={el => { elementRefs.current[index] = el }}
            className={`scene-element ${posClass}`}
            style={{ opacity: 0, width: "88%" }}
          >
            <div
              className="callout"
              style={{
                borderLeftColor: element.accent ?? "#22d3ee",
                background: `${element.accent ?? "#22d3ee"}08`,
              }}
            >
              <p className="callout-text">{element.value}</p>
            </div>
          </div>
        )

      // ── Flow diagram ──────────────────────────────────────
      case "flow_diagram": {
        const isHorizontal = (element.direction ?? "horizontal") === "horizontal"
        return (
          <div
            key={index}
            ref={el => { elementRefs.current[index] = el }}
            className={`scene-element ${posClass}`}
            style={{ opacity: 1, width: "92%" }}
          >
            <div
              className="flow-diagram"
              style={{ flexDirection: isHorizontal ? "row" : "column" }}
            >
              {element.nodes.map((node) => {
                const edge = element.edges.find(e => e.from === node.id)
                return (
                  <div
                    key={node.id}
                    style={{
                      display: "flex",
                      flexDirection: isHorizontal ? "row" : "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className={`flow-node ${node.accent ? "flow-node--accent" : ""}`}
                      style={{
                        opacity: 0,
                        borderColor: node.color ?? undefined,
                        boxShadow: node.accent
                          ? `0 0 16px ${node.color ?? "#22d3ee"}88`
                          : undefined,
                        color: node.accent
                          ? (node.color ?? "#22d3ee")
                          : undefined,
                      }}
                    >
                      <span className="flow-node-label">{node.label}</span>
                    </div>
                    {edge && (
                      <div
                        className={`flow-edge ${edge.animated ? "flow-edge--animated" : ""}`}
                        style={{ opacity: 0 }}
                      >
                        <div className="flow-edge-line" />
                        <svg
                          className="flow-edge-arrow"
                          width="10"
                          height="14"
                          viewBox="0 0 10 14"
                          style={{
                            transform: isHorizontal ? "rotate(0deg)" : "rotate(90deg)",
                          }}
                        >
                          <path
                            d="M0 0 L10 7 L0 14"
                            fill="none"
                            stroke="rgba(99,102,241,0.8)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {edge.label && (
                          <span className="flow-edge-label">{edge.label}</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      }

      // ── Stack diagram ─────────────────────────────────────
      case "stack_diagram":
        return (
          <div
            key={index}
            ref={el => { elementRefs.current[index] = el }}
            className={`scene-element ${posClass}`}
            style={{ opacity: 1, width: "88%" }}
          >
            {element.title && (
              <p className="stack-title">{element.title}</p>
            )}
            <div className="stack-diagram">
              {element.layers.map((layer, li) => (
                <div
                  key={li}
                  className={`stack-layer ${layer.accent ? "stack-layer--accent" : ""}`}
                  style={{
                    opacity: 0,
                    borderColor: layer.color ?? undefined,
                    background: layer.accent
                      ? `${layer.color ?? "#22d3ee"}12`
                      : undefined,
                    boxShadow: layer.accent
                      ? `0 0 20px ${layer.color ?? "#22d3ee"}44`
                      : undefined,
                  }}
                >
                  <span
                    className="stack-layer-label"
                    style={{
                      color: layer.accent
                        ? (layer.color ?? "#22d3ee")
                        : undefined,
                    }}
                  >
                    {layer.label}
                  </span>
                  {layer.sublabel && (
                    <span className="stack-layer-sublabel">
                      {layer.sublabel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      // ── Split screen ──────────────────────────────────────
      case "split_screen":
        return (
          <div
            key={index}
            ref={el => { elementRefs.current[index] = el }}
            className={`scene-element ${posClass}`}
            style={{ opacity: 1, width: "92%" }}
          >
            {element.title && (
              <p className="split-title">{element.title}</p>
            )}
            <div className="split-screen">
              {[element.left, element.right].map((panel, pi) => (
                <div
                  key={pi}
                  className="split-panel"
                  style={{
                    opacity: 0,
                    borderTopColor: panel.color ?? (pi === 0 ? "#6366f1" : "#22d3ee"),
                  }}
                >
                  <div
                    className="split-panel-label"
                    style={{
                      color: panel.color ?? (pi === 0 ? "#6366f1" : "#22d3ee"),
                    }}
                  >
                    {panel.icon && (
                      <span className="split-panel-icon">{panel.icon}</span>
                    )}
                    {panel.label}
                  </div>
                  <div className="split-panel-items">
                    {panel.items.map((item, ii) => (
                      <div key={ii} className="split-panel-item">
                        <span
                          className="split-panel-dot"
                          style={{
                            background: panel.color ?? (pi === 0 ? "#6366f1" : "#22d3ee"),
                          }}
                        />
                        <span className="split-panel-text">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      // ── Divider ───────────────────────────────────────────
      case "divider":
        return (
          <div
            key={index}
            ref={el => { elementRefs.current[index] = el }}
            className={`scene-element ${posClass} divider`}
            style={{ opacity: 0 }}
          >
            <hr
              className="divider-line"
              style={{ borderColor: element.color ?? undefined }}
            />
          </div>
        )

      // ── Arrow ─────────────────────────────────────────────
      case "arrow":
        return (
          <div
            key={index}
            ref={el => { elementRefs.current[index] = el }}
            className={`scene-element ${posClass}`}
            style={{ opacity: 0 }}
          >
            <span
              className="arrow-el"
              style={{ color: element.color ?? undefined }}
            >
              →
            </span>
          </div>
        )

      // ── Image ─────────────────────────────────────────────
      case "image":
        return (
          <div
            key={index}
            ref={el => { elementRefs.current[index] = el }}
            className={`scene-element ${posClass}`}
            style={{ opacity: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={element.src}
              alt=""
              style={{
                width: element.width ?? "100%",
                height: element.height ?? "auto",
                borderRadius: 8,
              }}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="scene-root">
      {renderBackground()}
      <div className="scene-elements-layer">
        {scene.elements?.map((el, i) => renderElement(el, i))}
      </div>
    </div>
  )
}