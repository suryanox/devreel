"use client"

import { useEffect, useRef, useState } from "react"
import { useStore } from "@/store"
import { Eraser, Minus, Square, Circle, Pen, Image, Trash2 } from "lucide-react"

type DrawTool = "pen" | "line" | "rect" | "circle" | "eraser" | "select"

interface Point { x: number; y: number }

interface Stroke {
  id: string
  tool: DrawTool
  color: string
  size: number
  points: Point[]
}

interface ImageItem {
  id: string
  src: string
  x: number
  y: number
  w: number
  h: number
}

const COLORS = ["#f97316", "#ef4444", "#a78bfa", "#10b981", "#facc15", "#fff", "#60a5fa", "#f472b6"]

export default function Whiteboard() {
  const { tool, brushColor, setBrushColor, brushSize, setBrushSize } = useStore()
  const isActive = tool === "draw"
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawTool, setDrawTool] = useState<DrawTool>("pen")
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [current, setCurrent] = useState<Stroke | null>(null)
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [resizing, setResizing] = useState<{ id: string; ox: number; oy: number; ow: number; oh: number } | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const isDrawing = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { redraw() }, [strokes, images, selectedImage])

  function redraw(preview?: Stroke) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    images.forEach(img => drawImage(ctx, img))
    const all = preview ? [...strokes, preview] : strokes
    all.forEach(s => drawStroke(ctx, s))
  }

  function drawImage(ctx: CanvasRenderingContext2D, img: ImageItem) {
    const el = new window.Image()
    el.src = img.src
    ctx.drawImage(el, img.x, img.y, img.w, img.h)
    if (selectedImage === img.id) {
      ctx.strokeStyle = "var(--accent-light)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 3])
      ctx.strokeRect(img.x, img.y, img.w, img.h)
      ctx.setLineDash([])
      ctx.fillStyle = "var(--accent)"
      ctx.fillRect(img.x + img.w - 6, img.y + img.h - 6, 10, 10)
    }
  }

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 1) return
    ctx.strokeStyle = stroke.tool === "eraser" ? "#0d0d1a" : stroke.color
    ctx.lineWidth = stroke.tool === "eraser" ? stroke.size * 4 : stroke.size
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    if (stroke.tool === "pen" || stroke.tool === "eraser") {
      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      stroke.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y))
      ctx.stroke()
    } else if (stroke.tool === "line" && stroke.points.length >= 2) {
      const a = stroke.points[0], b = stroke.points[stroke.points.length - 1]
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
    } else if (stroke.tool === "rect" && stroke.points.length >= 2) {
      const a = stroke.points[0], b = stroke.points[stroke.points.length - 1]
      ctx.beginPath(); ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y)
    } else if (stroke.tool === "circle" && stroke.points.length >= 2) {
      const a = stroke.points[0], b = stroke.points[stroke.points.length - 1]
      const rx = Math.abs(b.x - a.x) / 2, ry = Math.abs(b.y - a.y) / 2
      const cx = a.x + (b.x - a.x) / 2, cy = a.y + (b.y - a.y) / 2
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke()
    }
  }

  function getPos(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function hitImage(pos: Point): ImageItem | null {
    return [...images].reverse().find(img =>
      pos.x >= img.x && pos.x <= img.x + img.w &&
      pos.y >= img.y && pos.y <= img.y + img.h
    ) || null
  }

  function hitResizeHandle(pos: Point, img: ImageItem): boolean {
    return pos.x >= img.x + img.w - 8 && pos.x <= img.x + img.w + 4 &&
      pos.y >= img.y + img.h - 8 && pos.y <= img.y + img.h + 4
  }

  function onDown(e: React.MouseEvent | React.TouchEvent) {
    const pos = getPos(e)

    if (drawTool === "select") {
      const sel = selectedImage ? images.find(i => i.id === selectedImage) : null
      if (sel && hitResizeHandle(pos, sel)) {
        setResizing({ id: sel.id, ox: pos.x, oy: pos.y, ow: sel.w, oh: sel.h })
        return
      }
      const hit = hitImage(pos)
      if (hit) {
        setSelectedImage(hit.id)
        setDragging({ id: hit.id, ox: pos.x - hit.x, oy: pos.y - hit.y })
        return
      }
      setSelectedImage(null)
      return
    }

    isDrawing.current = true
    setCurrent({ id: crypto.randomUUID(), tool: drawTool, color: brushColor, size: brushSize, points: [pos] })
  }

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    const pos = getPos(e)

    if (resizing) {
      const dx = pos.x - resizing.ox
      const dy = pos.y - resizing.oy
      setImages(prev => prev.map(img => img.id === resizing.id
        ? { ...img, w: Math.max(30, resizing.ow + dx), h: Math.max(30, resizing.oh + dy) }
        : img
      ))
      return
    }

    if (dragging) {
      setImages(prev => prev.map(img => img.id === dragging.id
        ? { ...img, x: pos.x - dragging.ox, y: pos.y - dragging.oy }
        : img
      ))
      return
    }

    if (!isDrawing.current || !current) return
    const updated = { ...current, points: [...current.points, pos] }
    setCurrent(updated)
    redraw(updated)
  }

  function onUp() {
    if (resizing) { setResizing(null); return }
    if (dragging) { setDragging(null); return }
    if (!isDrawing.current || !current) return
    isDrawing.current = false
    setStrokes(prev => [...prev, current])
    setCurrent(null)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      const img = new window.Image()
      img.onload = () => {
        const maxW = 200
        const scale = Math.min(1, maxW / img.width)
        setImages(prev => [...prev, {
          id: crypto.randomUUID(),
          src,
          x: 80,
          y: 100,
          w: img.width * scale,
          h: img.height * scale,
        }])
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      const img = new window.Image()
      img.onload = () => {
        const maxW = 200
        const scale = Math.min(1, maxW / img.width)
        setImages(prev => [...prev, {
          id: crypto.randomUUID(),
          src,
          x: 80,
          y: 100,
          w: img.width * scale,
          h: img.height * scale,
        }])
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  if (!isActive) return null

  const toolButtons: { id: DrawTool; icon: React.ReactNode }[] = [
    { id: "pen", icon: <Pen size={12} /> },
    { id: "line", icon: <Minus size={12} /> },
    { id: "rect", icon: <Square size={12} /> },
    { id: "circle", icon: <Circle size={12} /> },
    { id: "eraser", icon: <Eraser size={12} /> },
  ]

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, zIndex: 16 }}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
    >
      {isDragOver && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(139,92,246,0.15)",
          border: "2px dashed var(--accent-light)",
          borderRadius: 12,
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}>
          <span style={{ color: "var(--accent-light)", fontSize: 13, fontWeight: 600 }}>Drop image</span>
        </div>
      )}

      <div style={{
        position: "absolute",
        top: 8,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        border: "0.5px solid var(--border)",
        borderRadius: 12,
        padding: "6px 10px",
      }}>
        <div style={{ display: "flex", gap: 3 }}>
          {toolButtons.map((t) => (
            <button
              key={t.id}
              onClick={() => setDrawTool(t.id)}
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: drawTool === t.id ? "var(--accent-dim)" : "transparent",
                border: `0.5px solid ${drawTool === t.id ? "var(--border-accent)" : "transparent"}`,
                color: drawTool === t.id ? "var(--accent-light)" : "var(--text-secondary)",
              }}
            >
              {t.icon}
            </button>
          ))}
        </div>

        <div style={{ width: 0.5, height: 16, background: "var(--border)" }} />

        <div style={{ display: "flex", gap: 3 }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setBrushColor(c)}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: c,
                border: brushColor === c ? "2px solid white" : "2px solid transparent",
                outline: brushColor === c ? "2px solid var(--accent)" : "none",
                outlineOffset: 1,
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        <div style={{ width: 0.5, height: 16, background: "var(--border)" }} />

        <input
          type="range"
          min={1}
          max={12}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{ width: 50 }}
        />
      </div>

      <div style={{
        position: "absolute",
        bottom: 52,
        right: 8,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        <button
          onClick={() => setDrawTool("select")}
          title="Select / move images"
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: drawTool === "select" ? "var(--accent-dim)" : "rgba(0,0,0,0.7)",
            border: `0.5px solid ${drawTool === "select" ? "var(--border-accent)" : "var(--border)"}`,
            color: drawTool === "select" ? "var(--accent-light)" : "var(--text-secondary)",
            backdropFilter: "blur(4px)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M1 1l3 9 2-3 3 3 1-1-3-3 3-2z" />
          </svg>
        </button>

        <label
          title="Add image"
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            border: "0.5px solid var(--border)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
          }}
        >
          <Image size={12} />
          <input type="file" accept="image/*" onChange={onFileInput} style={{ display: "none" }} />
        </label>

        {selectedImage && (
          <button
            title="Delete image"
            onClick={() => { setImages(prev => prev.filter(i => i.id !== selectedImage)); setSelectedImage(null) }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--red-dim)",
              border: "0.5px solid rgba(239,68,68,0.3)",
              color: "var(--red)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Trash2 size={12} />
          </button>
        )}

        <button
          title="Clear all"
          onClick={() => { setStrokes([]); setImages([]); setSelectedImage(null) }}
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            border: "0.5px solid var(--border)",
            color: "var(--text-muted)",
            fontSize: 8,
            backdropFilter: "blur(4px)",
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={360}
        height={640}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
        style={{
          position: "absolute",
          inset: 0,
          cursor: drawTool === "select"
            ? dragging ? "grabbing" : "grab"
            : drawTool === "eraser" ? "cell" : "crosshair",
          touchAction: "none",
        }}
      />
    </div>
  )
}