"use client"

import { useEffect, useRef, useState } from "react"
import { useStore } from "@/store"

export default function CustomCursor() {
  const { presentMode } = useStore()
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
      {presentMode ? (
        <div style={{ fontSize: 22, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.8))" }}>
          👆
        </div>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 2L6.5 17L9.5 13L12.5 19L14.5 18L11.5 12L16 12.5Z"
            fill="white"
            stroke="black"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )
}