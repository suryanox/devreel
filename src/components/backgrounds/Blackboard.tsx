"use client";

import { useEffect, useRef } from "react";

export default function Blackboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const w = canvas.width;
    const h = canvas.height;

    // Base blackboard color
    ctx.fillStyle = "#1a2e1a";
    ctx.fillRect(0, 0, w, h);

    // Chalk dust texture — random light speckles
    for (let i = 0; i < 2400; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.2;
      const alpha = Math.random() * 0.07;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 220, 200, ${alpha})`;
      ctx.fill();
    }

    // Subtle vertical streaks (eraser marks)
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * w;
      const streakH = 40 + Math.random() * 120;
      const y = Math.random() * (h - streakH);
      const grad = ctx.createLinearGradient(x, y, x + 8, y + streakH);
      grad.addColorStop(0, "rgba(200,210,190,0)");
      grad.addColorStop(0.5, "rgba(200,210,190,0.04)");
      grad.addColorStop(1, "rgba(200,210,190,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, 8, streakH);
    }

    // Wooden frame — top
    const frameGrad = ctx.createLinearGradient(0, 0, 0, 18);
    frameGrad.addColorStop(0, "#7c5c2e");
    frameGrad.addColorStop(1, "#5a3e1b");
    ctx.fillStyle = frameGrad;
    ctx.fillRect(0, 0, w, 18);

    // Wooden frame — bottom
    const frameGradB = ctx.createLinearGradient(0, h - 18, 0, h);
    frameGradB.addColorStop(0, "#5a3e1b");
    frameGradB.addColorStop(1, "#7c5c2e");
    ctx.fillStyle = frameGradB;
    ctx.fillRect(0, h - 18, w, 18);

    // Wooden frame — left
    ctx.fillStyle = "#6b4f22";
    ctx.fillRect(0, 0, 14, h);

    // Wooden frame — right
    ctx.fillStyle = "#6b4f22";
    ctx.fillRect(w - 14, 0, 14, h);

    // Chalk tray at the bottom
    ctx.fillStyle = "#4a3010";
    ctx.fillRect(14, h - 28, w - 28, 10);

    // Chalk pieces in tray
    const chalkColors = ["#f0ece0", "#f5c0c0", "#c0d4f5", "#c0f5c8"];
    for (let i = 0; i < 4; i++) {
      const cx = 30 + i * 22;
      const cy = h - 22;
      ctx.fillStyle = chalkColors[i % chalkColors.length];
      ctx.beginPath();
      ctx.roundRect(cx, cy, 16, 7, 2);
      ctx.fill();
    }
  }, []);

  return (
    <div className="blackboard-bg">
      <canvas ref={canvasRef} className="blackboard-canvas" />
    </div>
  );
}