"use client";

import type { TimelineEvent } from "@/content/timeline";

const TAG_COLORS: Record<TimelineEvent["tag"], string> = {
  ORIGIN: "text-haze",
  CYBER: "text-accent",
  CODE: "text-ink",
  PRODUCT: "text-alert",
  LIFE: "text-accent",
};

export function TimelineNode({
  event,
  index,
}: {
  event: TimelineEvent;
  index: number;
}) {
  return (
    <article
      data-timeline-node
      data-index={index}
      className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 will-change-transform"
    >
      <div className="max-w-2xl px-6">
        {/* Tag + index header */}
        <div className="flex items-center gap-4 mb-6 hud-label">
          <span className={TAG_COLORS[event.tag]}>[{event.tag}]</span>
          <span className="text-haze">
            event {String(index + 1).padStart(2, "0")} /{" "}
            <span className="text-accent">{event.year}</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-6 text-ink">
          {event.title}
        </h2>

        {/* Body */}
        <p className="font-mono text-base sm:text-lg leading-relaxed text-ink/75 max-w-xl">
          {event.body}
        </p>

        {/* Bottom rule */}
        <div className="mt-8 h-px w-24 bg-accent/60" aria-hidden />
      </div>
    </article>
  );
}
