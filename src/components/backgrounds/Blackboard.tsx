"use client"

import { useEffect, useRef } from "react"

export default function Blackboard() {
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

    const FRAME = 10

    const particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number; color: string }[] = []
    const COLORS = ["rgba(255,255,240,", "rgba(180,255,200,", "rgba(200,220,255,", "rgba(255,210,180,"]

    for (let i = 0; i < 55; i++) {
      particles.push({
        x: FRAME + Math.random() * (W - FRAME * 2),
        y: FRAME + Math.random() * (H - FRAME * 2),
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.1 - Math.random() * 0.25,
        alpha: 0.05 + Math.random() * 0.3,
        size: 0.5 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }

    const marks: { x: number; y: number; len: number; angle: number; alpha: number; color: string }[] = []
    const MCOLORS = ["rgba(255,255,240,", "rgba(160,240,180,", "rgba(160,200,255,"]
    for (let i = 0; i < 18; i++) {
      marks.push({
        x: FRAME + Math.random() * (W - FRAME * 2),
        y: FRAME + Math.random() * (H - FRAME * 2),
        len: 10 + Math.random() * 40,
        angle: Math.random() * Math.PI,
        alpha: 0.04 + Math.random() * 0.1,
        color: MCOLORS[Math.floor(Math.random() * MCOLORS.length)],
      })
    }

    const drawFrame = () => {
      ctx.fillStyle = "#1c3320"
      ctx.fillRect(0, 0, W, H)

      for (let i = 0; i < 1800; i++) {
        const dx = (Math.sin(i * 1.73) * 0.5 + 0.5) * (W - FRAME * 2) + FRAME
        const dy = (Math.cos(i * 2.19) * 0.5 + 0.5) * (H - FRAME * 2) + FRAME
        ctx.beginPath()
        ctx.arc(dx, dy, 0.6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,225,200,${0.02 + (i % 7) * 0.005})`
        ctx.fill()
      }

      marks.forEach(m => {
        ctx.save()
        ctx.translate(m.x, m.y)
        ctx.rotate(m.angle)
        ctx.strokeStyle = `${m.color}${m.alpha})`
        ctx.lineWidth = 1.5
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(m.len, 0)
        ctx.stroke()
        ctx.restore()
      })

      const tg = ctx.createLinearGradient(0, 0, 0, H)
      tg.addColorStop(0, "rgba(0,0,0,0.25)")
      tg.addColorStop(0.15, "transparent")
      tg.addColorStop(0.85, "transparent")
      tg.addColorStop(1, "rgba(0,0,0,0.25)")
      ctx.fillStyle = tg
      ctx.fillRect(0, 0, W, H)

      const topGrad = ctx.createLinearGradient(0, 0, 0, FRAME)
      topGrad.addColorStop(0, "#7c5c2e")
      topGrad.addColorStop(1, "#5a3e1b")
      ctx.fillStyle = topGrad
      ctx.fillRect(0, 0, W, FRAME)

      const botGrad = ctx.createLinearGradient(0, H - FRAME, 0, H)
      botGrad.addColorStop(0, "#5a3e1b")
      botGrad.addColorStop(1, "#7c5c2e")
      ctx.fillStyle = botGrad
      ctx.fillRect(0, H - FRAME, W, FRAME)

      ctx.fillStyle = "#6b4f22"
      ctx.fillRect(0, FRAME, FRAME, H - FRAME * 2)
      ctx.fillRect(W - FRAME, FRAME, FRAME, H - FRAME * 2)
    }

    drawFrame()

    const animate = () => {
      ctx.fillStyle = "rgba(28,51,32,0.15)"
      ctx.fillRect(FRAME, FRAME, W - FRAME * 2, H - FRAME * 2)

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.alpha -= 0.0008

        if (p.alpha <= 0 || p.x < FRAME || p.x > W - FRAME || p.y < FRAME) {
          p.x = FRAME + Math.random() * (W - FRAME * 2)
          p.y = H - FRAME - Math.random() * 60
          p.vy = -0.1 - Math.random() * 0.25
          p.vx = (Math.random() - 0.5) * 0.3
          p.alpha = 0.1 + Math.random() * 0.25
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div className="blackboard-bg">
      <canvas ref={canvasRef} className="blackboard-canvas" />
    </div>
  )
}
