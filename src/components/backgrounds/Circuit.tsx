"use client"

import { useEffect, useRef } from "react"

interface Node { x: number; y: number }
interface Trace {
  points: Node[]
  progress: number
  speed: number
  color: string
  pulseOffset: number
  width: number
}

export default function Circuit() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const tracesRef = useRef<Trace[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    const GRID = 20
    const COLORS = [
      "rgba(34,211,238,",
      "rgba(74,222,128,",
      "rgba(99,102,241,",
      "rgba(168,85,247,",
    ]

    const generateTrace = (): Trace => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const points: Node[] = []
      let x = Math.floor(Math.random() * (W / GRID)) * GRID
      let y = Math.floor(Math.random() * (H / GRID)) * GRID
      points.push({ x, y })
      const steps = 6 + Math.floor(Math.random() * 10)
      let lastDir = -1
      for (let i = 0; i < steps; i++) {
        const dirs = [
          { dx: GRID, dy: 0, id: 0 },
          { dx: -GRID, dy: 0, id: 1 },
          { dx: 0, dy: GRID, id: 2 },
          { dx: 0, dy: -GRID, id: 3 },
        ].filter(d => {
          if (lastDir === 0 && d.id === 1) return false
          if (lastDir === 1 && d.id === 0) return false
          if (lastDir === 2 && d.id === 3) return false
          if (lastDir === 3 && d.id === 2) return false
          const nx = x + d.dx
          const ny = y + d.dy
          return nx >= 0 && nx <= W && ny >= 0 && ny <= H
        })
        if (dirs.length === 0) break
        const weights = dirs.map(d => d.id === lastDir ? 3 : 1)
        const total = weights.reduce((a, b) => a + b, 0)
        let rand = Math.random() * total
        let chosen = dirs[0]
        for (let j = 0; j < dirs.length; j++) {
          rand -= weights[j]
          if (rand <= 0) { chosen = dirs[j]; break }
        }
        x += chosen.dx
        y += chosen.dy
        lastDir = chosen.id
        points.push({ x, y })
      }
      return { points, progress: Math.random(), speed: 0.003 + Math.random() * 0.006, color, pulseOffset: Math.random() * Math.PI * 2, width: Math.random() < 0.2 ? 1.5 : 0.8 }
    }

    tracesRef.current = Array.from({ length: 28 }, generateTrace)

    const getTotalLength = (points: Node[]) => {
      let len = 0
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x
        const dy = points[i].y - points[i - 1].y
        len += Math.sqrt(dx * dx + dy * dy)
      }
      return len
    }

    const getPointAt = (points: Node[], t: number): Node => {
      const total = getTotalLength(points)
      let target = t * total
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x
        const dy = points[i].y - points[i - 1].y
        const seg = Math.sqrt(dx * dx + dy * dy)
        if (target <= seg) {
          const ratio = target / seg
          return { x: points[i - 1].x + dx * ratio, y: points[i - 1].y + dy * ratio }
        }
        target -= seg
      }
      return points[points.length - 1]
    }

    let frame = 0

    const draw = () => {
      frame++
      ctx.fillStyle = "rgba(7, 13, 16, 0.92)"
      ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = "rgba(34,211,238,0.05)"
      for (let gx = 0; gx <= W; gx += GRID) {
        for (let gy = 0; gy <= H; gy += GRID) {
          ctx.beginPath()
          ctx.arc(gx, gy, 0.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      tracesRef.current.forEach((trace, idx) => {
        const { points, progress, color, pulseOffset, width } = trace
        if (points.length < 2) return

        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
        ctx.strokeStyle = `${color}0.07)`
        ctx.lineWidth = width
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.stroke()

        const pulseT = progress
        const trailLength = 0.25
        const startT = Math.max(0, pulseT - trailLength)
        const endT = Math.min(1, pulseT)

        if (endT > startT) {
          const startPt = getPointAt(points, startT)
          const endPt = getPointAt(points, endT)
          const grad = ctx.createLinearGradient(startPt.x, startPt.y, endPt.x, endPt.y)
          grad.addColorStop(0, `${color}0)`)
          grad.addColorStop(0.6, `${color}0.4)`)
          grad.addColorStop(1, `${color}1)`)

          ctx.beginPath()
          let accumulated = 0
          const total = getTotalLength(points)
          ctx.moveTo(startPt.x, startPt.y)
          for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x
            const dy = points[i].y - points[i - 1].y
            const seg = Math.sqrt(dx * dx + dy * dy)
            const segStartT = accumulated / total
            const segEndT = (accumulated + seg) / total
            if (segEndT < startT) { accumulated += seg; continue }
            if (segStartT > endT) break
            ctx.lineTo(points[i].x, points[i].y)
            accumulated += seg
          }
          ctx.lineTo(endPt.x, endPt.y)
          ctx.strokeStyle = grad
          ctx.lineWidth = width * 2
          ctx.stroke()

          const alpha = 0.7 + Math.sin(frame * 0.1 + pulseOffset) * 0.3
          ctx.beginPath()
          ctx.arc(endPt.x, endPt.y, width * 3, 0, Math.PI * 2)
          ctx.fillStyle = `${color}${alpha})`
          ctx.fill()

          const glowGrad = ctx.createRadialGradient(endPt.x, endPt.y, 0, endPt.x, endPt.y, width * 8)
          glowGrad.addColorStop(0, `${color}0.4)`)
          glowGrad.addColorStop(1, `${color}0)`)
          ctx.beginPath()
          ctx.arc(endPt.x, endPt.y, width * 8, 0, Math.PI * 2)
          ctx.fillStyle = glowGrad
          ctx.fill()
        }

        points.forEach((pt, i) => {
          if (i === 0 || i === points.length - 1) {
            ctx.beginPath()
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2)
            ctx.fillStyle = `${color}0.2)`
            ctx.fill()
          }
        })

        trace.progress += trace.speed
        if (trace.progress > 1.25) tracesRef.current[idx] = generateTrace()
      })

      const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85)
      vignette.addColorStop(0, "transparent")
      vignette.addColorStop(1, "rgba(7,13,16,0.7)")
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, W, H)

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div className="circuit-bg">
      <canvas ref={canvasRef} className="circuit-canvas" />
    </div>
  )
}
