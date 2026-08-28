export type TimelineTag = "ORIGIN" | "CYBER" | "CODE" | "PRODUCT" | "LIFE";

export interface TimelineEvent {
  year: string;
  title: string;
  body: string;
  tag: TimelineTag;
}

/**
 * Real life history, anchored to dates. Tone stays terse and evocative.
 * Each event renders as a card in the z-axis pinned scroll on /timeline.
 */
export const TIMELINE: TimelineEvent[] = [
  {
    year: "1996",
    title: "school, surat",
    body: "born in 1996. above-average grades, captain of the handball team, and a lot of hours in front of a computer. sport and machines — the two things that stuck.",
    tag: "ORIGIN",
  },
  {
    year: "2015",
    title: "computer engineering",
    body: "started a bachelor's. the first time a wrong key did something I didn't expect — and I had to know why.",
    tag: "ORIGIN",
  },
  {
    year: "2018",
    title: "the first CTF",
    body: "got pulled into capture the flag competitions. top-60 out of ~5,000 in TCS Hackquest 3.0 — solving challenges for sport turned into a job offer. security was just systems thinking, with stakes.",
    tag: "CYBER",
  },
  {
    year: "2019",
    title: "security analyst, bhubaneswar",
    body: "70+ pentests and code reviews for multinational clients at TCS. then built a tool that correlated scanner output with real exploits — the first time I cared about the system around the work, not just the work.",
    tag: "CYBER",
  },
  {
    year: "2021",
    title: "nyu, cybersecurity",
    body: "moved to new york for a master's. wrote challenges for CSAW with the OSIRIS lab — the best way to understand an attack is to build one.",
    tag: "CYBER",
  },
  {
    year: "2022",
    title: "arc xp, application security",
    body: "a summer internship. swept 70 assets, found DirtyPipe (CVE-2022-0847) in the wild, walked owners through the fix. the asymmetric weight of real systems — joy on one side, dread on the other.",
    tag: "CODE",
  },
  {
    year: "2023",
    title: "software engineer",
    body: "graduated, then moved from breaking software to writing it at a small company. on the side, pro-bono cloud security for a health tech startup. the year the work flipped from finding problems to owning them.",
    tag: "CODE",
  },
  {
    year: "2024",
    title: "capital one, card onboarding",
    body: "lead software engineer. one tile moved setup reentry from 10% to 30%. my best work happened when I argued about the spec, not just the code.",
    tag: "PRODUCT",
  },
  {
    year: "2025",
    title: "the onboarding platform",
    body: "architected it end to end — a config-driven service that decides which setup tasks a customer sees, rather than a hardcoded flow per card type. the best engineering call was what not to build: reuse the services that already existed.",
    tag: "CODE",
  },
  {
    year: "2026",
    title: "small business to 30 million",
    body: "staged by blast radius rather than by calendar, ~30M discover customers last. other lines of business plugged their own tasks into it. scale wasn't a thing to fix at the end — it was the order you ship in.",
    tag: "PRODUCT",
  },
  {
    year: "now",
    title: "toward product",
    body: "defining success metrics, sequencing rollouts by risk, pushing on what to build and why. shipping software and shipping product are different sports. the gap is the work.",
    tag: "PRODUCT",
  },
];
