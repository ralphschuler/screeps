# Branch Protection Setup Guide

This guide explains how to configure GitHub branch protection rules to enforce the new quality gates.

## Prerequisites

- Repository admin access
- Quality gate workflows merged to main branch
- At least one successful CI run to verify workflow names

## Branch Protection Configuration

### Step 1: Access Branch Protection Settings

1. Go to repository **Settings**
2. Click **Branches** in the left sidebar
3. Under "Branch protection rules", click **Add rule** (or edit the existing `main` rule)

### Step 2: Configure Basic Protection

**Branch name pattern**: `main`

Enable the following:
- ✅ **Require a pull request before merging**
  - Require approvals: 1 (recommended)
  - Dismiss stale pull request approvals when new commits are pushed (recommended)
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging (recommended)
- ✅ **Require conversation resolution before merging** (optional but recommended)

### Step 3: Add Required Status Checks

Under "Require status checks to pass before merging", search for and add the current modular checks after they have appeared on at least one PR:

#### Core Checks (Required)
- `Build and Typecheck` - Builds framework/bot and runs workspace typecheck (`ci.yml`).
- `Bot and Script Tests` - Runs script tests and main bot tests (`ci.yml`).
- `Dependency Sync Check` - Verifies framework dependency synchronization (`ci.yml`).
- `Check Alliance Safety` - Guards against hostile behavior toward configured allies (`quality.yml`).

#### Package Lint Matrix (Required)
- `Lint screeps-cache`
- `Lint screeps-chemistry`
- `Lint screeps-clusters`
- `Lint screeps-console`
- `Lint screeps-core`
- `Lint screeps-defense`
- `Lint screeps-economy`
- `Lint screeps-empire`
- `Lint screeps-intershard`
- `Lint screeps-kernel`
- `Lint screeps-layouts`
- `Lint screeps-memory`
- `Lint screeps-pathfinding`
- `Lint screeps-pheromones`
- `Lint screeps-posis`
- `Lint screeps-remote-mining`
- `Lint screeps-roles`
- `Lint screeps-spawn`
- `Lint screeps-standards`
- `Lint screeps-stats`
- `Lint screeps-utils`
- `Lint screeps-visuals`
- `Lint screeps-bot`

The lint matrix covers every workspace with a `lint` script and enforces `--max-warnings=0`. Workspaces intentionally outside this matrix because they do not currently expose standalone lint scripts:
- `@ralphschuler/screeps-server` — private-server harness/integration package covered by typecheck and server test workflows.
- `screepsmod-testing` — local test mod package covered by its TypeScript build path.

#### Runtime Checks (Required for runtime-changing PRs)
- `Real private-server smoke` - Private-server smoke test (`integration-tests.yml`).
- `Check for Code Divergence` - Framework-first role ownership guard (`framework-sync-check.yml`).

#### Optional Checks
- `Check Code Duplication` - Transitional informational quality gate.
- `Check Code Complexity` - Transitional informational quality gate.

**Total Required Checks**: 27 when all modular workflows apply (4 core + 23 lint), plus runtime checks for path-matched PRs.

### Step 4: Additional Recommended Settings

Enable the following for maximum protection:
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict who can push to matching branches**
  - Add only deployment/bot accounts if needed
- ❌ **Allow force pushes** - Keep disabled for safety
- ❌ **Allow deletions** - Keep disabled for safety

### Step 5: Save and Verify

1. Click **Create** (or **Save changes**)
2. Create a test PR to verify all checks are required
3. Verify that the PR shows the configured modular status checks
4. Confirm that merge is blocked until all required checks pass

## Expected Behavior

Once configured, pull requests will:

1. **Show all required checks** in the PR status section
2. **Block merging** until all required checks pass:
   - Build/typecheck must pass
   - Bot and script tests must pass
   - Dependency sync must pass
   - Alliance safety must pass
   - Package lint checks must pass
   - Runtime smoke/divergence checks must pass when their path filters apply
