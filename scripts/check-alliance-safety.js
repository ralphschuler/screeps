import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const scanRoots = [
  "packages/screeps-bot/src",
  "packages/@ralphschuler/screeps-roles/src",
  "packages/@ralphschuler/screeps-empire/src",
  "packages/screeps-spawn/src",
  "packages/screeps-defense/src"
];

const approvedFiles = new Set([
  "packages/screeps-bot/src/cache/domains/RoomFindCache.ts",
  "packages/screeps-bot/src/core/roomFindOptimizer.ts"
]);

const approvedPrefixes = [
  "packages/screeps-defense/src/"
];

const hostilePatterns = [
  "FIND_HOSTILE_CREEPS",
  "FIND_HOSTILE_POWER_CREEPS",
  "FIND_HOSTILE_STRUCTURES",
  "FIND_HOSTILE_SPAWNS"
];

async function collectTypeScriptFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectTypeScriptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function isApproved(relativePath) {
  return approvedFiles.has(relativePath) ||
    approvedPrefixes.some(prefix => relativePath.startsWith(prefix));
}

function isRawHostileUsage(line) {
  if (!hostilePatterns.some(pattern => line.includes(pattern))) {
    return false;
  }

  return (
    line.includes(".find(") ||
    line.includes("safeFind(") ||
    line.includes("safeFindClosestByRange(") ||
    line.includes("cachedRoomFind(")
  );
}

const violations = [];

for (const scanRoot of scanRoots) {
  const absoluteRoot = path.join(root, scanRoot);
  const files = await collectTypeScriptFiles(absoluteRoot);

  for (const file of files) {
    const relativePath = path.relative(root, file);
    if (isApproved(relativePath)) {
      continue;
    }

    const contents = await readFile(file, "utf8");
    const lines = contents.split("\n");

    lines.forEach((line, index) => {
      if (isRawHostileUsage(line)) {
        violations.push(`${relativePath}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error("Alliance safety check failed: raw FIND_HOSTILE_* usage found outside approved wrappers.");
  console.error("Use @ralphschuler/screeps-defense getActualHostile* helpers instead.");
  console.error("");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Alliance safety check passed.");
