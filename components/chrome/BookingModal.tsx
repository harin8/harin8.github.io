"use client";

import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? "";

export function BookingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("book:open", onOpen);
    return () => window.removeEventListener("book:open", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !CAL_LINK) return;
    fetch("/api/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "command-palette",
        referrer: document.referrer || undefined,
      }),
    }).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open || !CAL_LINK) return;
    let cancelled = false;
    getCalApi()
      .then((cal) => {
        if (cancelled) return;
        cal("ui", {
          theme: "dark",
          styles: { branding: { brandColor: "#00ff9c" } },
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4 bg-bg/80 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-3xl bg-bg-elev border border-accent/40 shadow-[0_0_60px_-10px_var(--color-accent)] rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-haze/20 bg-bg/50 hud-label">
          <span>› schedule a sync</span>
          <span className="text-haze">esc to close</span>
        </div>

        <div className="p-3 min-h-[70dvh]">
          {CAL_LINK ? (
            <Cal
              calLink={CAL_LINK}
              style={{ width: "100%", height: "70dvh", overflow: "scroll" }}
              config={{ layout: "month_view", theme: "dark" }}
            />
          ) : (
            <div className="font-mono text-sm text-ink/80 p-4">
              [info] booking offline. NEXT_PUBLIC_CAL_LINK is not set on the
              server.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
