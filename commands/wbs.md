---
name: wbs
description: Generate a WBS (Work Breakdown Structure) Excel file for this project, listing all modules
argument-hint: [optional: scope/source, e.g. "based on the last /spec" or a module list]
---

Dispatch a subagent of type "wbs-generator" (Agent tool in Claude Code, Task tool in Cursor) to generate a WBS Excel file for this project: $ARGUMENTS
