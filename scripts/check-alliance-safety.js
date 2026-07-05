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

function stripCommentsFromLines(lines) {
  let inBlockComment = false;
  let quote = null;
  let escaped = false;

  return lines.map(line => {
    let code = "";

    for (let index = 0; index < line.length; index++) {
      const current = line[index];
      const next = line[index + 1];

      if (inBlockComment) {
        if (current === "*" && next === "/") {
          inBlockComment = false;
          index++;
        }
        continue;
      }

      if (quote) {
        code += current;
        if (escaped) {
          escaped = false;
        } else if (current === "\\") {
          escaped = true;
        } else if (current === quote) {
          quote = null;
        }
        continue;
      }

      if (current === '"' || current === "'" || current === "`") {
        quote = current;
        code += current;
        continue;
      }

      if (current === "/" && next === "*") {
        inBlockComment = true;
        index++;
        continue;
      }

      if (current === "/" && next === "/") {
        break;
      }

      code += current;
    }

    if (quote !== "`") {
      quote = null;
      escaped = false;
    }

    return code;
  });
}

function codeOnlyLine(line) {
  return line;
}

function isCommentOnlyLine(line) {
  return codeOnlyLine(line).trim() === "";
}

const rawFindCallPatterns = [
  ".find(",
  "safeFind(",
  "safeFindClosestByRange(",
  "cachedRoomFind(",
  "cachedFindHostile"
];

function stripStringLiterals(text) {
  let stripped = "";
  let quote = null;
  let escaped = false;

  for (const character of text) {
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      stripped += " ";
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      stripped += " ";
      continue;
    }

    stripped += character;
  }

  return stripped;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsIdentifier(text, identifier) {
  return new RegExp(`(^|[^A-Za-z0-9_$])${escapeRegExp(identifier)}([^A-Za-z0-9_$]|$)`).test(text);
}

function containsHostilePattern(text, hostileIdentifiers = hostilePatterns) {
  const code = stripStringLiterals(text);
  return [...hostileIdentifiers].some(identifier => containsIdentifier(code, identifier));
}

function containsRawFindCall(text) {
  return rawFindCallPatterns.some(pattern => text.includes(pattern));
}

function compactSnippet(text) {
  return text.replace(/\s+/g, " ").trim();
}

function countSyntaxCharacter(text, character) {
  return [...stripStringLiterals(text)].filter(candidate => candidate === character).length;
}

function collectHostileAliases(lines) {
  const aliases = new Set();
  let statement = "";
  let parenBalance = 0;

  for (const line of lines) {
    const code = codeOnlyLine(line);
    if (isCommentOnlyLine(code)) {
      continue;
    }

    statement = `${statement}\n${code}`;
    parenBalance += countSyntaxCharacter(code, "(") - countSyntaxCharacter(code, ")");

    const match = statement.match(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\b[^=]*=\s*([\s\S]+)/);
    if (match) {
      const [, alias, initializer] = match;
      if (containsHostilePattern(initializer) || containsHostilePattern(initializer, aliases)) {
        aliases.add(alias);
      }
    }

    const trimmed = code.trimEnd();
    const continues = !code.includes(";") && (parenBalance > 0 || /[=([{,?:|&]$/.test(trimmed));
    if (!continues) {
      statement = "";
      parenBalance = 0;
    }
  }

  return aliases;
}

function rawHostileUsageSnippet(lines, startIndex, hostileIdentifiers) {
  const line = codeOnlyLine(lines[startIndex]);
  if (isCommentOnlyLine(line) || !containsRawFindCall(line)) {
    return null;
  }

  let parenBalance = 0;
  const statementLines = [];

  for (let index = startIndex; index < lines.length; index++) {
    const code = codeOnlyLine(lines[index]);
    if (!isCommentOnlyLine(code)) {
      statementLines.push(code);
      parenBalance += countSyntaxCharacter(code, "(") - countSyntaxCharacter(code, ")");
    }

    const statement = statementLines.join("\n");
    if (containsHostilePattern(statement, hostileIdentifiers)) {
      return compactSnippet(statement);
    }

    if (parenBalance <= 0) {
      break;
    }
  }

  return null;
}

const violations = [];
const files = await collectRuntimeSourceFiles();

for (const file of files) {
  const relativePath = path.relative(root, file);
  if (isApproved(relativePath)) {
    continue;
  }

  const contents = await readFile(file, "utf8");
  const lines = stripCommentsFromLines(contents.split("\n"));
  const hostileIdentifiers = [...hostilePatterns, ...collectHostileAliases(lines)];

  lines.forEach((_, index) => {
    const snippet = rawHostileUsageSnippet(lines, index, hostileIdentifiers);
    if (snippet) {
      violations.push(`${relativePath}:${index + 1}: ${snippet}`);
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
