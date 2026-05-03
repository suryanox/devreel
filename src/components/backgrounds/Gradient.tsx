"use client"

import { useEffect, useRef } from "react"

interface GradientProps {
  colors?: string[]
  animated?: boolean
}

export default function Gradient({ colors = ["#07042a", "#0d0a3a", "#061428"], animated = true }: GradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    function hexToRgb(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return { r, g, b }
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

    const draw = () => {
      timeRef.current += 0.006

      const t = (Math.sin(timeRef.current) + 1) / 2
      const c1 = hexToRgb(colors[0])
      const c2 = hexToRgb(colors[1])
      const c3 = hexToRgb(colors[2] ?? colors[1])

      const midR = lerp(c2.r, c3.r, t)
      const midG = lerp(c2.g, c3.g, t)
      const midB = lerp(c2.b, c3.b, t)

      const base = ctx.createLinearGradient(0, 0, W * 0.5, H)
      base.addColorStop(0, `rgb(${c1.r},${c1.g},${c1.b})`)
      base.addColorStop(0.55, `rgb(${Math.round(midR)},${Math.round(midG)},${Math.round(midB)})`)
      base.addColorStop(1, `rgb(${c2.r},${c2.g},${c2.b})`)
      ctx.fillStyle = base
      ctx.fillRect(0, 0, W, H)

      const o1x = W * (0.15 + Math.sin(timeRef.current * 0.7) * 0.25)
      const o1y = H * (0.25 + Math.cos(timeRef.current * 0.5) * 0.2)
      const g1 = ctx.createRadialGradient(o1x, o1y, 0, o1x, o1y, W * 0.75)
      g1.addColorStop(0, `rgba(99,102,241,${0.38 + Math.sin(timeRef.current) * 0.08})`)
      g1.addColorStop(0.5, `rgba(99,102,241,0.12)`)
      g1.addColorStop(1, "rgba(99,102,241,0)")
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, W, H)

      const o2x = W * (0.8 + Math.cos(timeRef.current * 0.6) * 0.15)
      const o2y = H * (0.65 + Math.sin(timeRef.current * 0.4) * 0.15)
      const g2 = ctx.createRadialGradient(o2x, o2y, 0, o2x, o2y, W * 0.6)
      g2.addColorStop(0, `rgba(168,85,247,${0.32 + Math.cos(timeRef.current) * 0.07})`)
      g2.addColorStop(0.5, `rgba(168,85,247,0.1)`)
      g2.addColorStop(1, "rgba(168,85,247,0)")
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, W, H)

      const o3x = W * (0.5 + Math.sin(timeRef.current * 0.4 + 1) * 0.2)
      const o3y = H * (0.8 + Math.cos(timeRef.current * 0.3 + 2) * 0.12)
      const g3 = ctx.createRadialGradient(o3x, o3y, 0, o3x, o3y, W * 0.5)
      g3.addColorStop(0, `rgba(34,211,238,${0.22 + Math.sin(timeRef.current * 1.1) * 0.06})`)
      g3.addColorStop(0.5, `rgba(34,211,238,0.06)`)
      g3.addColorStop(1, "rgba(34,211,238,0)")
      ctx.fillStyle = g3
      ctx.fillRect(0, 0, W, H)

      if (animated) rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [colors, animated])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  )
}
