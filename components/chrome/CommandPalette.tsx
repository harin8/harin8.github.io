"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TIMELINE } from "@/content/timeline";
import { WORKFLOW, STACK } from "@/content/ai";

type Mode = "menu" | "running" | "ask";

interface RunResult {
  id: number;
  command: string;
  output: string[];
  streaming?: boolean;
}

const STATIC_COMMANDS: Record<string, () => string[]> = {
  whoami: () => [
    "harin",
    "  uid: 1000  groups: engineers, security, builders",
    "  current: software engineer · security · ai",
    "  focus:   ai-forward engineering — ship with models, keep the engineering",
    "  status:  building",
  ],
  "skills --json": () => [
    "{",
    '  "ai":       ["agentic workflows", "claude code", "mcp", "evals", "rag"],',
    '  "code":     ["typescript", "python", "java", "react", "angular", "c"],',
    '  "security": ["appsec", "pentest", "threat modeling", "ctf"],',
    '  "cloud":    ["aws lambda", "fargate", "s3", "dynamodb", "guardduty"]',
    "}",
  ],
  workflow: () => [
    "ai workflow — intent in, shipped diff out:",
    ...WORKFLOW.map(
      (s, i) =>
        `  ${String(i + 1).padStart(2, "0")}  ${s.id.padEnd(8)} ${s.title}`,
    ),
    "run it interactively at /lab  ·  try: go lab",
  ],
  stack: () => [
    "the setup:",
    ...STACK.flatMap((g) => [
      `  [${g.group}]`,
      ...g.tools.map((t) => `    · ${t.name} — ${t.note}`),
    ]),
  ],
  "cv --download": () => [
    "[info] cv download not configured.",
    "       drop your CV at /public/cv.pdf and re-deploy to enable.",
  ],
  "contact --pgp": () => [
    "fingerprint: 4096R/AAAA BBBB CCCC DDDD EEEE",
    "(placeholder — replace with real fingerprint)",
  ],
  help: () => [
    "available commands:",
    "  whoami            — operator identity",
    "  workflow          — how i work with ai",
    "  stack             — my ai / dev toolset",
    "  inject            — open the prompt-injection lab",
    "  skills --json     — capability matrix",
    "  cv --download     — fetch resume",
    "  contact --pgp     — public key fingerprint",
    "  go <home|lab|timeline|chat>  — navigate",
    "  year <YYYY>       — jump to timeline event",
    '  ask "<question>"  — stream an answer about harin',
    "  help              — this message",
    "  clear             — clear console",
  ],
  clear: () => [],
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("menu");
  const [history, setHistory] = useState<RunResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const idRef = useRef(0);

  // Toggle on "/"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "/" && !inField && !open) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Cross-component opener (mobile nav button, home bottom prompt)
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("operator:palette-open", onOpen);
    return () => window.removeEventListener("operator:palette-open", onOpen);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setInput("");
    setMode("menu");
    previouslyFocusedRef.current?.focus();
  }, []);

  const pushResult = useCallback((command: string, output: string[]) => {
    idRef.current += 1;
    setHistory((h) => [...h, { id: idRef.current, command, output }]);
  }, []);

  const runAsk = useCallback(async (question: string) => {
    if (!question.trim()) return;
    idRef.current += 1;
    const id = idRef.current;
    setHistory((h) => [
      ...h,
      { id, command: `ask "${question}"`, output: ["streaming..."], streaming: true },
    ]);
    setMode("running");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: question }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg =
          err?.message ||
          (res.status === 429
            ? "rate-limited."
            : "operator unreachable.");
        setHistory((h) =>
          h.map((r) =>
            r.id === id ? { ...r, output: [`[error] ${msg}`], streaming: false } : r,
          ),
        );
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("no stream");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        setHistory((h) =>
          h.map((r) => (r.id === id ? { ...r, output: lines, streaming: true } : r)),
        );
      }

      setHistory((h) =>
        h.map((r) => (r.id === id ? { ...r, streaming: false } : r)),
      );
    } catch {
      setHistory((h) =>
        h.map((r) =>
          r.id === id
            ? { ...r, output: ["[error] connection dropped."], streaming: false }
            : r,
        ),
      );
    } finally {
      setMode("menu");
    }
  }, []);

  const handleCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;

      // ask "..."
      const askMatch = cmd.match(/^ask\s+["“](.+)["”]$/) ||
        cmd.match(/^ask\s+(.+)$/);
      if (askMatch) {
        runAsk(askMatch[1]);
        return;
      }

      // go <route>
      const goMatch = cmd.match(/^go\s+(home|lab|timeline|chat)$/);
      if (goMatch) {
        const target = goMatch[1] === "home" ? "/" : `/${goMatch[1]}`;
        router.push(target);
        pushResult(cmd, [`navigating → ${target}`]);
        setTimeout(close, 250);
        return;
      }

      // inject / demo — jump to the injection lab
      if (cmd === "inject" || cmd === "demo" || cmd === "playground") {
        router.push("/lab#playground");
        pushResult(cmd, ["opening injection lab → /lab#playground"]);
        setTimeout(close, 250);
        return;
      }

      // year <YYYY>
      const yearMatch = cmd.match(/^year\s+(.+)$/);
      if (yearMatch) {
        const target = yearMatch[1].trim();
        const idx = TIMELINE.findIndex((e) => e.year === target);
        if (idx >= 0) {
          router.push("/timeline");
          pushResult(cmd, [
            `→ found event ${idx + 1}: "${TIMELINE[idx].title}"`,
            "navigating to timeline...",
          ]);
          setTimeout(close, 400);
        } else {
          pushResult(cmd, [
            `[not found] no event tagged "${target}".`,
            `available years: ${TIMELINE.map((e) => e.year).join(", ")}`,
          ]);
        }
        return;
      }

      // clear
      if (cmd === "clear") {
        setHistory([]);
        return;
      }

      // static commands
      if (cmd in STATIC_COMMANDS) {
        pushResult(cmd, STATIC_COMMANDS[cmd]());
        return;
      }

      pushResult(cmd, [
        `[unknown] '${cmd}' — type 'help' for available commands.`,
      ]);
    },
    [runAsk, router, pushResult, close],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleCommand(input);
    setInput("");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4 bg-bg/80 backdrop-blur-sm safe-top"
      onClick={close}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recon-console-title"
        className="w-full max-w-2xl bg-bg-elev border border-accent/40 shadow-[0_0_60px_-10px_var(--color-accent)] rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-haze/20 bg-bg/50 hud-label">
          <span id="recon-console-title">› recon console</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close command palette"
            className="tap-target inline-flex items-center text-haze hover:text-accent transition-colors px-2 -mr-2"
          >
            <span className="hidden sm:inline">esc to close</span>
            <span className="sm:hidden text-base leading-none">×</span>
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="px-3 sm:px-4 py-3 max-h-[50dvh] sm:max-h-[40dvh] overflow-y-auto font-mono text-sm border-b border-haze/15">
            {history.map((r) => (
              <div key={r.id} className="mb-3">
                <div>
                  <span className="text-accent">›</span>{" "}
                  <span className="text-ink">{r.command}</span>
                </div>
                <div className="mt-1 text-ink/80 whitespace-pre-wrap">
                  {r.output.join("\n")}
                  {r.streaming && (
                    <span className="cursor-block" aria-hidden />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 px-3 sm:px-4 py-3 min-h-12"
        >
          <span className="text-accent font-mono">›</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={mode === "running"}
            placeholder="try: whoami · workflow · go lab"
            aria-label="Run a command"
            className="flex-1 bg-transparent outline-none font-mono text-sm text-ink placeholder:text-haze disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-accent focus-visible:rounded-sm"
          />
          {mode === "running" && (
            <span className="hud-label text-accent">running</span>
          )}
        </form>

        {/* Hint footer */}
        {history.length === 0 && (
          <div className="px-4 pb-4 hud-label text-haze">
            <span>type </span>
            <span className="text-accent">help</span>
            <span> for commands · </span>
            <span className="text-accent">/</span>
            <span> to toggle</span>
          </div>
        )}
      </div>
    </div>
  );
}
