"use client"

import { useEffect, useRef } from "react"
import type { Scene, SceneElement } from "@/types/schema"
import { animateIn, staggerIn } from "@/engine/animator"
import Gradient from "./backgrounds/Gradient"
import Terminal from "./backgrounds/Terminal"
import Blackboard from "./backgrounds/Blackboard"
import CodeEditor from "./backgrounds/CodeEditor"
import Space from "./backgrounds/Space"

interface Props {
  scene: Scene
  isPlaying: boolean
}

export default function SceneRenderer({ scene, isPlaying }: Props) {
  const elementRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    elementRefs.current.forEach((el, i) => {
      if (!el) return
      const element = scene.elements?.[i]
      if (!element) return

      if (element.type === "bullet_list") {
        const items = el.querySelectorAll<HTMLElement>(".bullet-item")
        if (items.length > 0) {
          staggerIn(
            Array.from(items),
            element.animation_in ?? "slide_up",
            element.stagger ?? 0.3,
            element.delay ?? 0
          )
        }
      } else {
        animateIn(
          el,
          element.animation_in ?? "fade_in",
          element.delay ?? 0
        )
      }
    })
  }, [scene])

  const renderBackground = () => {
    const bg = scene.background
    if (!bg) return <div className="scene-bg" style={{ background: "#020617" }} />

    switch (bg.type) {
      case "gradient":
        return <Gradient colors={bg.gradient ?? ["#020617", "#0f172a"]} />
      case "solid":
        return <div className="scene-bg" style={{ background: bg.color ?? "#020617" }} />
      case "terminal":
        return <Terminal />
      case "blackboard":
        return <Blackboard />
      case "code_editor":
        return <CodeEditor />
      case "space":
        return <Space />
      default:
        return <div className="scene-bg" style={{ background: "#020617" }} />
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

  const renderElement = (element: SceneElement, index: number) => {
    const posClass = getPositionClass(element.position)

    switch (element.type) {
      case "text":
        return (
          <div
            key={index}
            ref={(el) => { elementRefs.current[index] = el }}
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
          <div
            key={index}
            ref={(el) => { elementRefs.current[index] = el }}
            className={`scene-element ${posClass} code-block`}
            style={{ opacity: 0 }}
          >
            <div className="code-block-header">
              <span className="code-dot code-dot--red" />
              <span className="code-dot code-dot--yellow" />
              <span className="code-dot code-dot--green" />
              {element.language && (
                <span className="code-lang">{element.language}</span>
              )}
            </div>
            <pre className="code-pre">
              <code>{element.value}</code>
            </pre>
          </div>
        )

      case "bullet_list":
        return (
          <div
            key={index}
            ref={(el) => { elementRefs.current[index] = el }}
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

      case "divider":
        return (
          <div
            key={index}
            ref={(el) => { elementRefs.current[index] = el }}
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
            ref={(el) => { elementRefs.current[index] = el }}
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
            ref={(el) => { elementRefs.current[index] = el }}
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