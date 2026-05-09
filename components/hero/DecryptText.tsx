"use client";

import { useEffect, useRef, useState } from "react";

const SHUFFLE = "!@#$%^&*()_+-=[]{}<>?/\\|0123456789ABCDEF";

interface Props {
  text: string;
  className?: string;
  delay?: number;
  /** Per-character resolve duration in ms. */
  duration?: number;
  /** Stagger between characters in ms. */
  stagger?: number;
}

/**
 * Each character cycles through random glyphs, then locks to its real letter.
 * Inspired by classic decryption-text effects but built without a runtime lib.
 */
export function DecryptText({
  text,
  className,
  delay = 0,
  duration = 600,
  stagger = 35,
}: Props) {
  const [output, setOutput] = useState(() =>
    text.split("").map(() => SHUFFLE[0]),
  );
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;
    const start = performance.now() + delay;
    const chars = text.split("");
    let rafId = 0;

    const tick = (now: number) => {
      if (finishedRef.current) return;
      const elapsed = now - start;
      let allDone = true;

      const next = chars.map((target, i) => {
        const charStart = i * stagger;
        const charEnd = charStart + duration;
        if (target === " ") return " ";
        if (elapsed < charStart) {
          allDone = false;
          return SHUFFLE[Math.floor(Math.random() * SHUFFLE.length)];
        }
        if (elapsed >= charEnd) return target;
        allDone = false;
        return SHUFFLE[Math.floor(Math.random() * SHUFFLE.length)];
      });

      setOutput(next);

      if (allDone) {
        finishedRef.current = true;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      finishedRef.current = true;
      cancelAnimationFrame(rafId);
    };
  }, [text, delay, duration, stagger]);

  return (
    <span className={className} aria-label={text}>
      {output.join("")}
    </span>
  );
}
