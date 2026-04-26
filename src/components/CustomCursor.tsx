"use client"

import { useEffect, useRef, useState } from "react"
import { useStore } from "@/store"

export default function CustomCursor() {
  const { cursorStyle, tool } = useStore()
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const frameRef = useRef<DOMRect | null>(null)

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

  if (!visible) return null
  if (tool === "draw") return null

  return (
    <div style={{
      position: "absolute",
      left: pos.x,
      top: pos.y,
      transform: "translate(-2px, -2px)",
      pointerEvents: "none",
      zIndex: 50,
      userSelect: "none",
      lineHeight: 1,
    }}>
      {cursorStyle === "pointer" && (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M4 2L6.5 18L10 14L13 20L15 19L12 13L17 13.5Z"
            fill="white"
            stroke="black"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {cursorStyle === "hand" && (
  <div style={{ fontSize: 24, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.8))" }}>
    👆
  </div>
)}
    </div>
  )
}