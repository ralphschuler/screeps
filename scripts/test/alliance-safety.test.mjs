import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const checkerPath = fileURLToPath(new URL("../check-alliance-safety.js", import.meta.url));

function makeWorkspace() {
  return mkdtempSync(path.join(tmpdir(), "screeps-alliance-safety-"));
}

function writeRuntimeSource(root, relativePath, contents) {
  const target = path.join(root, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

function runChecker(root) {
  return spawnSync(process.execPath, [checkerPath], {
    cwd: root,
    encoding: "utf8",
  });
}

function withWorkspace(callback) {
  const root = makeWorkspace();
  try {
    return callback(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("alliance safety checker fails raw multiline hostile Room.find usage in any runtime package", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/nested/unsafe.ts",
      `export function unsafe(room) {\n  return room.find(\n    FIND_HOSTILE_CREEPS,\n  );\n}\n`,
    );

    const result = runChecker(root);

    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /Alliance safety check failed/);
    assert.match(result.stderr, /packages\/\@example\/runtime\/src\/nested\/unsafe\.ts:2/);
    assert.match(result.stderr, /FIND_HOSTILE_CREEPS/);
  });
});

test("alliance safety checker allows central ally-safe wrapper implementations", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@ralphschuler/screeps-core/src/alliance.ts",
      `export function getKnownHostileCreeps(room) {\n  return room.find(\n    FIND_HOSTILE_CREEPS,\n  );\n}\n`,
    );

    const result = runChecker(root);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Alliance safety check passed/);
  });
});

test("alliance safety checker fails hostile constant aliases used in raw Room.find calls", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/alias.ts",
      `export function unsafe(room) {\n  const hostileFind: FindConstant = FIND_HOSTILE_CREEPS;\n  return room.find(hostileFind);\n}\n`,
    );

    const result = runChecker(root);

    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /packages\/\@example\/runtime\/src\/alias\.ts:3/);
    assert.match(result.stderr, /hostileFind/);
  });
});

test("alliance safety checker fails multiline hostile aliases used in raw Room.find calls", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/multiline-alias.ts",
      `export function unsafe(room) {\n  const hostileFind =\n    FIND_HOSTILE_CREEPS;\n  return room.find(hostileFind);\n}\n`,
    );

    const result = runChecker(root);

    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /packages\/\@example\/runtime\/src\/multiline-alias\.ts:4/);
  });
});

test("alliance safety checker fails hostile aliases with valid dollar-prefixed identifiers", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/dollar-alias.ts",
      `export function unsafe(room) {\n  const $hostileFind = FIND_HOSTILE_CREEPS;\n  return room.find($hostileFind);\n}\n`,
    );

    const result = runChecker(root);

    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /packages\/\@example\/runtime\/src\/dollar-alias\.ts:3/);
  });
});

test("alliance safety checker scans complete multiline find statements without an 8-line limit", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/long-call.ts",
      `export function unsafe(room) {\n  return room.find(\n\n\n\n\n\n\n\n\n    FIND_HOSTILE_CREEPS,\n  );\n}\n`,
    );

    const result = runChecker(root);

    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /packages\/\@example\/runtime\/src\/long-call\.ts:2/);
  });
});

test("alliance safety checker fails raw hostile finds in generator methods", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/generator.ts",
      `export const scan = {\n  *unsafe(room) { return room.find(FIND_HOSTILE_CREEPS); },\n};\n`,
    );

    const result = runChecker(root);

    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /packages\/\@example\/runtime\/src\/generator\.ts:2/);
  });
});

test("alliance safety checker does not attach semicolonless safe finds to the next hostile constant", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/semicolonless.ts",
      `export const mine = room.find(FIND_MY_CREEPS)\nconst hostileConstant = FIND_HOSTILE_CREEPS;\n`,
    );

    const result = runChecker(root);

    assert.equal(result.status, 0, result.stderr);
  });
});

test("alliance safety checker ignores parentheses inside strings when ending safe multiline finds", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/string-parens.ts",
      `export const mine = room.find(\n  FIND_MY_CREEPS,\n  { filter: creep => creep.name.includes("(") },\n)\nconst hostileConstant = FIND_HOSTILE_CREEPS;\n`,
    );

    const result = runChecker(root);

    assert.equal(result.status, 0, result.stderr);
  });
});

test("alliance safety checker still catches unsafe finds after comment tokens inside strings", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/string-comments.ts",
      `export function unsafe(room) {\n  const marker = "/*";\n  const url = "https://example.invalid";\n  return room.find(FIND_HOSTILE_CREEPS);\n}\n`,
    );

    const result = runChecker(root);

    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /packages\/\@example\/runtime\/src\/string-comments\.ts:4/);
  });
});

test("alliance safety checker still catches same-line unsafe finds after string line-comment markers", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/string-line-comment.ts",
      `export function unsafe(room) {\n  const marker = "//"; return room.find(FIND_HOSTILE_CREEPS);\n}\n`,
    );

    const result = runChecker(root);

    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /packages\/\@example\/runtime\/src\/string-line-comment\.ts:2/);
  });
});

test("alliance safety checker catches unsafe finds inside template interpolation", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/template-expression.ts",
      "export function unsafe(room) {\n  return `${room.find(FIND_HOSTILE_CREEPS).length}`;\n}\n",
    );

    const result = runChecker(root);

    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /packages\/\@example\/runtime\/src\/template-expression\.ts:2/);
  });
});

test("alliance safety checker ignores hostile constants in comments", () => {
  withWorkspace(root => {
    writeRuntimeSource(
      root,
      "packages/@example/runtime/src/comments.ts",
      `// room.find(FIND_HOSTILE_CREEPS) is an example only.\n/*\nroom.find(\n  FIND_HOSTILE_CREEPS,\n);\n*/\nexport const ok = true;\nexport const mine = room.find(\n  FIND_MY_CREEPS, // docs mention FIND_HOSTILE_CREEPS only\n);\nconst hostileConstant = FIND_HOSTILE_CREEPS;\n`,
    );

    const result = runChecker(root);

    assert.equal(result.status, 0, result.stderr);
  });
});
