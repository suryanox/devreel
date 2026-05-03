"use client"

import { useEffect, useRef } from "react"

export default function Grid3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const offsetRef = useRef(0)

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
    const GRID_LINES_X = 12
    const GRID_LINES_Z = 18
    const SPEED = 0.4

    const drawGrid = () => {
      // Background
      ctx.fillStyle = "#080810"
      ctx.fillRect(0, 0, W, H)

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON)
      skyGrad.addColorStop(0, "#080810")
      skyGrad.addColorStop(0.6, "#0d0820")
      skyGrad.addColorStop(1, "#1a0535")
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, W, HORIZON)

      // Horizon glow
      const horizonGlow = ctx.createLinearGradient(0, HORIZON - 40, 0, HORIZON + 40)
      horizonGlow.addColorStop(0, "transparent")
      horizonGlow.addColorStop(0.5, "rgba(168,85,247,0.35)")
      horizonGlow.addColorStop(1, "transparent")
      ctx.fillStyle = horizonGlow
      ctx.fillRect(0, HORIZON - 40, W, 80)

      // Sun / glow orb
      const sunGrad = ctx.createRadialGradient(W / 2, HORIZON, 0, W / 2, HORIZON, 90)
      sunGrad.addColorStop(0, "rgba(251,113,133,0.9)")
      sunGrad.addColorStop(0.3, "rgba(168,85,247,0.5)")
      sunGrad.addColorStop(0.7, "rgba(99,102,241,0.2)")
      sunGrad.addColorStop(1, "transparent")
      ctx.fillStyle = sunGrad
      ctx.beginPath()
      ctx.arc(W / 2, HORIZON, 90, 0, Math.PI * 2)
      ctx.fill()

      // Sun horizontal stripes (retrowave)
      for (let i = 0; i < 7; i++) {
        const y = HORIZON - 28 + i * 8
        ctx.fillStyle = "#080810"
        ctx.fillRect(W / 2 - 90, y, 180, 3.5)
      }

      // Stars
      ctx.save()
      ctx.globalAlpha = 0.7
      for (let i = 0; i < 80; i++) {
        const sx = (Math.sin(i * 1.7) * 0.5 + 0.5) * W
        const sy = (Math.cos(i * 2.3) * 0.5 + 0.5) * HORIZON * 0.85
        const sr = Math.random() < 0.1 ? 1.2 : 0.5
        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.arc(sx, sy, sr, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Floor gradient
      const floorGrad = ctx.createLinearGradient(0, HORIZON, 0, H)
      floorGrad.addColorStop(0, "#1a0535")
      floorGrad.addColorStop(0.3, "#0d0820")
      floorGrad.addColorStop(1, "#080810")
      ctx.fillStyle = floorGrad
      ctx.fillRect(0, HORIZON, W, H - HORIZON)

      // Perspective grid — vertical lines
      for (let i = 0; i <= GRID_LINES_X; i++) {
        const t = i / GRID_LINES_X
        const xBottom = t * W
        const xTop = W / 2 + (xBottom - W / 2) * 0.05

        const alpha = 1 - Math.abs(t - 0.5) * 1.6
        if (alpha <= 0) continue

        const grad = ctx.createLinearGradient(xTop, HORIZON, xBottom, H)
        grad.addColorStop(0, `rgba(168,85,247,${alpha * 0.8})`)
        grad.addColorStop(1, `rgba(99,102,241,${alpha * 0.15})`)

        ctx.beginPath()
        ctx.moveTo(xTop, HORIZON)
        ctx.lineTo(xBottom, H)
        ctx.strokeStyle = grad
        ctx.lineWidth = i === 0 || i === GRID_LINES_X ? 1.5 : 0.8
        ctx.stroke()
      }

      // Perspective grid — horizontal lines
      const animOffset = (offsetRef.current % 1)
      for (let i = 0; i <= GRID_LINES_Z; i++) {
        const t = Math.pow((i + animOffset) / GRID_LINES_Z, 2.2)
        const y = HORIZON + t * (H - HORIZON)
        if (y <= HORIZON) continue

        const alpha = t * 0.7
        const grad = ctx.createLinearGradient(0, y, W, y)
        grad.addColorStop(0, "transparent")
        grad.addColorStop(0.2, `rgba(168,85,247,${alpha})`)
        grad.addColorStop(0.5, `rgba(99,102,241,${alpha * 1.2})`)
        grad.addColorStop(0.8, `rgba(168,85,247,${alpha})`)
        grad.addColorStop(1, "transparent")

        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      // Side accent lines
      const accentGrad = ctx.createLinearGradient(0, HORIZON, 0, H)
      accentGrad.addColorStop(0, "rgba(244,114,182,0.6)")
      accentGrad.addColorStop(1, "rgba(244,114,182,0)")
      ctx.strokeStyle = accentGrad
      ctx.lineWidth = 1.5

      ctx.beginPath()
      ctx.moveTo(W / 2, HORIZON)
      ctx.lineTo(0, H)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(W / 2, HORIZON)
      ctx.lineTo(W, H)
      ctx.stroke()

      offsetRef.current += SPEED * 0.016
      rafRef.current = requestAnimationFrame(drawGrid)
    }

    rafRef.current = requestAnimationFrame(drawGrid)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="grid3d-bg">
      <canvas ref={canvasRef} className="grid3d-canvas" />
    </div>
  )
}