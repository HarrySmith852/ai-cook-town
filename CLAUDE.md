# Delegation

Always delegate messy tasks to Codex via the `codex-rescue` agent — a tangled bug, a large or ambiguous refactor, a "just figure it out" ask, or anything that would otherwise mean grinding through trial and error. Don't attempt these solo first; hand them to `codex-rescue` proactively, without waiting for the user to ask for Codex by name.

Keep simple, clearly-bounded asks on the main thread — only route the messy ones.

# Vendored plugins

Four external plugins are vendored under `vendor/` and registered in `.claude-plugin/marketplace.json` (`vendor/codex-plugin-cc`, `vendor/claude-mem`, `vendor/understand-anything`, `vendor/oh-my-claudecode`). Use them when they genuinely fit — don't reach for a vendored plugin's tooling for something the main thread or an existing ai-cook-town agent already handles well.

- **codex** (`codex-rescue` agent) — messy/open-ended tasks, see Delegation above.
- **claude-mem** — persistent cross-session memory (context capture + a `search` MCP tool). Its capture is fully automatic via its own hooks once the `claude-mem@ai-cook-town` plugin is installed and enabled — there's nothing to call manually, and no ai-cook-town agent can trigger it directly. Treat it as the standing memory system: it should stay installed and enabled so every session's work (including every update this repo's agents make) gets captured, and its `mem-search` skill should be checked before redoing work that may have already been solved in a prior session ("did we already fix this?", "how did we do X last time?"). It is not merged into ai-cook-town's own hooks — its worker-service daemon and path-resolution scripts assume it's installed as its own top-level plugin.
- **understand-anything** — codebase understanding as an interactive knowledge graph (`understand`, `understand-explain`, `understand-onboard`, `understand-diff`, etc. skills). Use when an agent needs deep architecture/dependency context before making a change — e.g. `backend-developer`, `frontend-developer`, `fullstack-developer`, `refactoring-specialist`, or `code-reviewer` sizing up an unfamiliar area of the codebase.
- **oh-my-claudecode** — multi-agent orchestration (model routing, a large agent/skill set, mission-style workflows). Use only for genuinely large, multi-phase efforts that call for coordinating several agents at once — not for single-agent tasks that `codex-rescue` or one of ai-cook-town's own agents already covers.
