import { Terminal } from "@/components/chat/Terminal";

export const metadata = {
  title: "harin // chat",
  description: "Talk to the operator. Streaming answers about Harin's life and work.",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[100dvh] px-4 sm:px-6 pt-20 sm:pt-24 pb-4 sm:pb-6">
      <header className="max-w-4xl w-full mx-auto mb-4 sm:mb-5 shrink-0">
        <p className="hud-label text-accent mb-2">› secure channel — ready</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
          query the operator.
        </h1>
        <p className="font-mono text-sm text-ink/85 mt-2 max-w-xl">
          a streaming console grounded in harin&apos;s life and work. ask
          freely. answers stay in scope; the operator says so when it
          doesn&apos;t know.
        </p>
      </header>

      <Terminal />

      <footer className="max-w-4xl w-full mx-auto mt-3 sm:mt-4 hud-label text-haze flex flex-wrap gap-x-6 gap-y-1 justify-between shrink-0">
        <span>› rate-limit · 10 / 10min</span>
        <span>› context · session-only · not stored</span>
        <span className="hidden sm:inline">› press / for command palette</span>
      </footer>
    </div>
  );
}
