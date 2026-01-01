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

Under "Require status checks to pass before merging", search for and add the following checks:

#### Core Checks (Required)
- `test-bot` - Main bot tests with coverage
- `lint-bot` - ESLint checks for main bot

#### Package Test Matrix (All Required)
- `Test screeps-kernel`
- `Test screeps-roles`
- `Test screeps-pathfinding`
- `Test screeps-remote-mining`
- `Test screeps-spawn`
- `Test screeps-economy`
- `Test screeps-defense`
- `Test screeps-chemistry`
- `Test screeps-utils`
- `Test screeps-tasks`
- `Test screeps-posis`
- `Test screeps-server`

#### TypeCheck Matrix (All Required)
- `TypeCheck screeps-kernel`
- `TypeCheck screeps-roles`
- `TypeCheck screeps-pathfinding`
- `TypeCheck screeps-remote-mining`
- `TypeCheck screeps-spawn`
- `TypeCheck screeps-economy`
- `TypeCheck screeps-defense`
- `TypeCheck screeps-chemistry`
- `TypeCheck screeps-utils`
- `TypeCheck screeps-tasks`
- `TypeCheck screeps-posis`

#### Optional Checks
- `Check Bundle Sizes` - Informational only, can be non-blocking

**Total Required Checks**: 25 (2 core + 12 test + 11 typecheck)

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
3. Verify that the PR shows all 25 status checks
4. Confirm that merge is blocked until all checks pass

## Expected Behavior

Once configured, pull requests will:

1. **Show all required checks** in the PR status section
2. **Block merging** until all checks pass:
   - Main bot tests must pass
   - All 12 package tests must pass
   - All 11 package TypeScript builds must pass
   - Main bot linting must pass
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

**Problem**: 25 required checks seems like a lot

**Rationale**:
- Each check runs in parallel (fast)
- Each check tests a specific package (isolated)
- Failures are easy to debug (know exactly which package failed)
- Prevents broken packages from being merged

**Alternative**: If you prefer fewer checks, you could:
1. Make package tests informational only (not recommended)
2. Create a single "all packages" job that depends on the matrix
3. Require only that summary job (loses per-package visibility)

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

2. **Update test.yml** matrix:
   ```yaml
   - package-name: new-package
     workspace: "@ralphschuler/new-package"
     test-script: "test:new-package"
   ```

3. **Update lint.yml** matrix (if package has TypeScript):
   ```yaml
   - package-name: new-package
     workspace: "@ralphschuler/new-package"
   ```

4. **Update bundle-size.yml** array:
   ```bash
   "@ralphschuler/new-package:packages/@ralphschuler/new-package/dist:new-package"
   ```

5. **Update branch protection**:
   - Add `Test new-package` as required check
   - Add `TypeCheck new-package` as required check

### Removing Packages

When removing a package:

1. Remove from workflow matrix configurations
2. Remove from branch protection required checks
3. Update documentation

## Security Considerations

All workflows use minimal permissions (`contents: read`) to follow the principle of least privilege. This means:

- ✅ Workflows can read repository contents
- ❌ Workflows cannot write to repository
- ❌ Workflows cannot modify issues/PRs
- ❌ Workflows cannot trigger other workflows

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
