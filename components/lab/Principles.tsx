import { PRINCIPLES } from "@/content/ai";

/** Operating principles. Terse on purpose. Static — renders on the server. */
export function Principles() {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
      {PRINCIPLES.map((p, i) => (
        <li key={p.k} className="flex gap-4">
          <span
            className="hud-label text-ai/60 pt-1 select-none shrink-0"
            aria-hidden
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="font-mono text-sm text-accent tracking-wide">
              {p.k}
            </h3>
            <p className="font-mono text-sm text-ink/70 leading-relaxed mt-1">
              {p.v}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
