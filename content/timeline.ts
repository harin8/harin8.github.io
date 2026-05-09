export type TimelineTag = "ORIGIN" | "CYBER" | "CODE" | "PRODUCT" | "LIFE";

export interface TimelineEvent {
  year: string;
  title: string;
  body: string;
  tag: TimelineTag;
}

/**
 * Placeholder events. Replace with real life history before launch.
 * Each event renders as a card in the z-axis pinned scroll on /timeline.
 */
export const TIMELINE: TimelineEvent[] = [
  {
    year: "200X",
    title: "first contact",
    body: "the first computer. the first time a wrong key did something I didn't expect — and I had to know why.",
    tag: "ORIGIN",
  },
  {
    year: "201X",
    title: "the bug that broke me open",
    body: "an off-by-one in a school assignment that made me stop trusting any code I hadn't read line by line. the seed of paranoia.",
    tag: "ORIGIN",
  },
  {
    year: "201X",
    title: "first CTF",
    body: "stayed up for thirty-six hours. solved one challenge. learned that 'security' is just systems thinking with stakes.",
    tag: "CYBER",
  },
  {
    year: "201X",
    title: "shipped to production",
    body: "first commit that ran on a server people other than me used. the asymmetric weight of that — joy on one side, dread on the other.",
    tag: "CODE",
  },
  {
    year: "202X",
    title: "the engineer who asks why",
    body: "noticed my best work happened when I argued about the spec, not the code. someone called me a 'product person in disguise.'",
    tag: "PRODUCT",
  },
  {
    year: "202X",
    title: "the long pivot begins",
    body: "started shadowing PMs. learned that shipping software and shipping product are different sports. the gap was the work.",
    tag: "PRODUCT",
  },
  {
    year: "now",
    title: "operator mode",
    body: "writing this site. talking to anyone who'll listen. this is the in-between.",
    tag: "LIFE",
  },
];
