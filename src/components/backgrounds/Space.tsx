"use client"

import { useEffect, useRef } from "react"

interface Star { x: number; y: number; z: number; pz: number }

export default function Space() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    const NUM = 280
    const SPEED = 3.5
    const cx = W / 2
    const cy = H / 2

    const stars: Star[] = Array.from({ length: NUM }, () => ({
      x: (Math.random() - 0.5) * W,
      y: (Math.random() - 0.5) * H,
      z: Math.random() * W,
      pz: 0,
    }))

    const nebulas = [
      { x: W * 0.15, y: H * 0.22, r: W * 0.72, color: [110, 40, 220] },
      { x: W * 0.88, y: H * 0.55, r: W * 0.65, color: [30, 90, 210] },
      { x: W * 0.5,  y: H * 0.85, r: W * 0.58, color: [200, 40, 130] },
      { x: W * 0.3,  y: H * 0.7,  r: W * 0.45, color: [20, 160, 200] },
    ]

    ctx.fillStyle = "#020818"
    ctx.fillRect(0, 0, W, H)

    const draw = () => {
      ctx.fillStyle = "rgba(2, 8, 24, 0.2)"
      ctx.fillRect(0, 0, W, H)

      nebulas.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
        g.addColorStop(0, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},0.18)`)
        g.addColorStop(0.4, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},0.08)`)
        g.addColorStop(1, "transparent")
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      })

      stars.forEach(s => {
        s.pz = s.z
        s.z -= SPEED

        if (s.z <= 0) {
          s.x = (Math.random() - 0.5) * W
          s.y = (Math.random() - 0.5) * H
          s.z = W
          s.pz = W
        }

        const sx = (s.x / s.z) * W + cx
        const sy = (s.y / s.z) * H + cy
        const px = (s.x / s.pz) * W + cx
        const py = (s.y / s.pz) * H + cy

        const depth = 1 - s.z / W
        const size = Math.max(0.3, depth * 3)
        const alpha = depth * 0.9 + 0.1
        const bright = Math.floor(depth * 255)

        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx, sy)
        ctx.strokeStyle = `rgba(${bright},${bright},${Math.min(255, bright + 60)},${alpha})`
        ctx.lineWidth = size
        ctx.stroke()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div className="space-bg">
      <canvas ref={canvasRef} className="space-canvas" />
    </div>
  )
}
