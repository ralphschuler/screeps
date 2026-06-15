import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const packagesRoot = "packages";

const approvedFiles = new Set([
  // Central ally-safe Room.find wrappers.
  "packages/@ralphschuler/screeps-core/src/alliance.ts",

  // Low-level caches/optimizers may hold raw FIND_HOSTILE_* values internally.
  // Runtime callers must use ally-safe helpers or package convenience wrappers.
  "packages/@ralphschuler/screeps-cache/src/domains/RoomFindCache.ts",
  "packages/screeps-utils/src/cache/roomFindCache.ts",
  "packages/screeps-bot/src/cache/domains/RoomFindCache.ts",
  "packages/screeps-bot/src/core/roomFindOptimizer.ts"
]);

const hostilePatterns = [
  "FIND_HOSTILE_CREEPS",
  "FIND_HOSTILE_POWER_CREEPS",
  "FIND_HOSTILE_STRUCTURES",
  "FIND_HOSTILE_SPAWNS"
];

async function pathExists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

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

async function collectRuntimeSourceFiles() {
  const absolutePackagesRoot = path.join(root, packagesRoot);
  if (!await pathExists(absolutePackagesRoot)) {
    return [];
  }

  const files = await collectTypeScriptFiles(absolutePackagesRoot);
  return files.filter(file => file.includes(`${path.sep}src${path.sep}`));
}

function isApproved(relativePath) {
  return approvedFiles.has(relativePath);
}

function isCommentOnlyLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*");
}

function isRawHostileUsage(line) {
  if (isCommentOnlyLine(line)) {
    return false;
  }

  if (!hostilePatterns.some(pattern => line.includes(pattern))) {
    return false;
  }

  return (
    line.includes(".find(") ||
    line.includes("safeFind(") ||
    line.includes("safeFindClosestByRange(") ||
    line.includes("cachedRoomFind(") ||
    line.includes("cachedFindHostile")
  );
}

const violations = [];
const files = await collectRuntimeSourceFiles();

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

if (violations.length > 0) {
  console.error("Alliance safety check failed: raw FIND_HOSTILE_* usage found outside approved wrappers.");
  console.error("Use @ralphschuler/screeps-core getActualHostile* helpers instead.");
  console.error("");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Alliance safety check passed (${files.length} runtime source files scanned).`);
