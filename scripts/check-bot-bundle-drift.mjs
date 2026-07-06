#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const BUNDLE_PATH = "packages/screeps-bot/dist/main.js";

function runGit(args, options = {}) {
  return spawnSync("git", args, {
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
  });
}

const diffCheck = runGit(["diff", "--quiet", "--exit-code", "HEAD", "--", BUNDLE_PATH]);

if (diffCheck.status === 0) {
  console.log(`Bot bundle is reproducible: ${BUNDLE_PATH} has no generated drift.`);
  process.exit(0);
}

if (diffCheck.error) {
  console.error(`Unable to check bot bundle drift: ${diffCheck.error.message}`);
  process.exit(1);
}

if (diffCheck.status !== 1 || diffCheck.stderr) {
  console.error("Unable to check bot bundle drift.");
  if (diffCheck.stderr) console.error(diffCheck.stderr.trim());
  process.exit(diffCheck.status ?? 1);
}

console.error(`Generated bot bundle drift detected in ${BUNDLE_PATH}.`);
console.error("Run `npm run build:bot`, review the generated diff, and commit the updated bundle with the source change.");
console.error("");

const diff = runGit(["diff", "HEAD", "--", BUNDLE_PATH], { stdio: "inherit" });
process.exit(diff.status === null ? 1 : diff.status || 1);
