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
        const isCodeEl = element.type === "code" || element.type === "code_highlight"
        const animIn = (isCodeEl && element.animation_in === "type_in")
          ? "fade_in"
          : (element.animation_in ?? "fade_in")
        animateIn(el, animIn, delay)
      }

      if (idle && idle !== "none") {
        const idleDelay = delay + 0.7
        const anim = applyIdleAnimation(el, idle, idleDelay)
        if (anim) idleKillsRef.current.push(() => anim.kill())
      }
    })
  }, [scene, highlightedCode])


  const renderBackground = () => {
    const bg = scene.background
    if (!bg) return <div className="scene-bg" style={{ background: "#090d1a" }} />
    switch (bg.type) {
      case "gradient":    return <Gradient colors={bg.gradient ?? ["#090d1a", "#0f172a"]} />
      case "solid":       return <div className="scene-bg" style={{ background: bg.color ?? "#090d1a" }} />
      case "terminal":    return <Terminal />
      case "blackboard":  return <Blackboard />
      case "code_editor": return <CodeEditor />
      case "space":       return <Space />
      case "grid_3d":     return <Grid3D />
      case "circuit":     return <Circuit />
      default:            return <div className="scene-bg" style={{ background: "#090d1a" }} />
    }
  }


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
        className={`scene-element scene-element--code ${posClass} code-block`}
        style={{ opacity: 0, textAlign: "left" }}
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


  const renderElement = (element: SceneElement, index: number) => {
    const posClass = getPositionClass(element.position)

    switch (element.type) {

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
                borderColor: `${element.accent ?? "#22d3ee"}55`,
                background: `${element.accent ?? "#22d3ee"}14`,
              }}
            >
              <p className="callout-text">{element.value}</p>
            </div>
          </div>
        )

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
                      flex: isHorizontal ? undefined : "none",
                    }}
                  >
                    <div
                      className={`flow-node ${node.accent ? "flow-node--accent" : ""}`}
                      style={{
                        opacity: 0,
                        borderColor: node.color ? `${node.color}88` : undefined,
                        background: node.color ? `${node.color}18` : undefined,
                        color: node.color ?? undefined,
                        width: isHorizontal ? undefined : "100%",
                        justifyContent: isHorizontal ? undefined : "center",
                      }}
                    >
                      <span className="flow-node-label">{node.label}</span>
                    </div>
                    {edge && (
                      <div
                        className={`flow-edge ${edge.animated ? "flow-edge--animated" : ""}`}
                        style={{
                          opacity: 0,
                          flexDirection: isHorizontal ? "row" : "column",
                          alignItems: "center",
                          minWidth: isHorizontal ? 28 : undefined,
                          minHeight: isHorizontal ? undefined : 24,
                          padding: isHorizontal ? "0 2px" : "2px 0",
                        }}
                      >
                        <div
                          className="flow-edge-line"
                          style={isHorizontal ? undefined : {
                            width: 1,
                            height: "100%",
                            minHeight: 20,
                            minWidth: undefined,
                            background: "linear-gradient(180deg, rgba(99,102,241,0.4), rgba(99,102,241,0.7))",
                          }}
                        />
                        <svg
                          className="flow-edge-arrow"
                          width="10"
                          height="14"
                          viewBox="0 0 10 14"
                          style={{ transform: isHorizontal ? "rotate(0deg)" : "rotate(90deg)", flexShrink: 0 }}
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
              {element.layers.map((layer, li) => {
                const layerColor = layer.color ?? (layer.accent ? "#22d3ee" : "#6366f1")
                const total = element.layers.length
                return (
                <div
                  key={li}
                  className={`stack-layer ${layer.accent ? "stack-layer--accent" : ""}`}
                  style={{
                    opacity: 0,
                    boxShadow: `inset 4px 0 0 ${layerColor}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="stack-layer-index">{String(total - li).padStart(2, "0")}</span>
                    <span
                      className="stack-layer-label"
                      style={{ color: layer.accent ? layerColor : undefined }}
                    >
                      {layer.label}
                    </span>
                  </div>
                  {layer.sublabel && (
                    <span className="stack-layer-sublabel">
                      {layer.sublabel}
                    </span>
                  )}
                </div>
                )
              })}
            </div>
          </div>
        )

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