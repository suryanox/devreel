"use client"

import { useEffect, useRef, useState } from "react"
import CodeBlock from "@/components/CodeBlock"
import Whiteboard from "@/components/Whiteboard"
import CaptionOverlay from "@/components/CaptionOverlay"
import { useSpeech } from "@/hooks/useSpeech"
import CustomCursor from "@/components/CustomCursor"
import Camera from "@/components/Camera"

export default function Preview() {
  useSpeech()
  const frameRef = useRef<HTMLDivElement>(null)
  const [, setDebugInfo] = useState("")

  useEffect(() => {
    function update() {
      if (!frameRef.current) return
      const r = frameRef.current.getBoundingClientRect()
      setDebugInfo(`left:${Math.round(r.left)} top:${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)} | innerW:${window.innerWidth}`)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <div style={{
      flex: 1,
      background: "#080809",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 40% 50%, rgba(139,92,246,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div
  ref={frameRef}
  data-phone-frame
  style={{
    width: 360,
    height: 640,
    borderRadius: 12,
    border: "1.5px solid rgba(255,255,255,0.12)",
    background: "linear-gradient(180deg, #0d0d1a 0%, #0a0a12 100%)",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
    flexShrink: 0,
    cursor: "none",
  }}
>
  <CodeBlock />
  <Whiteboard />
  <CaptionOverlay />
  <Camera />
  <CustomCursor />
</div>
    </div>
  )
}