---
name: execute
description: Execute a written implementation plan task-by-task with review checkpoints
argument-hint: [path or text of a Developer Version / implementation plan]
---

Dispatch a subagent of type "plan-executor" (Agent tool in Claude Code, Task tool in Cursor) to execute the following implementation plan — isolate the workspace, run it task by task with review checkpoints, and finish the branch when done: $ARGUMENTS
