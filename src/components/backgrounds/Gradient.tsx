"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

interface GradientProps {
  colors?: string[]
  animated?: boolean
}

export default function Gradient({ colors = ["#020617", "#0f172a", "#1e1b4b"], animated = true }: GradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t
    }

    function hexToRgb(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return { r, g, b }
    }

    function draw() {
      timeRef.current += 0.004

      const t = (Math.sin(timeRef.current) + 1) / 2

      const c1 = hexToRgb(colors[0] || "#020617")
      const c2 = hexToRgb(colors[1] || "#0f172a")
      const c3 = hexToRgb(colors[2] || colors[1] || "#1e1b4b")

      const midR = lerp(c2.r, c3.r, t)
      const midG = lerp(c2.g, c3.g, t)
      const midB = lerp(c2.b, c3.b, t)

      const grad = ctx.createLinearGradient(0, 0, canvas.width * 0.3, canvas.height)
      grad.addColorStop(0, `rgb(${c1.r},${c1.g},${c1.b})`)
      grad.addColorStop(0.5, `rgb(${Math.round(midR)},${Math.round(midG)},${Math.round(midB)})`)
      grad.addColorStop(1, `rgb(${c2.r},${c2.g},${c2.b})`)

      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const orbX = canvas.width * (0.5 + Math.sin(timeRef.current * 0.7) * 0.3)
      const orbY = canvas.height * (0.4 + Math.cos(timeRef.current * 0.5) * 0.15)
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, canvas.width * 0.6)
      orbGrad.addColorStop(0, `rgba(99,102,241,${0.12 + Math.sin(timeRef.current) * 0.04})`)
      orbGrad.addColorStop(1, "rgba(99,102,241,0)")
      ctx.fillStyle = orbGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const orb2X = canvas.width * (0.3 + Math.cos(timeRef.current * 0.6) * 0.2)
      const orb2Y = canvas.height * (0.7 + Math.sin(timeRef.current * 0.4) * 0.1)
      const orb2Grad = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, canvas.width * 0.4)
      orb2Grad.addColorStop(0, `rgba(168,85,247,${0.08 + Math.cos(timeRef.current) * 0.03})`)
      orb2Grad.addColorStop(1, "rgba(168,85,247,0)")
      ctx.fillStyle = orb2Grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (animated) {
        animRef.current = requestAnimationFrame(draw)
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
    }
  }, [colors, animated])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    />
  )
}