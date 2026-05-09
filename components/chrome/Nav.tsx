"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "/home", code: "00" },
  { href: "/timeline", label: "/timeline", code: "01" },
  { href: "/chat", label: "/chat", code: "02" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-sm bg-[color-mix(in_srgb,var(--color-bg)_70%,transparent)] border-b border-[color-mix(in_srgb,var(--color-haze)_30%,transparent)]">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm tracking-[0.2em] text-accent uppercase"
        >
          <span className="text-haze">[</span>
          harin@operator
          <span className="text-haze">]</span>
        </Link>

        <nav className="flex items-center gap-6">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative font-mono text-xs tracking-[0.15em] uppercase transition-colors ${
                  active
                    ? "text-accent"
                    : "text-haze hover:text-ink"
                }`}
              >
                <span className="opacity-50 mr-1">{link.code}</span>
                {link.label}
                {active && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}

          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-haze border border-haze/30 rounded">
            <span className="text-accent">/</span>
            <span>open</span>
          </kbd>
        </nav>
      </div>
    </header>
  );
}
