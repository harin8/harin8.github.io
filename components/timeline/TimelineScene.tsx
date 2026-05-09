"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TIMELINE } from "@/content/timeline";
import { TimelineNode } from "./TimelineNode";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function TimelineScene() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeYear, setActiveYear] = useState(TIMELINE[0].year);
  const [progress, setProgress] = useState(0);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const isSmall = window.matchMedia("(max-width: 767px)").matches;
    // GSAP pin/scrub fights mobile touch scroll (rubber-band, momentum,
    // address-bar resize). Reuse the reduced-motion stack on phones.
    // Tablets (>=768px) keep the cinematic experience.
    const useFallback = reduce || (isCoarse && isSmall);

    if (useFallback) {
      setFallback(true);
      const nodes = stage.querySelectorAll<HTMLElement>("[data-timeline-node]");
      nodes.forEach((node) => {
        node.style.opacity = "1";
        node.style.position = "relative";
        node.style.transform = "none";
        node.style.filter = "none";
      });
      stage.style.height = "auto";
      stage.style.display = "flex";
      stage.style.flexDirection = "column";
      stage.style.gap = "6rem";
      section.style.height = "auto";
      section.style.overflow = "visible";
      return;
    }

    const nodes = stage.querySelectorAll<HTMLElement>("[data-timeline-node]");
    const count = nodes.length;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // Each event gets ~120vh of scroll runway
          end: () => `+=${count * 120}%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            setProgress(self.progress);
            const idx = Math.min(
              count - 1,
              Math.max(0, Math.floor(self.progress * count)),
            );
            setActiveYear(TIMELINE[idx]?.year ?? TIMELINE[0].year);
          },
        },
      });

      // Each node gets a slot. Fade-in (z approach), hold, fade-out (z past camera).
      const slot = 1 / count;
      nodes.forEach((node, i) => {
        const start = i * slot;
        const enterEnd = start + slot * 0.3;
        const holdEnd = start + slot * 0.7;
        const exitEnd = start + slot;

        gsap.set(node, {
          opacity: 0,
          scale: 0.55,
          filter: "blur(14px)",
          rotateY: 8,
          y: 40,
          z: -300,
        });

        tl.to(
          node,
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            rotateY: 0,
            y: 0,
            z: 0,
            ease: "power2.out",
            duration: enterEnd - start,
          },
          start,
        )
          .to(
            node,
            {
              opacity: 1,
              ease: "none",
              duration: holdEnd - enterEnd,
            },
            enterEnd,
          )
          .to(
            node,
            {
              opacity: 0,
              scale: 1.4,
              filter: "blur(10px)",
              rotateY: -6,
              y: -40,
              z: 200,
              ease: "power2.in",
              duration: exitEnd - holdEnd,
            },
            holdEnd,
          );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full overflow-hidden ${fallback ? "" : "h-[100dvh]"}`}
      style={{ perspective: fallback ? undefined : "1200px" }}
    >
      {/* Perspective grid floor */}
      {!fallback && (
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, color-mix(in srgb, var(--color-accent) 30%, transparent) 1px, transparent 1px),
                linear-gradient(to bottom, color-mix(in srgb, var(--color-accent) 30%, transparent) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
              transform:
                "perspective(800px) rotateX(60deg) translateY(40%) scale(2)",
              transformOrigin: "center bottom",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)",
            }}
          />
        </div>
      )}

      {/* HUD: year counter (pin-only) */}
      {!fallback && (
        <div className="absolute top-24 left-6 sm:left-10 z-20 hud-label flex flex-col gap-1 safe-left">
          <span className="text-haze">› current</span>
          <span className="font-mono text-3xl text-accent tracking-tight">
            {activeYear}
          </span>
        </div>
      )}

      {/* HUD: progress (pin-only) */}
      {!fallback && (
        <div className="absolute bottom-10 left-6 right-6 sm:left-10 sm:right-10 z-20 safe-bottom">
          <div className="flex items-center justify-between hud-label mb-2">
            <span>› timeline</span>
            <span className="text-accent">
              {Math.round(progress * 100).toString().padStart(3, "0")}%
            </span>
          </div>
          <div className="h-px bg-haze/30 w-full">
            <div
              className="h-full bg-accent transition-[width]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 hud-label opacity-60">
            {TIMELINE.map((e, i) => (
              <span key={i}>{e.year}</span>
            ))}
          </div>
        </div>
      )}

      {/* Stage with overlapping nodes */}
      <div
        ref={stageRef}
        className="relative h-full w-full"
        style={{ transformStyle: fallback ? undefined : "preserve-3d" }}
      >
        {TIMELINE.map((event, i) => (
          <TimelineNode key={i} event={event} index={i} />
        ))}
      </div>
    </section>
  );
}
