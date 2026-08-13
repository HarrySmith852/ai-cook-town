# ai-cook-town

**A [Claude Code](https://code.claude.com) plugin that works like a full-stack software engineer for your project** — scaffold new work, turn ideas into specs, validate requirements against reality, and act on the gaps.

```
/plugin marketplace add HarrySmith852/ai-cook-town
/plugin install ai-cook-town
```

---

## Contents

- [Why](#why)
- [The pipeline](#the-pipeline)
- [Commands](#commands)
- [Installation](#installation)
- [Usage](#usage)
- [Bundled skills](#bundled-skills)
- [Token cost](#token-cost)
- [Hooks](#hooks)
- [Project structure](#project-structure)
- [Development](#development)

## Why

Most AI coding tools jump straight to writing code. ai-cook-town adds the steps a careful engineer takes around that: scaffold with the right conventions, turn vague asks into a real spec, check whether a requirement is actually satisfiable before promising it, and only then act — using existing, vetted skills where one already does the job instead of reinventing it.

## The pipeline

```mermaid
flowchart LR
    A["/scaffold\nnew project"] --> B["/spec\nraw info → technical spec"]
    B --> G["/grill\nstress-test the draft"]
    G --> P["/plan\nhuman + developer plan"]
    P --> C["/validate\nrequirements vs. docs/code"]
    C --> D["/act\nclose the gaps"]
    B --> W["/wbs\nmodules → WBS .xlsx"]
    C -.->|OK / Not Possible| E["no action needed"]
```

Each stage is optional on its own — start wherever fits (e.g. run `/validate` alone against an existing codebase).

## Commands

| Command | Delegates to | Does |
|---|---|---|
| `/scaffold` | `project-scaffolder` | Starts a new project or package: clarifies the stack, lays down conventional structure, wires up baseline tooling (deps, lint/test config, `.gitignore`, README, optional git init). |
| `/spec` | `spec-writer` | Turns raw input (notes, a conversation, a partial doc, existing code) into a structured full-stack spec — frontend, backend, data model, API, open questions. |
| `/grill` | `grilling` skill directly | Relentlessly interviews you about a plan, decision, or `/spec` draft — round-by-round, one design-tree frontier at a time — until nothing's left silently assumed. |
| `/plan` | `writing-plans` skill directly | Turns a spec or requirement into an implementation plan — **always two versions**: a plain-language Human Version (milestones, risk, decisions needed) and a concrete Developer Version (steps, sequencing, testing, technical edge cases). |
| `/validate` | `requirement-validator` | Checks requirement(s) against the project's actual docs/code. Verdict per requirement: **OK**, **Not OK**, **Possible**, **Not Possible** — each with cited evidence. |
| `/act` | `action-executor` | Takes a `/validate` report, finds relevant skills for each actionable finding via `find-skills`, installs what fits, and performs the resulting changes. |
| `/wbs` | `wbs-generator` | Generates a Work Breakdown Structure `.xlsx` for the project — modules → sub-modules → tasks, with Dependencies/Status/ETA columns, color-coded by status. |

Every command runs its own subagent in an isolated context — the main conversation doesn't get cluttered with the work.

## Installation

```
/plugin marketplace add HarrySmith852/ai-cook-town
/plugin install ai-cook-town
```

For local development, point `marketplace add` at your local checkout path instead of a GitHub repo.

## Usage

```
/scaffold A Node/Express API with Postgres
/spec Users should be able to reset their password via email
/grill The password reset spec above
/plan The password reset spec above
/validate The API must support pagination on the /orders endpoint
/act <paste the validation report from /validate>
/wbs Based on the last /spec
```

**Example `/validate` output shape:**

```
Summary: 2 OK · 1 Not OK · 3 Possible · 1 Not Possible

- Password reset via email           OK          — see auth/reset.ts:14
- Pagination on /orders               Not OK      — endpoint returns full table, no `page`/`limit` params
- Rate limiting on /orders             Possible    — no blocker, not yet implemented
- Real-time order updates              Not Possible — no websocket layer; would require new infra
...
```

## Bundled skills

`plugin.json`'s `skills` field points at `.agents/skills`, so all of the following install automatically with the plugin — nothing extra to run. Kept deliberately minimal: only skills actually referenced by name in this plugin's own agents are bundled by default, to keep always-on token cost low (see [Token cost](#token-cost) below). Anything else is discoverable on demand.

| Skill | Source | Used for |
|---|---|---|
| `find-skills` | [vercel-labs/skills](https://github.com/vercel-labs/skills) | Discovering and installing other skills on demand (used by `action-executor`) |
| `brainstorming` | [obra/superpowers](https://github.com/obra/superpowers) | Framing open-ended requests before `/scaffold` or `/spec` (used by `project-scaffolder`) |
| `grilling` | [mattpocock/skills](https://github.com/mattpocock/skills) | The interview logic behind `/grill` — stress-tests a plan/spec round by round |
| `grill-me` | mattpocock/skills | A trigger alias for `grilling`; not model-invoked on its own (`disable-model-invocation: true`) — kept alongside it for compatibility with anything that names it directly |
| `writing-plans` | this plugin (first-party) | The logic behind `/plan` — always produces a Human Version and a Developer Version, never a single blended document |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | The qualitative layer: deliberate visual/UX direction (palette, type, layout, motion, copy) instead of templated defaults. Always invoked by `project-scaffolder` and `action-executor` before any frontend/UI visual decision, however small |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | The structured layer: a local, stdlib-only Python search tool over curated palettes/typography/UX rules/stack-specific implementation/accessibility checklists. `project-scaffolder` runs its `--design-system` search for new projects/pages; `action-executor` runs targeted `--domain`/`--stack` searches for smaller fixes. Used alongside `frontend-design`, not instead of it — reviewed for network/exec/eval calls before bundling despite an automated "High Risk" scan tag (false positive: the tag reacts to bundled executable scripts, not anything the code does) |

To add more: `npx skills add <repo> --skill <name>` from the project root — it installs into `.agents/skills`, updates `skills-lock.json`, and ships with the plugin on the next release. Only bundle a skill by default if an agent here actually references it by name; otherwise let `find-skills` fetch it on demand when a task calls for it.

## Token cost

Check the live number anytime with `claude plugin details ai-cook-town@ai-cook-town`. As of `0.2.0`: ~791 always-on tokens per session (down from ~1,452 in `0.1.0`, after trimming the bundled-skill list above). On-invoke cost (paid only when a given skill/agent actually fires) is unaffected.

## Hooks

Both wired inline in `plugin.json`'s `hooks` field, on `SessionStart`:

- **`hooks/check-eslint.js`** — checks whether the project has a `package.json` (i.e. is a Node project) without `eslint` as a dependency. If so, it surfaces that to Claude, which then **asks before** installing `eslint` as a dev dependency — never silently.
- **`hooks/auto-update.js`** — once per day at most (throttled via a timestamp file in the OS temp dir, so it doesn't add latency to every session), runs `claude plugin marketplace update` + `claude plugin update` for this plugin. Requires the `claude` CLI on `PATH`; fails silently (never blocks session start) if it's missing, offline, or the update check errors. If an update was applied, it tells Claude to let you know a restart is needed to pick it up.

## WBS generation

`/wbs` produces a real `.xlsx` — not a markdown table — matching a standard WBS layout: **modules → sub-modules → tasks**, with Dependencies / Frontend Status / Backend Status / ETA columns, status cells color-coded (green = Complete, yellow = In Progress, orange = Not Started/Pending, red = Blocked). It's generated by `scripts/generate-wbs.js` using `xlsx-js-style`, installed in an isolated `scripts/node_modules` the first time it's needed — it never touches the target project's own `package.json` or dependencies.

## Project structure

```
.claude-plugin/
  plugin.json                  # plugin manifest
  marketplace.json              # makes this repo installable via /plugin marketplace add
commands/
  scaffold.md                   # /scaffold → project-scaffolder
  spec.md                       # /spec     → spec-writer
  grill.md                       # /grill    → grilling skill
  plan.md                        # /plan     → writing-plans skill
  validate.md                   # /validate → requirement-validator
  act.md                        # /act      → action-executor
  wbs.md                         # /wbs      → wbs-generator
agents/
  project-scaffolder.md         # new project structure + baseline tooling
  spec-writer.md                # raw input → full-stack spec
  requirement-validator.md      # requirements vs. docs/code, with verdicts
  action-executor.md            # closes gaps found by /validate, using relevant skills
  wbs-generator.md               # modules/tasks → WBS .xlsx
hooks/
  check-eslint.js                # flags missing eslint on Node projects (wired via plugin.json's hooks field)
  auto-update.js                  # daily self-update check via the claude CLI (same wiring)
scripts/
  generate-wbs.js                # writes the WBS .xlsx (used by wbs-generator)
  package.json                   # generator's own isolated dependency (xlsx-js-style)
.agents/skills/                 # bundled skills — see table above
skills-lock.json                 # pins bundled skill sources/versions
```

## Development

Edit the files above directly, then reload the plugin in Claude Code to pick up changes.

- Commands are prompt templates in `commands/*.md` — front matter takes `description` and `argument-hint`; `$ARGUMENTS` is replaced with whatever follows the slash command.
- Agents are subagent definitions in `agents/*.md` — front matter takes `name`, `description` (used for auto-delegation matching), and `tools`.
- See the [Claude Code plugin docs](https://code.claude.com/docs/en/plugins) for the full manifest schema and hook event reference.
