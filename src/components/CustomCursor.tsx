"use client"

import { useEffect, useRef, useState } from "react"
import { useStore } from "@/store"

export default function CustomCursor() {
  const { presentMode } = useStore()
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const frameRef = useRef<DOMRect | null>(null)
  const { tool } = useStore()

  useEffect(() => {
  const frame = document.querySelector("[data-phone-frame]") as HTMLElement | null
  if (!frame) return

  if (presentMode && tool === "code") {
    frame.style.cursor = "none"
  } else {
    frame.style.cursor = "auto"
  }

  return () => {
    frame.style.cursor = "auto"
  }
}, [presentMode, tool])

  useEffect(() => {
    function updateFrameRect() {
      const frame = document.querySelector("[data-phone-frame]")
      if (frame) frameRef.current = frame.getBoundingClientRect()
    }
    updateFrameRect()
    window.addEventListener("resize", updateFrameRect)

    function onMouseMove(e: MouseEvent) {
      const rect = frameRef.current
      if (!rect) return
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      setVisible(inside)
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    window.addEventListener("mousemove", onMouseMove)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("resize", updateFrameRect)
    }
  }, [])

  if (!visible || tool !== 'code') return null
  
  if (!visible || tool !== "code" || !presentMode) return null

return (
  <div
    style={{
      position: "absolute",
      left: pos.x,
      top: pos.y,
      transform: "translate(-2px, -2px)",
      pointerEvents: "none",
      zIndex: 50,
      userSelect: "none",
      lineHeight: 1,
    }}
  >
    <div
      style={{
        fontSize: 28,
        color: "#fff",
        textShadow:
          "0 0 8px rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.7)",
      }}
    >
      👆
    </div>
  </div>
)
}