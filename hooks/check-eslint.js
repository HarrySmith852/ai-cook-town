const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const pkgPath = path.join(cwd, "package.json");

if (!existsSync(pkgPath)) {
  process.exit(0);
}

let pkg;
try {
  pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
} catch {
  process.exit(0);
}

const hasEslint =
  (pkg.dependencies && pkg.dependencies.eslint) ||
  (pkg.devDependencies && pkg.devDependencies.eslint);

if (hasEslint) {
  process.exit(0);
}

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext:
        "This is a Node.js project (package.json present) but eslint is not listed as a dependency. " +
        "Ask the user if they'd like eslint installed as a dev dependency (`npm install --save-dev eslint`) before doing so.",
    },
  })
);
