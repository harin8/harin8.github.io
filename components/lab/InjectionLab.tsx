"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  classify,
  PRESET_ATTACKS,
  type Decision,
  type Hit,
} from "@/lib/guardrails";

const METER_CELLS = 14;
const SCAN_MS = 450;

const DECISION_STYLE: Record<
  Decision,
  { label: string; badge: string; bar: string; text: string }
> = {
  blocked: {
    label: "BLOCKED",
    badge: "border-alert/60 text-alert bg-alert/10",
    bar: "bg-alert",
    text: "text-alert",
  },
  flagged: {
    label: "FLAGGED",
    badge: "border-warn/60 text-warn bg-warn/10",
    bar: "bg-warn",
    text: "text-warn",
  },
  allowed: {
    label: "ALLOWED",
    badge: "border-accent/60 text-accent bg-accent/10",
    bar: "bg-accent",
    text: "text-accent",
  },
};

interface Segment {
  text: string;
  hot: boolean;
  block?: boolean;
}

/** Merge overlapping hit spans into highlight segments over the raw input. */
function segment(text: string, hits: Hit[]): Segment[] {
  if (hits.length === 0) return [{ text, hot: false }];
  const ranges = hits
    .map((h) => ({
      start: h.index,
      end: h.index + h.match.length,
      block: h.severity === "block",
    }))
    .sort((a, b) => a.start - b.start);

  const merged: typeof ranges = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
      last.block = last.block || r.block;
    } else {
      merged.push({ ...r });
    }
  }

  const segs: Segment[] = [];
  let cursor = 0;
  for (const m of merged) {
    if (m.start > cursor) segs.push({ text: text.slice(cursor, m.start), hot: false });
    segs.push({ text: text.slice(m.start, m.end), hot: true, block: m.block });
    cursor = m.end;
  }
  if (cursor < text.length) segs.push({ text: text.slice(cursor), hot: false });
  return segs;
}

