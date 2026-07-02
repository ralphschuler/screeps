import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../..", import.meta.url);

function workflowPath(filename) {
  return new URL(`.github/workflows/${filename}`, `${root}/`);
}

test("legacy zero-job workflows stay retired or replaced by modular workflows", () => {
  const retiredWorkflows = ["auto-merge.yml", "post-deployment-monitoring.yml"];

  for (const workflow of retiredWorkflows) {
    assert.equal(
      existsSync(workflowPath(workflow)),
      false,
      `${workflow} should stay retired because it produced zero-job failed GitHub Actions runs`,
    );
  }

  const replacementWorkflows = [
    "ci.yml",
    "quality.yml",
    "integration-tests.yml",
    "framework-sync-check.yml",
    "release.yml",
    "deploy.yml",
    "auto-merge-dependabot.yml",
  ];

  for (const workflow of replacementWorkflows) {
    assert.equal(existsSync(workflowPath(workflow)), true, `${workflow} should exist as a modular replacement`);
  }

  const ciWorkflow = readFileSync(workflowPath("ci.yml"), "utf8");

  assert.match(ciWorkflow, /build-and-typecheck:/, "ci.yml should retain build/typecheck coverage with an actionable job");
  assert.match(ciWorkflow, /bot-and-script-tests:/, "ci.yml should retain bot/script test coverage with an actionable job");
  assert.match(ciWorkflow, /dependency-sync:/, "ci.yml should retain dependency sync coverage with an actionable job");
  assert.doesNotMatch(ciWorkflow, /if:\s*[^\n]*secrets\./, "ci.yml should not use secrets context in step or job if expressions");
});
