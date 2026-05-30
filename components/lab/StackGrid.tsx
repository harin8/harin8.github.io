import { STACK } from "@/content/ai";

/** The setup, grouped and skimmable. Static — renders on the server. */
export function StackGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {STACK.map((g) => (
        <section key={g.group} className="workbench-panel p-4 sm:p-5">
          <header className="mb-3">
            <h3 className="hud-label text-ai">[{g.group}]</h3>
            <p className="font-mono text-xs text-haze mt-1">{g.blurb}</p>
          </header>
          <ul className="flex flex-col gap-2.5">
            {g.tools.map((t) => (
              <li
                key={t.name}
                className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3"
              >
                <span className="font-mono text-sm text-ink shrink-0">
                  <span className="text-ai/70 select-none">›</span> {t.name}
                </span>
                <span className="font-mono text-xs text-ink/65 leading-snug">
                  {t.note}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
