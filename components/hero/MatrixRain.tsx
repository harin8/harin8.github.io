"use client";

import { useEffect, useRef } from "react";

const GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF{}[]<>/\\|=*+-_";

interface Drop {
  x: number;
  y: number;
  speed: number;
  trail: number;
}

export function MatrixRain({
  opacity = 0.55,
  fontSize = 16,
}: {
  opacity?: number;
  fontSize?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.matchMedia("(max-width: 640px)").matches;
    // Larger glyph -> fewer columns -> fewer iterations per frame.
    const effectiveFontSize = isSmall ? Math.max(fontSize, 22) : fontSize;
    // Cap to 30fps on phones to halve CPU/GPU load.
    const minInterval = isSmall ? 1000 / 30 : 0;

    let drops: Drop[] = [];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssWidth = 0;
    let cssHeight = 0;
    let columnCount = 0;

    const resize = () => {
      cssWidth = canvas.clientWidth;
      cssHeight = canvas.clientHeight;
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      columnCount = Math.ceil(cssWidth / effectiveFontSize);
      drops = Array.from({ length: columnCount }, (_, i) => ({
        x: i * effectiveFontSize,
        y: Math.random() * cssHeight,
        speed: 1 + Math.random() * 2.5,
        trail: 12 + Math.random() * 18,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    let lastDraw = 0;
    const draw = (t: number = 0) => {
      if (minInterval && t - lastDraw < minInterval) {
        if (!reduce) rafId = requestAnimationFrame(draw);
        return;
      }
      lastDraw = t;

      // Fade existing frame instead of clearing — produces the trailing tail
      ctx.fillStyle = "rgba(7, 9, 12, 0.08)";
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      ctx.font = `${effectiveFontSize}px var(--font-jetbrains, monospace)`;
      ctx.textBaseline = "top";

      for (const d of drops) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

        // Head (bright)
        ctx.fillStyle = `rgba(220, 255, 235, ${opacity})`;
        ctx.fillText(ch, d.x, d.y);

        // Trailing glow
        ctx.fillStyle = `rgba(0, 255, 156, ${opacity * 0.4})`;
        ctx.fillText(ch, d.x, d.y - effectiveFontSize);

        d.y += d.speed;
        if (d.y > cssHeight + d.trail * effectiveFontSize) {
          d.y = -effectiveFontSize * 2;
          d.speed = 1 + Math.random() * 2.5;
        }
      }

      if (!reduce) rafId = requestAnimationFrame(draw);
    };

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (!reduce) {
        rafId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    if (reduce) {
      // Single static frame for reduced-motion users
      ctx.fillStyle = "rgba(0, 255, 156, 0.05)";
      ctx.fillRect(0, 0, cssWidth, cssHeight);
    } else {
      rafId = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [opacity, fontSize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  );
}
