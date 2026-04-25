import { useEffect, useRef } from "react"
import { Canvas, PencilBrush } from "fabric"
import { useStore } from "@/store"

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const { tool, showWhiteboard, brushColor, brushSize } = useStore()
  const isDrawing = tool === "draw"

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new Canvas(canvasRef.current, {
      width: 360,
      height: 640,
      backgroundColor: "transparent",
      isDrawingMode: false,
    })

    const brush = new PencilBrush(canvas)
    brush.color = brushColor
    brush.width = brushSize
    canvas.freeDrawingBrush = brush
    fabricRef.current = canvas

    return () => { canvas.dispose() }
  }, [])

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.isDrawingMode = isDrawing
  }, [isDrawing])

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !canvas.freeDrawingBrush) return
    canvas.freeDrawingBrush.color = brushColor
    canvas.freeDrawingBrush.width = brushSize
  }, [brushColor, brushSize])

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      zIndex: 15,
      pointerEvents: isDrawing ? "all" : "none",
      opacity: showWhiteboard ? 1 : 0,
    }}>
      <canvas ref={canvasRef} />
    </div>
  )
}