3. **Display clear status** for each check with links to CI logs
4. **Require branch to be up to date** with main before merging

## Troubleshooting

### Check Names Don't Appear

**Problem**: Status check names don't show up in the list

**Solution**:
1. Ensure workflows have run at least once on a PR
2. Check that workflow job names match exactly (case-sensitive)
3. Verify workflows are on the `main` branch

### Too Many Checks Required

**Problem**: The modular required checks feel noisy.

**Rationale**:
- Core build/test/dependency checks catch repo-wide breakage.
- Package lint checks keep failures easy to localize.
- Runtime smoke checks only run for path-matched runtime changes.

**Alternative**: If you prefer fewer checks, you could:
1. Require only `Build and Typecheck`, `Bot and Script Tests`, `Dependency Sync Check`, and `Check Alliance Safety`.
2. Leave package lint and transitional quality reports informational.
3. Add a dedicated summary job later if branch protection needs one stable required context.

### Checks Sometimes Don't Run

**Problem**: Some checks don't run on certain PRs

**Possible causes**:
1. **Workflow filters**: Check that workflows run on `pull_request` events
2. **Path filters**: Ensure no path filters exclude relevant changes
3. **Matrix configuration**: Verify matrix includes all packages

**Solution**: Review workflow `on:` triggers and ensure they include:
```yaml
on:
  pull_request:
  push:
    branches:
      - main
```

### Bundle Size Check Keeps Failing

**Problem**: Bundle size check fails frequently

**Note**: Bundle size is currently **informational only** and doesn't fail CI. If you want to make it blocking:

1. Add size limits to the workflow
2. Compare against baseline
3. Fail if size increases beyond threshold
4. Document expected sizes in QUALITY_GATES.md

## Maintenance

### Adding New Packages

When adding a new package with tests:

1. **Add test script** to root `package.json`:
   ```json
   "test:new-package": "npm test -w @ralphschuler/new-package"
   ```

2. **Confirm `ci.yml` still covers the package** through `npm run build` and `npm run typecheck`. Add package-specific root scripts when the package needs targeted test coverage before `npm run test:all` is fully reliable.

3. **Update `quality.yml` lint matrix** if the package has a standalone lint script:
   ```yaml
   - package-name: new-package
     workspace: "@ralphschuler/new-package"
   ```
   Keep local coverage synchronized through `npm run lint:all` and `scripts/test/lint-workspace-coverage.test.mjs`.

4. **Document any workspace without a lint script** in the package-lint exclusion note above, or add a lint script before merging.

5. **Update `integration-tests.yml` path filters** if the package affects runtime behavior and should trigger private-server smoke tests.

6. **Update branch protection** if new job names are added. The shared `Build and Typecheck` job usually covers new packages without adding per-package required checks; add targeted test jobs only when needed.

### Removing Packages

When removing a package:

1. Remove from workflow matrix configurations
2. Remove from branch protection required checks
3. Update documentation

## Security Considerations

Validation workflows should use minimal permissions (`contents: read`) whenever possible. Workflows that deploy, release, or comment on PRs may need explicit write scopes. This means:

- ✅ Validation workflows can read repository contents
- ✅ Release/deploy/automation workflows may write only where explicitly configured
- ❌ New workflows should not gain issue/PR/check write permissions by default
- ❌ Workflows should not trigger other workflows unless that is a documented requirement

If you need additional permissions for future workflows, add them explicitly:

```yaml
permissions:
  contents: read      # Read repository
  pull-requests: write # Comment on PRs (if needed)
  checks: write       # Create check runs (if needed)
```

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
- [Workflow Permissions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions)

## Summary

With branch protection configured, the repository will have:

✅ **Automated quality gates** enforced before merge
✅ **Per-package test isolation** for easier debugging
✅ **TypeScript compilation checks** for all packages
✅ **Bundle size visibility** for performance monitoring
✅ **Security best practices** with minimal permissions
✅ **Professional CI/CD** comparable to major open-source projects

This ensures that the main branch always contains working, tested, type-safe code.
