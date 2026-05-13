"use client";

import { useState } from "react";
import Link from "next/link";
import { BootSequence } from "@/components/hero/BootSequence";
import { MatrixRain } from "@/components/hero/MatrixRain";
import { DecryptText } from "@/components/hero/DecryptText";

export default function Home() {
  const [bootDone, setBootDone] = useState(false);

  return (
    <>
      <BootSequence onDone={() => setBootDone(true)} />

      <section className="relative min-h-[100dvh] w-full overflow-hidden">
        {/* Matrix rain background */}
        <div className="absolute inset-0 opacity-25">
          <MatrixRain opacity={0.7} fontSize={16} />
        </div>

        {/* Foreground content */}
        <div
          className={`relative z-10 flex flex-col justify-between min-h-[100dvh] px-5 sm:px-10 pt-20 sm:pt-28 md:pt-32 pb-8 sm:pb-10 transition-opacity duration-1000 ${
            bootDone ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Top metadata strip */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-8 hud-label">
            <span>
              <span className="text-haze">session</span>{" "}
              <span className="text-accent">#a3f9</span>
            </span>
            <span>
              <span className="text-haze">role</span>{" "}
              security engineer → product
            </span>
            <span>
              <span className="text-haze">status</span>{" "}
              <span className="text-accent">online</span>
            </span>
          </div>

          {/* Main hero block */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="hud-label text-accent">› identity confirmed</p>
              <h1 className="font-display text-5xl sm:text-7xl md:text-9xl font-bold tracking-tight leading-[0.9] crt-flicker">
                <DecryptText
                  text="HARIN"
                  delay={bootDone ? 200 : 99999}
                  duration={700}
                  stagger={80}
                />
              </h1>
              <p className="font-mono text-sm sm:text-base md:text-lg max-w-xl text-ink mt-2 text-balance">
                <DecryptText
                  text="cybersecurity engineer. software builder. learning the craft of product."
                  delay={bootDone ? 900 : 99999}
                  duration={400}
                  stagger={12}
                />
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mt-4">
              <Link
                href="/timeline"
                className="group inline-flex items-center justify-center gap-2 px-5 py-3 border border-accent/60 text-accent hover:bg-accent hover:text-bg transition-colors font-mono text-sm tracking-wider uppercase"
              >
                <span>› trace the timeline</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/chat"
                className="group inline-flex items-center justify-center gap-2 px-5 py-3 border border-haze/40 text-ink hover:border-accent hover:text-accent transition-colors font-mono text-sm tracking-wider uppercase"
              >
                <span>› query the operator</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* Bottom prompt */}
          <div className="flex items-center justify-between text-haze hud-label">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("operator:palette-open"))
              }
              className="tap-target -ml-2 px-2 inline-flex items-center sm:cursor-default sm:pointer-events-none"
            >
              <span className="sm:hidden">› open console</span>
              <span className="hidden sm:inline">
                press <span className="text-accent">/</span> to open console
              </span>
            </button>
            <span className="hidden sm:inline">scroll · or · navigate</span>
          </div>
        </div>
      </section>
    </>
  );
}
