#!/usr/bin/env node
// PreToolUse guard for review agents: allow Write/Edit only inside the
// directories passed as arguments (relative to the project root).
// Exit 0 = allow, exit 2 = block (stderr is shown to the agent).
import path from "node:path";

const allowed = process.argv.slice(2);
const root = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let filePath = "";
  try {
    const input = JSON.parse(raw || "{}");
    filePath = input?.tool_input?.file_path ?? input?.tool_input?.path ?? "";
  } catch {
    process.stderr.write("write-guard: could not parse hook input; blocking to be safe.\n");
    process.exit(2);
  }

  if (!filePath) process.exit(0);

  const target = path.resolve(root, filePath);
  const ok = allowed.some((dir) => {
    const base = path.resolve(root, dir);
    return target === base || target.startsWith(base + path.sep);
  });

  if (ok) process.exit(0);

  process.stderr.write(
    `write-guard: this agent may only write inside: ${allowed.join(", ")}. ` +
      `Blocked: ${path.relative(root, target) || target}. ` +
      `Report the change you wanted to make instead of making it.\n`,
  );
  process.exit(2);
});
