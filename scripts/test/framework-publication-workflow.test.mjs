import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../..", import.meta.url);
const releaseWorkflow = readFileSync(
  new URL(".github/workflows/release.yml", root),
  "utf8",
);
const publishWorkflow = readFileSync(
  new URL(".github/workflows/publish-framework.yml", root),
  "utf8",
);

test("release hands trusted successful runs to the reusable framework publisher", () => {
  assert.match(releaseWorkflow, /publish-framework:\n[\s\S]*needs: release/);
  assert.match(
    releaseWorkflow,
    /if: >-\n\s+github\.event_name == 'push' && github\.ref == 'refs\/heads\/main' &&\n\s+needs\.release\.result == 'success' && github\.run_attempt == 1/,
  );
  assert.match(
    releaseWorkflow,
    /uses: \.\/\.github\/workflows\/publish-framework\.yml/,
  );
  assert.match(releaseWorkflow, /secrets: inherit/);
  assert.match(releaseWorkflow, /id-token: write/);
});

test("framework publication is reusable and has no token-suppressed release trigger", () => {
  assert.match(publishWorkflow, /workflow_call:/);
  assert.match(publishWorkflow, /NPM_TOKEN:\n\s+required: true/);
  assert.doesNotMatch(publishWorkflow, /^\s+release:\s*$/m);
  assert.match(publishWorkflow, /if: github\.event_name == 'workflow_call'/);
});

test("trusted publication keeps manifest selection and npm provenance", () => {
  assert.match(
    publishWorkflow,
    /run: node scripts\/publish-framework-package\.mjs --list --all --json/,
  );
  assert.match(
    publishWorkflow,
    /run: node scripts\/publish-framework-package\.mjs --all --publish --access public --provenance/,
  );
  assert.match(
    publishWorkflow,
    /NODE_AUTH_TOKEN: \$\{\{ secrets\.NPM_TOKEN \}\}/,
  );
});

test("manual package selection remains explicit and bounded", () => {
  assert.match(publishWorkflow, /inputs\.publish_scope != 'all'/);
  assert.match(publishWorkflow, /--package \"\$PUBLISH_SCOPE\" --json/);
  assert.match(
    publishWorkflow,
    /--package \"\$PUBLISH_SCOPE\" --publish --access public --provenance/,
  );
});
