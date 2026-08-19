---
name: validate
description: Validate requirement(s) against this project's documentation and/or codebase
argument-hint: [requirement text, or path to a requirements doc]
---

Dispatch a subagent of type "requirement-validator" (Agent tool in Claude Code, Task tool in Cursor) to validate the following requirement(s) against this project's documentation and/or codebase, and report which are OK, Not OK, Possible, or Not Possible: $ARGUMENTS