export function InjectionLab() {
  const [input, setInput] = useState("");
  const [scanned, setScanned] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  // Inspector reflects the last *scanned* payload, not live keystrokes — so the
  // SCAN button has a real, visible job.
  const verdict = useMemo(() => classify(scanned), [scanned]);
  const style = DECISION_STYLE[verdict.decision];
  const segs = useMemo(() => segment(scanned, verdict.hits), [scanned, verdict.hits]);

  const triggered = useMemo(() => {
    const seen = new Set<string>();
    return verdict.hits.filter((h) => {
      if (seen.has(h.ruleId)) return false;
      seen.add(h.ruleId);
      return true;
    });
  }, [verdict.hits]);

  const hasResult = scanned.trim().length > 0;
  const dirty = input.trim().length > 0 && input !== scanned;

  const filled = Math.round((verdict.score / 100) * METER_CELLS);
  const meter = "▮".repeat(filled) + "░".repeat(METER_CELLS - filled);

  const runScan = useCallback((text: string) => {
    if (!text.trim()) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const commit = () => {
      setScanned(text);
      setAttempts((a) => a + 1);
      if (classify(text).decision === "blocked") setBlocked((b) => b + 1);
      setAnalyzing(false);
      timerRef.current = null;
    };

    setAnalyzing(true);
    if (reduce) {
      commit();
    } else {
      timerRef.current = window.setTimeout(commit, SCAN_MS);
    }
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter scans; Shift+Enter inserts a newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runScan(input);
    }
  }

  // Badge reflects scanning → result → idle.
  const badgeLabel = analyzing ? "SCANNING" : hasResult ? style.label : "IDLE";
  const badgeClass = analyzing
    ? "border-ai/60 text-ai bg-ai/10"
    : hasResult
      ? style.badge
      : "border-haze/40 text-haze";

  return (
    <div className="workbench-panel p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        {/* Attack composer */}
        <div className="flex flex-col">
          <label htmlFor="injection-input" className="hud-label text-ai mb-2 block">
            › your attack
          </label>
          <textarea
            id="injection-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={600}
            rows={4}
            placeholder="type an attack and press scan (or enter) — or pick a probe below…"
            aria-label="Prompt-injection attempt"
            className="w-full bg-bg/60 border border-haze/30 rounded-sm px-3 py-2 font-mono text-sm text-ink placeholder:text-haze resize-none outline-none focus-visible:ring-1 focus-visible:ring-ai focus-visible:border-ai"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {PRESET_ATTACKS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setInput(p.text);
                  runScan(p.text);
                }}
                className="tap-target font-mono text-xs px-2.5 py-1.5 border border-haze/30 text-ink/75 rounded-sm hover:border-ai/60 hover:text-ai transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ai"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => runScan(input)}
              disabled={analyzing || !input.trim()}
              className="tap-target inline-flex items-center gap-1.5 px-4 py-2 border border-ai/50 text-ai hover:bg-ai hover:text-bg transition-colors font-mono text-xs uppercase tracking-wider rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ai disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ai disabled:cursor-not-allowed"
            >
              {analyzing ? "▮▮ scanning" : "▶ scan"}
            </button>
            <span className="hud-label text-haze">
              attempts {String(attempts).padStart(2, "0")} · blocked{" "}
              <span className="text-alert">{String(blocked).padStart(2, "0")}</span>
            </span>
          </div>
        </div>

        {/* Request inspector */}
        <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-haze/15 pt-5 lg:pt-0 lg:pl-6">
          <div className="flex items-center justify-between mb-1">
            <span className="hud-label text-haze">› request inspector</span>
            <span
              className={`font-mono text-xs px-2 py-1 border rounded-sm ${badgeClass} ${
                analyzing ? "animate-pulse" : ""
              }`}
            >
              {badgeLabel}
            </span>
          </div>
          <div className="h-4 mb-2">
            {dirty && !analyzing && (
              <span className="hud-label text-warn">
                input changed — press scan to re-classify
              </span>
            )}
          </div>

          {/* Risk meter */}
          <div className="flex items-center gap-3 mb-4">
            <span className="hud-label text-haze">risk</span>
            {!analyzing && hasResult && (
              <span
                className={`font-mono text-xs ${style.text} hidden xs:inline select-none`}
                aria-hidden
              >
                {meter}
              </span>
            )}
            <div className="flex-1 h-px bg-haze/20 relative overflow-hidden">
              {analyzing ? (
                <div
                  className="ai-scan absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-ai to-transparent"
                  aria-hidden
                />
              ) : (
                <div
                  className={`h-full transition-[width] duration-150 ${
                    hasResult ? style.bar : "bg-transparent"
                  }`}
                  style={{ width: `${hasResult ? verdict.score : 0}%` }}
                />
              )}
            </div>
            <span className={`hud-label ${analyzing ? "text-ai" : style.text}`}>
              {analyzing ? "···" : hasResult ? String(verdict.score).padStart(3, "0") : "000"}
            </span>
          </div>

          {/* Payload echo */}
          {analyzing ? (
            <p className="font-mono text-sm text-ai/90 bg-bg/50 border border-ai/15 rounded-sm px-3 py-2 mb-4">
              <span className="text-haze select-none">›</span> analyzing payload
              <span className="cursor-block" aria-hidden />
            </p>
          ) : hasResult ? (
            <p className="font-mono text-sm leading-relaxed bg-bg/50 border border-haze/15 rounded-sm px-3 py-2 mb-4 whitespace-pre-wrap break-words">
              {segs.map((s, i) =>
                s.hot ? (
                  <mark
                    key={i}
                    className={`bg-transparent ${
                      s.block ? "text-alert" : "text-warn"
                    } underline decoration-dotted underline-offset-2`}
                  >
                    {s.text}
                  </mark>
                ) : (
                  <span key={i} className="text-ink/70">
                    {s.text}
                  </span>
                ),
              )}
            </p>
          ) : (
            <p className="font-mono text-sm text-haze mb-4">
              no scan yet. type an attack or pick a probe, then press scan.
            </p>
          )}

          {/* Triggered rules */}
          {!analyzing && triggered.length > 0 && (
            <ul className="flex flex-col gap-2.5">
              {triggered.map((h) => (
                <li key={h.ruleId} className="flex gap-3">
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 border rounded-sm shrink-0 h-fit ${
                      h.severity === "block"
                        ? "border-alert/50 text-alert"
                        : "border-warn/50 text-warn"
                    }`}
                  >
                    {h.owasp}
                  </span>
                  <div>
                    <span className="font-mono text-sm text-ink">{h.label}</span>
                    <span className="font-mono text-xs text-ink/55"> — {h.why}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!analyzing && hasResult && triggered.length === 0 && (
            <p className="font-mono text-sm text-accent/90">
              clean — passed the pre-filter. but heuristics aren&apos;t a
              guarantee; real defense is layered.
            </p>
          )}
        </div>
      </div>

      <p className="mt-5 pt-4 border-t border-haze/15 font-mono text-xs text-haze leading-relaxed">
        this is a client-side heuristic filter — the first layer in front of an
        LLM, mapped to the{" "}
        <a
          href="https://owasp.org/www-project-top-10-for-large-language-model-applications/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ai/80 hover:text-ai underline underline-offset-2"
        >
          OWASP LLM Top 10
        </a>
        . a determined prompt can still slip past pattern-matching — which is the
        point: ground the model, check the output, and never trust input.
      </p>
    </div>
  );
}
