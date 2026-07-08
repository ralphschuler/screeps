import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

function checkIgnored(paths) {
  const result = spawnSync("git", ["check-ignore", "--stdin"], {
    cwd: new URL("../..", import.meta.url),
    input: `${paths.join("\n")}\n`,
    encoding: "utf8"
  });
  return result.stdout.trim().split("\n").filter(Boolean);
}

test("generated live and deploy artifacts are ignored by default", () => {
  const generatedPaths = [
    ".tmp/live-comment.md",
    "artifacts/agent/open-issues.json",
    "artifacts/subagents/issue-triage.md",
    "artifacts/autonomous-live-20260707T000000Z/summary.json",
    "artifacts/code-refinement-20260707-pr9999.md",
    "artifacts/code-refinement-20260707-pr9999/report.json",
    "artifacts/cpu-profile/live-cpu-profile.json",
    "artifacts/cpu-profile-20260707T000000Z/live-cpu-profile.json",
    "artifacts/deploy-3303-20260707T000000Z/push.log",
    "artifacts/issue-3224-check/log.txt",
    "artifacts/live-500-2026-07-07T00-00-00Z/summary.md",
    "artifacts/live-analysis-20260707T000000Z/summary.json",
    "artifacts/live-analysis-current.json",
    "artifacts/postdeploy-3303-verify/summary.json",
    "artifacts/postdeploy-3303-verify-20260707T000000Z.stderr.txt",
    "artifacts/postdeploy-3303-verify-20260707T000000Z.stdout.json",
    "artifacts/triage-scout-20260707.md",
    "packages/screeps-server/artifacts/smoke/summary.json"
  ];

  assert.deepEqual(checkIgnored(generatedPaths), generatedPaths);
});

test("curated artifact notes and docs remain addable without force", () => {
  const curatedPaths = [
    "artifacts/curated-evidence-note.md",
    "artifacts/review/evidence.md",
    "docs/operations/artifact-policy.md"
  ];

  assert.deepEqual(checkIgnored(curatedPaths), []);
});
