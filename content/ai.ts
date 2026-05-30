/**
 * The "AI workbench" content for /lab. This is the source of truth for how
 * Harin works with AI — rendered as an interactive agent loop, a tool stack,
 * and a set of operating principles.
 *
 * Keep it method-focused and honest. Edit the tool names + notes to match your
 * real setup; the page and the command palette read straight from this file.
 */

export interface WorkflowStage {
  /** short machine label shown on the pipeline node */
  id: string;
  /** human title for the expanded panel */
  title: string;
  /** one line of what actually happens at this stage */
  detail: string;
  /** a faux log line streamed while this stage is "running" */
  log: string;
  /** tools leaned on at this stage */
  tools: string[];
}

/** The loop every change runs through. Intent in, shipped diff out. */
export const WORKFLOW: WorkflowStage[] = [
  {
    id: "intent",
    title: "frame the intent",
    detail:
      "write the problem and the acceptance criteria before touching code. constrain scope so the agent optimizes for the right thing.",
    log: "parsing intent · acceptance criteria locked",
    tools: ["spec notes", "issue tracker"],
  },
  {
    id: "context",
    title: "load the context",
    detail:
      "ground the model in the real repo — conventions, file map, and live data through MCP — instead of hoping it guesses. context beats cleverness.",
    log: "indexing repo · attaching mcp servers · grounding",
    tools: ["MCP servers", "repo grounding", "CLAUDE.md"],
  },
  {
    id: "plan",
    title: "plan before diff",
    detail:
      "make the agent show its plan and the diff it intends to make. cheaper to fix an approach than to unpick a patch.",
    log: "drafting plan · proposing diff outline · awaiting review",
    tools: ["plan mode", "design notes"],
  },
  {
    id: "build",
    title: "draft in small diffs",
    detail:
      "let the agent write the code in short, reviewable changes. pair on the hard parts; hand off the boilerplate.",
    log: "editing 4 files · +182 −37 · running formatter",
    tools: ["Claude Code", "Cursor", "Copilot"],
  },
  {
    id: "verify",
    title: "verify, don't vibe",
    detail:
      "types, lint, tests, and a real run gate every change. the agent writes tests too — but i read them.",
    log: "tsc ✓ · eslint ✓ · e2e ✓ · run observed",
    tools: ["tsc", "eslint", "Playwright", "evals"],
  },
  {
    id: "ship",
    title: "keep a human in the diff",
    detail:
      "small pull requests, every line reviewed, fast rollback. the model writes the how; i own the what and the why.",
    log: "opening pr · ci green · ready to merge",
    tools: ["git", "PR review", "CI"],
  },
];

export interface Tool {
  name: string;
  note: string;
}

export interface ToolGroup {
  group: string;
  blurb: string;
  tools: Tool[];
}

/** The setup. Grouped so a reader can scan it in five seconds. */
export const STACK: ToolGroup[] = [
  {
    group: "agents & ide",
    blurb: "where the code actually gets written",
    tools: [
      { name: "Claude Code", note: "agentic edits, planning, multi-file refactors" },
      { name: "Cursor", note: "inline pairing + fast local context" },
      { name: "GitHub Copilot", note: "tab-complete for the obvious parts" },
    ],
  },
  {
    group: "context & data — mcp",
    blurb: "how the model sees the real system, not a guess",
    tools: [
      { name: "MCP servers", note: "repo, docs, and tooling exposed to the agent" },
      { name: "repo grounding", note: "conventions + file map in CLAUDE.md" },
      { name: "retrieval", note: "pull the exact code/doc the task needs" },
    ],
  },
  {
    group: "verification",
    blurb: "green or it didn't happen",
    tools: [
      { name: "TypeScript", note: "strict types as the first gate" },
      { name: "Playwright", note: "real-browser smoke + e2e" },
      { name: "eval harness", note: "score model output, not vibes" },
    ],
  },
  {
    group: "security",
    blurb: "treat model output like untrusted input",
    tools: [
      { name: "CodeQL", note: "static analysis on what ships" },
      { name: "secret scanning", note: "nothing leaks into a prompt or a diff" },
      { name: "threat-model prompts", note: "ask the agent to attack its own design" },
    ],
  },
];

export interface Principle {
  k: string;
  v: string;
}

/** The rules. Terse on purpose. */
export const PRINCIPLES: Principle[] = [
  {
    k: "ground first",
    v: "give the model the repo, the conventions, and the constraints before the task. context beats cleverness.",
  },
  {
    k: "plan before diff",
    v: "make the agent show its plan. it's cheaper to fix an approach than a patch.",
  },
  {
    k: "verify, don't vibe",
    v: "types, tests, and a real run gate every change. green or it didn't happen.",
  },
  {
    k: "small diffs",
    v: "short, reviewable changes. a human reads every line that ships.",
  },
  {
    k: "security stays on",
    v: "model output is untrusted input: validate at the boundary, scan for secrets, least privilege.",
  },
  {
    k: "own the why",
    v: "the model writes the how. i own the what and the why.",
  },
];
