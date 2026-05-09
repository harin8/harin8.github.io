import { Terminal } from "@/components/chat/Terminal";

export const metadata = {
  title: "harin // chat",
  description: "Talk to the operator. Streaming answers about Harin's life and work.",
};

export default function ChatPage() {
  return (
    <div className="px-4 sm:px-6 pt-28 pb-16">
      <header className="max-w-4xl mx-auto mb-8">
        <p className="hud-label text-accent mb-2">› secure channel — ready</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
          query the operator.
        </h1>
        <p className="font-mono text-sm text-ink/70 mt-3 max-w-xl">
          a streaming console grounded in harin&apos;s life and work. ask
          freely. answers stay in scope; the operator says so when it
          doesn&apos;t know.
        </p>
      </header>

      <Terminal />

      <footer className="max-w-4xl mx-auto mt-6 hud-label text-haze flex flex-wrap gap-x-6 gap-y-2 justify-between">
        <span>› rate-limit · 10 / 10min</span>
        <span>› context · session-only · not stored</span>
        <span>› press / for command palette</span>
      </footer>
    </div>
  );
}
