import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateStructuralSnapshotHealth,
  formatStructuralSnapshotCliError,
  parseOptions,
  redactedSnapshotError
} from "../../packages/screeps-server/scripts/export-live-structural-snapshot.js";

const RATE_LIMIT_MESSAGE = [
  "Rate limit exceeded, retry after 123ms or disable rate limiting using this link:",
  "https://screeps.com/a/#!/account/auth-tokens/noratelimit?token=6ea62d57"
].join(" ");

test("structural snapshot memory errors redact Screeps API token fragments", () => {
  const entry = redactedSnapshotError({ type: "memory", path: "stats" }, new Error(RATE_LIMIT_MESSAGE));

  assert.equal(entry.type, "memory");
  assert.equal(entry.path, "stats");
  assert.equal(entry.message.includes("6ea62d57"), false);
  assert.equal(entry.message.includes("token=<redacted>"), true);
});

test("structural snapshot room endpoint errors redact token fragments", () => {
  for (const fields of [
    { type: "roomStatus", room: "W1N1" },
    { type: "roomObjects", room: "W1N1" }
  ]) {
    const entry = redactedSnapshotError(fields, `X-Token: abc123 ${RATE_LIMIT_MESSAGE} SCREEPS_TOKEN=secret123`);

    assert.equal(entry.type, fields.type);
    assert.equal(entry.room, "W1N1");
    assert.equal(entry.message.includes("abc123"), false);
    assert.equal(entry.message.includes("secret123"), false);
    assert.equal(entry.message.includes("6ea62d57"), false);
    assert.equal(entry.message.includes("token=<redacted>"), true);
  }
});

test("structural snapshot top-level CLI errors redact token fragments", () => {
  const error = new Error(`X-Token: abc123 ${RATE_LIMIT_MESSAGE}`);
  error.stack = `Error: X-Token: abc123 SCREEPS_TOKEN=secret123 ${RATE_LIMIT_MESSAGE}\n    at fetch (https://screeps.com/api/user/memory?access_token=abcd&path=stats)`;

  const message = formatStructuralSnapshotCliError(error);

  assert.equal(message.includes("abc123"), false);
  assert.equal(message.includes("secret123"), false);
  assert.equal(message.includes("6ea62d57"), false);
  assert.equal(message.includes("access_token=abcd"), false);
  assert.equal(message.includes("token=<redacted>"), true);
  assert.equal(message.includes("access_token=<redacted>"), true);
  assert.equal(message.includes("path=stats"), true);
});

test("structural snapshot top-level CLI errors redact non-Error token fragments", () => {
  const message = formatStructuralSnapshotCliError(`X-Token: abc123 ${RATE_LIMIT_MESSAGE} SCREEPS_TOKEN=secret123`);

  assert.equal(message.includes("abc123"), false);
  assert.equal(message.includes("secret123"), false);
  assert.equal(message.includes("6ea62d57"), false);
  assert.equal(message.includes("token=<redacted>"), true);
});

test("structural snapshot parser supports deploy-gate memory error failure flag", () => {
  const options = parseOptions(["--shard", "shard3", "--rooms", "W1N1,W2N2", "--fail-on-memory-errors"], {
    SCREEPS_HOSTNAME: "screeps.com",
    SCREEPS_PROTOCOL: "https",
    SCREEPS_PORT: "443"
  });

  assert.equal(options.shard, "shard3");
  assert.deepEqual(options.rooms, ["W1N1", "W2N2"]);
  assert.equal(options.failOnMemoryErrors, true);
});

test("structural snapshot health fails only when requested memory errors are present", () => {
  const snapshot = {
    errors: [
      { type: "memory", path: "stats", message: "Rate limit exceeded token=<redacted>" },
      { type: "roomObjects", room: "W1N1", message: "timeout" }
    ]
  };

  const strict = evaluateStructuralSnapshotHealth(snapshot, { failOnMemoryErrors: true });
  assert.equal(strict.ok, false);
  assert.equal(strict.status, "failed");
  assert.equal(strict.memory_errors, 1);
  assert.equal(strict.total_errors, 2);
  assert.match(strict.message, /Memory API errors/);

  const degraded = evaluateStructuralSnapshotHealth(snapshot, { failOnMemoryErrors: false });
  assert.equal(degraded.ok, true);
  assert.equal(degraded.status, "degraded");
  assert.equal(degraded.memory_errors, 1);
});
