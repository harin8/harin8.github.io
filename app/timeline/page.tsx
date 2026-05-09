import { TimelineScene } from "@/components/timeline/TimelineScene";

export const metadata = {
  title: "harin // timeline",
  description: "A pinned-scroll trace through the events that built the operator.",
};

export default function TimelinePage() {
  return (
    <>
      <header className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12 px-5 sm:px-10 max-w-6xl mx-auto">
        <p className="hud-label text-accent mb-3">› timeline.exe — running</p>
        <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[0.95]">
          the trace.
        </h1>
        <p className="font-mono text-sm sm:text-base text-ink/70 mt-4 max-w-xl">
          scroll forward to move the camera through events. each one held in
          memory for a moment, then past the lens.
        </p>
      </header>

      <TimelineScene />

      <footer className="relative px-5 sm:px-10 py-12 sm:py-20 max-w-6xl mx-auto text-center">
        <p className="hud-label text-haze">› end of trace</p>
        <p className="font-mono text-sm text-ink/60 mt-3">
          press <span className="text-accent">/</span> to query the operator
          about any event.
        </p>
      </footer>
    </>
  );
}
