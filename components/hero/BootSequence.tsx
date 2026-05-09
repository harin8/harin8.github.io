"use client";

import { useEffect, useState } from "react";

const LINES = [
  "BIOS v3.14.159 — POST initialized",
  "checking memory ............ ok",
  "loading kernel module: identity ............ ok",
  "loading kernel module: curiosity ............ ok",
  "loading kernel module: paranoia ............ ok",
  "negotiating handshake with operator ........ ok",
  "decrypting payload [████████████████] 100%",
  "boot complete. opening console.",
];

interface Props {
  /** Called once the boot sequence completes. */
  onDone?: () => void;
}

export function BootSequence({ onDone }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisibleCount(LINES.length);
      setDone(true);
      onDone?.();
      return;
    }

    const interval = setInterval(() => {
      setVisibleCount((c) => {
        if (c + 1 >= LINES.length) {
          clearInterval(interval);
          // Linger a moment, then fade out
          setTimeout(() => {
            setDone(true);
            onDone?.();
          }, 300);
          return LINES.length;
        }
        return c + 1;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-start p-8 bg-bg pointer-events-none transition-opacity duration-700 ${
        done ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden={done}
    >
      <pre className="font-mono text-xs sm:text-sm leading-relaxed text-accent/90 whitespace-pre-wrap">
        {LINES.slice(0, visibleCount).map((line, i) => (
          <div key={i}>
            <span className="text-haze">[{(i + 1).toString().padStart(2, "0")}]</span>{" "}
            {line}
          </div>
        ))}
      </pre>
    </div>
  );
}
