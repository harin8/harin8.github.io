"use client";

import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";
interface Msg {
  role: Role;
  content: string;
}

const SUGGESTIONS = [
  "tell me about your security work",
  "why product management?",
  "what was your hardest bug",
  "what are you reading lately",
];

const SPINNER = ["|", "/", "-", "\\"];

export function Terminal() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Spinner animation while waiting for first token
  useEffect(() => {
    if (!streaming) return;
    const id = setInterval(() => {
      setSpinnerFrame((f) => (f + 1) % SPINNER.length);
    }, 90);
    return () => clearInterval(id);
  }, [streaming]);

  // Focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function send(promptText: string) {
    if (!promptText.trim() || streaming) return;

    const next: Msg[] = [
      ...messages,
      { role: "user", content: promptText.trim() },
    ];
    setMessages(next);
    setInput("");
    setShowSuggestions(false);
    setStreaming(true);

    // Append empty assistant message that we'll fill as tokens arrive
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const msg =
          errBody?.message ||
          (res.status === 429
            ? "rate-limited. try again shortly."
            : "operator unreachable. try again.");
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: `[error] ${msg}` };
          return copy;
        });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("no response stream");
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = {
            role: "assistant",
            content: last.content + chunk,
          };
          return copy;
        });
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "[error] connection dropped.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-bg-elev border border-haze/30 rounded-sm">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-haze/20 bg-bg/50">
        <div className="flex items-center gap-3 hud-label">
          <span className="flex gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-alert/70" />
            <span className="inline-block w-2 h-2 rounded-full bg-haze/60" />
            <span className="inline-block w-2 h-2 rounded-full bg-accent/80" />
          </span>
          <span>operator@harin:~$</span>
        </div>
        <div className="flex items-center gap-3 hud-label">
          <span className="text-haze">session #a3f9</span>
          <span className="text-accent">gemini · 2.5 flash</span>
        </div>
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="px-4 sm:px-5 py-5 sm:py-6 h-[60dvh] overflow-y-auto overscroll-contain font-mono text-sm leading-relaxed"
      >
        {messages.length === 0 && (
          <div className="text-haze">
            <p>
              <span className="text-accent">›</span> connection established.
              ready.
            </p>
            <p className="mt-2">
              ask anything about harin&apos;s career, security work, or the
              pivot to product. type below and press{" "}
              <kbd className="px-1 border border-haze/40 text-ink">enter</kbd>.
            </p>
          </div>
        )}

        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          const showSpinner =
            isLast &&
            streaming &&
            m.role === "assistant" &&
            m.content.length === 0;
          return (
            <div key={i} className="mb-5">
              {m.role === "user" ? (
                <div>
                  <span className="text-accent">harin@you ›</span>{" "}
                  <span className="text-ink">{m.content}</span>
                </div>
              ) : (
                <div>
                  <span className="text-accent">operator ›</span>{" "}
                  {showSpinner ? (
                    <span className="text-haze">
                      thinking {SPINNER[spinnerFrame]}
                    </span>
                  ) : (
                    <span className="text-ink/90 whitespace-pre-wrap">
                      {m.content}
                      {isLast && streaming && m.content.length > 0 && (
                        <span className="cursor-block" aria-hidden />
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {showSuggestions && messages.length === 0 && (
          <div className="mt-6">
            <p className="hud-label text-haze mb-3">› suggested queries</p>
            <ul className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => send(s)}
                    className="tap-target w-full text-left text-haze hover:text-accent transition-colors py-2 px-3 -mx-3 border border-transparent hover:border-accent/30 rounded-sm"
                  >
                    <span className="text-accent">›</span> {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Input row */}
      <div className="border-t border-haze/20 px-4 py-3 flex items-start gap-3">
        <span className="font-mono text-accent text-sm pt-1.5 select-none">›</span>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="ask anything about my career, learning, or security work..."
          rows={1}
          disabled={streaming}
          className="flex-1 bg-transparent resize-none outline-none font-mono text-sm text-ink placeholder:text-haze/60 disabled:opacity-50"
        />
        {!streaming && (
          <button
            type="button"
            onClick={() => send(input)}
            aria-label="Send"
            className="sm:hidden tap-target inline-flex items-center justify-center text-accent text-lg shrink-0"
          >
            ↵
          </button>
        )}
        <span className="hud-label hidden sm:block pt-1">
          {streaming ? (
            <span className="text-accent">streaming</span>
          ) : (
            "enter ↵"
          )}
        </span>
        {streaming && (
          <span className="sm:hidden hud-label text-accent pt-1">streaming</span>
        )}
      </div>
    </div>
  );
}
