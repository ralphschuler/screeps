import assert from "node:assert/strict";
import test from "node:test";

import { redactedSnapshotError } from "../../packages/screeps-server/scripts/export-live-structural-snapshot.js";

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
