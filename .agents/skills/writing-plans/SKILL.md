---
name: writing-plans
description: Turn a spec, requirement, or decision into an implementation plan. Use when the user has a spec or requirements for multi-step work and needs a plan before touching code, or asks for a plan/roadmap. Always produces two versions — a human version and a developer version.
---

# Writing Plans

Turn a spec, set of requirements, or `/grill`-settled decision into an implementation plan. Every plan produced under this skill ships as **two versions**, not one — they answer different questions for different readers, and neither substitutes for the other.

## The two versions

### 1. Human version

For a stakeholder, PM, or the user themselves skimming for status — not implementers.

- Plain language, no code, no file paths, no framework names unless the reader already used them.
- Structure: **What's changing** (1–3 sentences) → **Milestones** (ordered, each a user-visible outcome, not a technical step) → **Timeline/sequencing** (relative order; only give dates if the user supplied them) → **Risks & tradeoffs** (in terms of impact, not implementation) → **What you'll be asked to decide** (open questions that need the user, if any).
- Length target: readable in under two minutes. If a milestone needs more than 2–3 sentences to explain, it's still too technical for this version — push detail to the developer version instead.

### 2. Developer version

For whoever implements it — could be the user, another engineer, or a future agent session.

- Structure: **Context** (what exists today, what's being touched) → **Steps** (ordered, each a concrete unit of work — file/module level, not vague like "update backend") → **Sequencing & dependencies** (what must land before what, and why) → **Testing/verification** (how each step gets confirmed done, not just "test it") → **Risks & edge cases** (technical: race conditions, migrations, backward compatibility, rollout order) → **Open questions** (technical unknowns, distinct from the human version's decision-level ones).
- Concrete enough that someone unfamiliar with the last five minutes of conversation could execute it without re-deriving decisions already made.

## Process

1. **Don't plan from a vague spec.** If the input has unresolved open questions or reads thin, use the `grilling` skill (or suggest `/grill`) first — a plan built on unsettled decisions just moves the ambiguity downstream instead of resolving it.
2. **Derive both versions from the same set of decisions** — write the developer version's steps first (it forces you to actually think through sequencing and dependencies), then compress upward into the human version's milestones. Don't write the human version by simply deleting technical words from developer content; re-derive it at the right altitude.
3. **Keep them consistent.** Every milestone in the human version should map to one or more steps in the developer version, and vice versa — no step should exist in one version with no trace in the other.
4. **Output both, clearly labeled**, e.g. under `## Human Version` and `## Developer Version` headings — never merge them into one blended document.
