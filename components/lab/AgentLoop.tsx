"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WORKFLOW } from "@/content/ai";

const TICK_MS = 26;
const HOLD_TICKS = 16;
const METER_CELLS = 14;

/**
 * An interactive "agent run" through Harin's AI workflow. Auto-plays a
 * typewriter pass over each stage's log, then advances. Clicking a stage pins
 * it for inspection. Respects prefers-reduced-motion (no auto-advance).
 */
export function AgentLoop() {
  const n = WORKFLOW.length;
  const [active, setActive] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [reduced, setReduced] = useState(false);
  const activeRef = useRef(0);
  const holdRef = useRef(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // First paint: reduced-motion users get the whole thing static.
  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (r) {
      setReduced(true);
      setCharCount(WORKFLOW[0].log.length);
      return;
    }
    setRunning(true);
  }, []);

  // The run loop.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const log = WORKFLOW[activeRef.current].log;
      setCharCount((c) => {
        if (c < log.length) return c + 1;
        holdRef.current += 1;
        if (holdRef.current >= HOLD_TICKS) {
          holdRef.current = 0;
          if (activeRef.current < n - 1) {
            activeRef.current += 1;
            setActive(activeRef.current);
            return 0;
          }
          setRunning(false);
        }
        return c;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, n]);

  const run = useCallback(() => {
    holdRef.current = 0;
    activeRef.current = 0;
    setActive(0);
    setCharCount(0);
    setRunning(true);
  }, []);

  const select = useCallback((i: number) => {
    setRunning(false);
    holdRef.current = 0;
    activeRef.current = i;
    setActive(i);
    setCharCount(WORKFLOW[i].log.length);
  }, []);

  const stage = WORKFLOW[active];
  const typed = stage.log.slice(0, charCount);
  const typing = running && charCount < stage.log.length;
  const progress =
    ((active + charCount / Math.max(1, stage.log.length)) / n) * 100;
  const pct = Math.round(progress);
  const filled = Math.round((pct / 100) * METER_CELLS);
  const meter = "▮".repeat(filled) + "░".repeat(METER_CELLS - filled);

  return (
    <div className="workbench-panel p-4 sm:p-6">
      {/* Run header + progress meter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 hud-label">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              running ? "bg-ai animate-pulse" : "bg-ai/60"
            }`}
            aria-hidden
          />
          <span className="text-ai">agent.run()</span>
          <span className="text-haze hidden sm:inline">
            {running ? "executing" : "idle"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="font-mono text-xs text-ai/80 tracking-tight select-none hidden xs:inline"
            aria-hidden
          >
            {meter}
          </span>
          <span className="hud-label text-ai">
            {pct.toString().padStart(3, "0")}%
          </span>
          {!reduced && (
            <button
              type="button"
              onClick={run}
              className="tap-target inline-flex items-center gap-1.5 px-3 py-1.5 border border-ai/40 text-ai hover:bg-ai hover:text-bg transition-colors font-mono text-xs uppercase tracking-wider rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ai"
            >
              {running ? "▮▮ running" : "▶ run"}
            </button>
          )}
        </div>
      </div>

      {/* Thin progress track with a moving sweep while running */}
      <div className="relative h-px w-full bg-haze/20 overflow-hidden mb-6">
        <div
          className="h-full bg-ai transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
        {running && (
          <div
            className="ai-scan absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-ai to-transparent opacity-60"
            aria-hidden
          />
        )}
      </div>

      {/* Pipeline of stages */}
      <ol className="flex flex-wrap items-stretch gap-x-1 gap-y-3">
        {WORKFLOW.map((s, i) => {
          const isActive = i === active;
          const isDone = i < active || (!running && i <= active);
          return (
            <li key={s.id} className="flex items-center">
              <button
                type="button"
                onClick={() => select(i)}
                aria-current={isActive ? "step" : undefined}
                className={`tap-target group flex flex-col items-start gap-1 px-3 py-2 border rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ai ${
                  isActive
                    ? "border-ai bg-ai/10 text-ai"
                    : isDone
                      ? "border-ai/30 text-ai/70 hover:border-ai/60"
                      : "border-haze/25 text-haze hover:border-ai/50 hover:text-ink"
                } ${isActive && running ? "ai-pulse" : ""}`}
              >
                <span className="hud-label leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-xs tracking-wide">{s.id}</span>
              </button>
              {i < n - 1 && (
                <span
                  className={`px-1 select-none ${
                    i < active ? "text-ai/60" : "text-haze/40"
                  }`}
                  aria-hidden
                >
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Active-stage inspector */}
      <div className="mt-6 pt-5 border-t border-haze/15">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="hud-label text-ai">
            stage {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <h3 className="font-mono text-base sm:text-lg text-ink">{stage.title}</h3>
        </div>

        <p className="font-mono text-sm text-ink/75 leading-relaxed max-w-2xl">
          {stage.detail}
        </p>

        {/* Streaming log line */}
        <div className="mt-4 font-mono text-xs sm:text-sm text-ai/90 bg-bg/60 border border-ai/15 rounded-sm px-3 py-2 min-h-9 flex items-center">
          <span className="text-haze mr-2 select-none">›</span>
          <span className="whitespace-pre-wrap break-words">
            {typed}
            {typing && <span className="cursor-block" aria-hidden />}
          </span>
        </div>

        {/* Tools used at this stage */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="hud-label text-haze mr-1">tools</span>
          {stage.tools.map((t) => (
            <span
              key={t}
              className="font-mono text-xs px-2 py-1 border border-ai/25 text-ai/85 rounded-sm"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
