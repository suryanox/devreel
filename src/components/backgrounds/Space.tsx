"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
}

export default function Space() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const NUM_STARS = 260;
    const SPEED = 2.5;
    const cx = W / 2;
    const cy = H / 2;

    // Init stars
    starsRef.current = Array.from({ length: NUM_STARS }, () => ({
      x: (Math.random() - 0.5) * W,
      y: (Math.random() - 0.5) * H,
      z: Math.random() * W,
      pz: 0,
    }));

    const draw = () => {
      // Fade trail
      ctx.fillStyle = "rgba(2, 6, 23, 0.25)";
      ctx.fillRect(0, 0, W, H);

      starsRef.current.forEach((star) => {
        star.pz = star.z;
        star.z -= SPEED;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * W;
          star.y = (Math.random() - 0.5) * H;
          star.z = W;
          star.pz = W;
        }

        const sx = (star.x / star.z) * W + cx;
        const sy = (star.y / star.z) * H + cy;
        const px = (star.x / star.pz) * W + cx;
        const py = (star.y / star.pz) * H + cy;

        const size = Math.max(0.3, (1 - star.z / W) * 2.5);
        const brightness = Math.floor((1 - star.z / W) * 255);
        const alpha = (1 - star.z / W) * 0.9 + 0.1;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${Math.min(255, brightness + 40)}, ${alpha})`;
        ctx.lineWidth = size;
        ctx.stroke();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    // Clear canvas first
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, W, H);

    // Draw static nebula blobs
    const drawNebula = (x: number, y: number, r: number, color: string) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawNebula(W * 0.2, H * 0.3, 140, "rgba(99, 40, 180, 0.18)");
    drawNebula(W * 0.8, H * 0.6, 110, "rgba(30, 80, 200, 0.14)");
    drawNebula(W * 0.5, H * 0.8, 90, "rgba(180, 40, 100, 0.10)");

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="space-bg">
      <canvas ref={canvasRef} className="space-canvas" />
    </div>
  );
}