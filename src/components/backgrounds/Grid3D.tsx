"use client"

import { useEffect, useRef } from "react"

export default function Grid3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
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

    const HORIZON = H * 0.48
    const SPEED = 0.55

    const STARS = Array.from({ length: 70 }, (_, i) => ({
      x: (Math.sin(i * 2.7 + 1) * 0.5 + 0.5) * W,
      y: (Math.cos(i * 1.9 + 0.5) * 0.5 + 0.5) * HORIZON * 0.95,
      r: Math.sin(i * 3.1) > 0.7 ? 1.1 : 0.5,
      phase: i * 0.8,
    }))

    const draw = () => {
      timeRef.current += 0.016

      ctx.fillStyle = "#04061a"
      ctx.fillRect(0, 0, W, H)

      const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON)
      skyGrad.addColorStop(0, "#03051a")
      skyGrad.addColorStop(0.65, "#080d2e")
      skyGrad.addColorStop(1, "#160830")
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, W, HORIZON)

      STARS.forEach(s => {
        const bri = 0.35 + Math.sin(timeRef.current * 1.2 + s.phase) * 0.2
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,215,255,${bri})`
        ctx.fill()
      })

      const hGlow = ctx.createRadialGradient(W / 2, HORIZON, 0, W / 2, HORIZON, W * 0.9)
      hGlow.addColorStop(0, "rgba(34,211,238,0.55)")
      hGlow.addColorStop(0.25, "rgba(99,102,241,0.28)")
      hGlow.addColorStop(0.6, "rgba(168,85,247,0.1)")
      hGlow.addColorStop(1, "transparent")
      ctx.fillStyle = hGlow
      ctx.fillRect(0, HORIZON - 90, W, 180)

      const floorGrad = ctx.createLinearGradient(0, HORIZON, 0, H)
      floorGrad.addColorStop(0, "#0e0838")
      floorGrad.addColorStop(0.4, "#090624")
      floorGrad.addColorStop(1, "#04061a")
      ctx.fillStyle = floorGrad
      ctx.fillRect(0, HORIZON, W, H - HORIZON)

      const VLINES = 16
      for (let i = 0; i <= VLINES; i++) {
        const t = i / VLINES
        const xB = t * W
        const xT = W / 2 + (xB - W / 2) * 0.04
        const alpha = 0.85 - Math.abs(t - 0.5) * 1.5
        if (alpha <= 0) continue
        const grad = ctx.createLinearGradient(xT, HORIZON, xB, H)
        grad.addColorStop(0, `rgba(34,211,238,${alpha})`)
        grad.addColorStop(0.5, `rgba(99,102,241,${alpha * 0.7})`)
        grad.addColorStop(1, `rgba(168,85,247,${alpha * 0.2})`)
        ctx.beginPath()
        ctx.moveTo(xT, HORIZON)
        ctx.lineTo(xB, H)
        ctx.strokeStyle = grad
        ctx.lineWidth = i === 0 || i === VLINES ? 1.5 : 0.9
        ctx.stroke()
      }

      const HLINES = 18
      const animOffset = offsetRef.current % 1
      for (let i = 0; i <= HLINES; i++) {
        const t = Math.pow((i + animOffset) / HLINES, 2.2)
        const y = HORIZON + t * (H - HORIZON)
        if (y <= HORIZON) continue
        const alpha = t * 0.85
        const grad = ctx.createLinearGradient(0, y, W, y)
        grad.addColorStop(0, "transparent")
        grad.addColorStop(0.08, `rgba(34,211,238,${alpha})`)
        grad.addColorStop(0.5, `rgba(110,120,255,${alpha * 1.4})`)
        grad.addColorStop(0.92, `rgba(34,211,238,${alpha})`)
        grad.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1
        ctx.stroke()
      }

      offsetRef.current += SPEED * 0.016
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div className="grid3d-bg">
      <canvas ref={canvasRef} className="grid3d-canvas" />
    </div>
  )
}
