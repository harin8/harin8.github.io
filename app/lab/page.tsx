import Link from "next/link";
import { AgentLoop } from "@/components/lab/AgentLoop";
import { StackGrid } from "@/components/lab/StackGrid";
import { Principles } from "@/components/lab/Principles";
import { InjectionLab } from "@/components/lab/InjectionLab";

export const metadata = {
  title: "harin // lab",
  description:
    "How Harin works with AI: an interactive agent loop, the tool stack, and the principles behind shipping fast with models — without losing the engineering.",
};

export default function LabPage() {
  return (
    <div className="relative">
      {/* Faint engineering-grid backdrop for the lab */}
      <div className="ai-grid-bg absolute inset-0 pointer-events-none opacity-60" aria-hidden />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-10 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24">
        {/* Header */}
        <header className="mb-12 sm:mb-16">
          <p className="hud-label text-ai mb-3">› lab.init() — ai workbench</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[0.95]">
            the lab.
          </h1>
          <p className="font-mono text-sm sm:text-base text-ink/75 mt-5 max-w-2xl leading-relaxed">
            i build with AI the way i'd build anything that ships: grounded,
            planned, verified. models write a lot of the code now — the
            engineering is in the loop around them. here's the setup.
          </p>
        </header>

        {/* The loop */}
        <section className="mb-14 sm:mb-20" aria-labelledby="loop-heading">
          <div className="flex items-baseline gap-3 mb-5">
            <span className="hud-label text-haze">01</span>
            <h2 id="loop-heading" className="font-mono text-lg sm:text-xl text-ink">
              the loop
            </h2>
          </div>
          <p className="font-mono text-sm text-ink/60 mb-6 max-w-2xl">
            every change runs through the same six stages. press{" "}
            <span className="text-ai">run</span> to watch a pass, or click any
            stage to inspect it.
          </p>
          <AgentLoop />
        </section>

        {/* The stack */}
        <section className="mb-14 sm:mb-20" aria-labelledby="stack-heading">
          <div className="flex items-baseline gap-3 mb-5">
            <span className="hud-label text-haze">02</span>
            <h2 id="stack-heading" className="font-mono text-lg sm:text-xl text-ink">
              the stack
            </h2>
          </div>
          <p className="font-mono text-sm text-ink/60 mb-6 max-w-2xl">
            the tools, grouped by what they're actually for.
          </p>
          <StackGrid />
        </section>

        {/* Principles */}
        <section className="mb-14 sm:mb-20" aria-labelledby="principles-heading">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="hud-label text-haze">03</span>
            <h2
              id="principles-heading"
              className="font-mono text-lg sm:text-xl text-ink"
            >
              principles
            </h2>
          </div>
          <Principles />
        </section>

        {/* Injection lab — interactive AI-security demo */}
        <section
          id="playground"
          className="mb-14 sm:mb-20 scroll-mt-24"
          aria-labelledby="lab-heading"
        >
          <div className="flex items-baseline gap-3 mb-5">
            <span className="hud-label text-haze">04</span>
            <h2 id="lab-heading" className="font-mono text-lg sm:text-xl text-ink">
              injection lab
            </h2>
          </div>
          <p className="font-mono text-sm text-ink/60 mb-6 max-w-2xl">
            prompt injection is the top risk for LLM apps. here's a live
            pre-filter — the kind i&apos;d put in front of a model. type an
            attack and watch the inspector classify it.
          </p>
          <InjectionLab />
        </section>

        {/* Live artifact tie-in */}
        <section
          className="workbench-panel p-5 sm:p-7"
          aria-labelledby="artifact-heading"
        >
          <p className="hud-label text-ai mb-2">› live artifact</p>
          <h2
            id="artifact-heading"
            className="font-mono text-lg sm:text-xl text-ink mb-2"
          >
            this page isn't the only AI here.
          </h2>
          <p className="font-mono text-sm text-ink/70 max-w-2xl leading-relaxed">
            the operator is a streaming LLM grounded server-side in a single bio
            file — strict input validation, rate-limited, no provider details
            leaked to the client. it's the same loop above, shipped. go break it.
          </p>
          <Link
            href="/chat"
            className="group mt-5 inline-flex items-center gap-2 px-5 py-3 border border-ai/50 text-ai hover:bg-ai hover:text-bg transition-colors font-mono text-sm tracking-wider uppercase rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ai"
          >
            <span>› query the operator</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
