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
    year: "2015",
    title: "surat, computer engineering",
    body: "started a bachelor's in computer engineering. the first time a wrong key did something I didn't expect — and I had to know why.",
    tag: "ORIGIN",
  },
  {
    year: "2019",
    title: "the CTF that opened a door",
    body: "top-60 finalist out of ~5,000 in TCS Hackquest 3.0. solving challenges for sport turned into a first job. security was just systems thinking with stakes.",
    tag: "CYBER",
  },
  {
    year: "2019",
    title: "two years breaking things on purpose",
    body: "security analyst at TCS, bhubaneswar. 70+ pentests and code reviews. then built a tool that correlated scanner output with real exploits — the first time I cared about the system around the work, not just the work.",
    tag: "CYBER",
  },
  {
    year: "2021",
    title: "new york, the master's",
    body: "MS in cybersecurity at NYU. wrote a CSAW CTF challenge for the OSIRIS lab. learned that the best way to understand an attack is to build one.",
    tag: "CYBER",
  },
  {
    year: "2023",
    title: "hunting in production",
    body: "application security at arc xp. swept 70 assets, found DirtyPipe (CVE-2022-0847) in the wild, walked owners through the fix. the asymmetric weight of real systems — joy on one side, dread on the other.",
    tag: "CODE",
  },
  {
    year: "2024",
    title: "the engineer who asks why",
    body: "senior software engineer at capital one, building card onboarding. one tile moved setup reentry from 10% to 30%. my best work happened when I argued about the spec, not just the code.",
    tag: "PRODUCT",
  },
  {
    year: "2025",
    title: "the system, not the screen",
    body: "architected the onboarding platform end to end — a config-driven service that decides which setup tasks a customer sees, rather than a hardcoded flow per card type. the best engineering call was what not to build: reuse the services that already existed.",
    tag: "CODE",
  },
  {
    year: "2026",
    title: "small business to 30 million",
    body: "took onboarding from a small business pilot to ~30M discover customers, staged by blast radius rather than by calendar. other lines of business plugged their own tasks into it. scale wasn't a thing to fix at the end — it was the order you ship in.",
    tag: "PRODUCT",
  },
  {
    year: "now",
    title: "the long pivot",
    body: "defining success metrics, sequencing rollouts by risk, pushing on what to build and why. shipping software and shipping product are different sports. the gap is the work.",
    tag: "PRODUCT",
  },
];
