import assert from "node:assert/strict";
import test from "node:test";

import { redactScreepsApiMessage } from "../live-cpu-profile.mjs";

test("redacts Screeps no-rate-limit token URL fragments", () => {
  const message = [
    "Rate limit exceeded, retry after 123ms or disable rate limiting using this link:",
    "https://screeps.com/a/#!/account/auth-tokens/noratelimit?token=6ea62d57"
  ].join(" ");

  const redacted = redactScreepsApiMessage(message);

  assert.equal(redacted.includes("6ea62d57"), false);
  assert.equal(redacted.includes("token=<redacted>"), true);
  assert.match(redacted, /Rate limit exceeded/);
});

test("redacts common token-bearing error formats", () => {
  const message = [
    "X-Token: abc123",
    "SCREEPS_TOKEN=secret123",
    "https://screeps.com/api/user/memory?access_token=abcd&path=stats"
  ].join(" ");

  const redacted = redactScreepsApiMessage(message);

  assert.equal(redacted.includes("abc123"), false);
  assert.equal(redacted.includes("secret123"), false);
  assert.equal(redacted.includes("access_token=abcd"), false);
  assert.equal(redacted.includes("path=stats"), true);
});
