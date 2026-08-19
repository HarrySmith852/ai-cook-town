const { existsSync, readFileSync, readdirSync } = require("node:fs");
const path = require("node:path");

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

const hasEslintDep =
  (pkg.dependencies && pkg.dependencies.eslint) ||
  (pkg.devDependencies && pkg.devDependencies.eslint) ||
  (pkg.peerDependencies && pkg.peerDependencies.eslint);

if (hasEslintDep) {
  process.exit(0);
}

let entries = [];
try {
  entries = readdirSync(cwd);
} catch {
  process.exit(0);
}

const hasEslintConfig = entries.some(
  (name) =>
    name === ".eslintrc" ||
    name === ".eslintrc.js" ||
    name === ".eslintrc.cjs" ||
    name === ".eslintrc.json" ||
    name === ".eslintrc.yml" ||
    name === ".eslintrc.yaml" ||
    name.startsWith("eslint.config.")
);

if (hasEslintConfig) {
  process.exit(0);
}

const hasBiome =
  entries.includes("biome.json") ||
  entries.includes("biome.jsonc") ||
  (pkg.devDependencies && pkg.devDependencies["@biomejs/biome"]) ||
  (pkg.dependencies && pkg.dependencies["@biomejs/biome"]);

if (hasBiome) {
  process.exit(0);
}

emitSessionContext(
  "This is a Node.js project (package.json present) but eslint is not listed as a dependency and no eslint/biome config was found. " +
    "Ask the user if they'd like eslint installed as a dev dependency (`npm install --save-dev eslint`) before doing so."
);
