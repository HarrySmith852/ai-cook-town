const { execSync } = require("node:child_process");
const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // once a day
const MARKETPLACE = "ai-cook-town";
const PLUGIN = "ai-cook-town@ai-cook-town";
const STATE_FILE = path.join(os.tmpdir(), "ai-cook-town-auto-update.json");

function readState() {
  if (!existsSync(STATE_FILE)) return { lastCheck: 0 };
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { lastCheck: 0 };
  }
}

function writeState(state) {
  try {
    writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch {
    // best-effort only
  }
}

function run(cmd) {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 15000,
  });
}

function emitSessionContext(message) {
  console.log(
    JSON.stringify({
      additional_context: message,
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: message,
      },
    })
  );
}

const state = readState();
if (Date.now() - (state.lastCheck || 0) < CHECK_INTERVAL_MS) {
  process.exit(0);
}

try {
  run(`claude plugin marketplace update ${MARKETPLACE}`);
  const updateOutput = run(`claude plugin update ${PLUGIN}`);
  writeState({ ...state, lastCheck: Date.now() });

  if (/updated from/i.test(updateOutput)) {
    emitSessionContext(
      "ai-cook-town was just auto-updated to a newer version from its GitHub repo. " +
        "Tell the user a restart of Claude Code is needed to apply it, and mention what changed if you know."
    );
  }
} catch {
  // No `claude` CLI on PATH, no network, or the update check failed —
  // never block session start over this. Retry next session rather than
  // waiting a full day after a transient failure.
  process.exit(0);
}
