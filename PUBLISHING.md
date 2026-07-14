# Publishing Screeps Framework Packages

This guide covers the complete process for publishing framework packages to npm, both manually and via automated CI/CD workflows.

## Table of Contents

- [Overview](#overview)
- [Package Status](#package-status)
- [Prerequisites](#prerequisites)
- [Publishing Workflow](#publishing-workflow)
- [Manual Publishing](#manual-publishing)
- [Automated Publishing (CI/CD)](#automated-publishing-cicd)
- [Versioning Strategy](#versioning-strategy)
- [Pre-Publish Validation](#pre-publish-validation)
- [Troubleshooting](#troubleshooting)
- [Package Dependencies](#package-dependencies)

## Overview

Package manifests are the publication inventory. `scripts/publish-framework-package.mjs` selects packages that:

- use the `@ralphschuler/screeps-` prefix;
- are not marked `private`;
- expose both `main` and `types` entry points;
- have a publishable internal runtime-dependency closure.

List the current inventory and dependency-safe publication order without staging or publishing:

```bash
node scripts/publish-framework-package.mjs --list
node scripts/publish-framework-package.mjs --list --json
```

## Package Status

The following tested snapshot is kept in parity with manifest discovery:

<!-- framework-package-inventory:start -->

| Package                               | Exact dispatch scope | Version |
| ------------------------------------- | -------------------- | ------- |
| `@ralphschuler/screeps-core`          | `core`               | 0.1.0   |
| `@ralphschuler/screeps-kernel`        | `kernel`             | 0.1.0   |
| `@ralphschuler/screeps-cache`         | `cache`              | 0.1.0   |
| `@ralphschuler/screeps-chemistry`     | `chemistry`          | 0.1.0   |
| `@ralphschuler/screeps-console`       | `console`            | 0.1.0   |
| `@ralphschuler/screeps-layouts`       | `layouts`            | 0.1.0   |
| `@ralphschuler/screeps-stats`         | `stats`              | 0.2.0   |
| `@ralphschuler/screeps-memory`        | `memory`             | 0.1.0   |
| `@ralphschuler/screeps-defense`       | `defense`            | 0.1.0   |
| `@ralphschuler/screeps-economy`       | `economy`            | 0.1.0   |
| `@ralphschuler/screeps-empire`        | `empire`             | 0.1.0   |
| `@ralphschuler/screeps-intershard`    | `intershard`         | 0.1.0   |
| `@ralphschuler/screeps-pathfinding`   | `pathfinding`        | 0.1.0   |
| `@ralphschuler/screeps-utils`         | `utils`              | 0.1.0   |
| `@ralphschuler/screeps-pheromones`    | `pheromones`         | 0.1.0   |
| `@ralphschuler/screeps-posis`         | `posis`              | 1.0.0   |
| `@ralphschuler/screeps-remote-mining` | `remote-mining`      | 0.1.0   |
| `@ralphschuler/screeps-roles`         | `roles`              | 0.1.0   |
| `@ralphschuler/screeps-standards`     | `standards`          | 0.1.0   |

<!-- framework-package-inventory:end -->

Private packages, applications, and public packages with a private or otherwise ineligible internal runtime dependency are excluded automatically. Exact selection of an excluded package fails with the dependency reason. Do not infer npm registry status from this source inventory; verify a release with `npm view <package>`.

## Prerequisites

Before you can publish packages to npm, ensure you have:

### 1. npm Account Setup

- npm account with access to `@ralphschuler` scope
- Two-factor authentication (2FA) enabled on your npm account
- Authentication token with publish permissions

To create an npm token:

```bash
npm login
npm token create --read-write
```

### 2. Local Environment

- Node.js 24.x (as specified in package.json engines)
- npm 10.0.0 or higher
- Git repository cloned locally

### 3. CI/CD Secrets (for automated publishing)

Configure the following GitHub secrets:

- `NPM_TOKEN` - npm authentication token with publish permissions

To add secrets in GitHub:

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`, Value: your npm token

### 4. Repository Permissions

- Write access to the repository
- Permission to create GitHub releases
- Permission to push tags

## Publishing Workflow

### High-Level Process

1. **Prepare Release**
   - Update version in package.json
   - Update CHANGELOG.md
   - Run tests and validation
   - Commit changes

2. **Create Tag**
   - Tag release in git
   - Push tag to GitHub

3. **Publish**
   - Manual: Run `npm publish` locally
   - Automated: GitHub Actions workflow triggers on tag/release

4. **Verify**
   - Check npm registry
   - Test installation
   - Update documentation

## Manual Publishing

For testing or emergency releases, you can publish manually:

### Step-by-Step Manual Process

#### 1. Update Version

Choose the appropriate version bump:

- **Patch** (0.1.0 → 0.1.1): Bug fixes, no API changes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

```bash
cd packages/@ralphschuler/screeps-kernel
npm version patch  # or minor, or major
```

This automatically:

- Updates package.json version
- Creates a git commit
- Creates a git tag

#### 2. Update CHANGELOG

Edit `CHANGELOG.md` to document changes:

```markdown
## [0.1.1] - 2026-01-02

### Fixed

- Fixed CPU budget calculation edge case
- Corrected process priority sorting

### Added

- New debug logging options
```

#### 3. Build the Package

```bash
npm run build
```

Verify the build output in `dist/`:

```bash
ls -la dist/
```

#### 4. Run Tests

```bash
npm test
```

All tests must pass before publishing.

#### 5. Validate Package Contents

Preview the normalized publish artifact:

```bash
node scripts/publish-framework-package.mjs --package packages/@ralphschuler/screeps-kernel --dry-run
```

This stages the package, rewrites internal monorepo dependency ranges to concrete package versions, and runs the same normalized packaging path used by CI checks and release publishing.

#### 6. Test Local Installation

Create a test package and install:

```bash
node scripts/publish-framework-package.mjs --package packages/@ralphschuler/screeps-kernel --check --stage-root /tmp/screeps-publish-check --keep-stage
cd /tmp
mkdir test-install
cd test-install
npm init -y
npm install /tmp/screeps-publish-check/scope_ralphschuler__screeps-kernel/verify-pack/ralphschuler-screeps-kernel-<version>.tgz
```

Verify the package works:

```bash
node -e "const kernel = require('@ralphschuler/screeps-kernel'); console.log(kernel);"
```

#### 7. Publish to npm

```bash
node scripts/publish-framework-package.mjs --package packages/@ralphschuler/screeps-kernel --publish --access public
```

For scoped packages (`@ralphschuler/*`), the script passes `--access public` and publishes from the normalized staging directory.

#### 8. Verify Publication

Check the package on npm:

```bash
npm view @ralphschuler/screeps-kernel
```

Visit the npm page:

```
https://www.npmjs.com/package/@ralphschuler/screeps-kernel
```

#### 9. Push Changes to GitHub

```bash
git push origin main
git push origin --tags
```

### Publishing Multiple Packages

To publish all packages at once:

```bash
# From repository root
npm run build
npm run test:all
npm run publish:framework:check
node scripts/publish-framework-package.mjs --all --publish --access public
```

## Automated Publishing (CI/CD)

The repository includes a GitHub Actions workflow for automated publishing.

### Workflow File

Location: `.github/workflows/publish-framework.yml`

### Trigger Methods

#### 1. Manual Workflow Dispatch

Publish specific packages on demand:

1. Go to GitHub Actions → Publish Framework Packages.
2. Click "Run workflow".
3. Enter `all` or one exact dispatch scope from the tested inventory above.
4. Click "Run workflow".

The helper rejects unknown, partial, private, or otherwise ineligible scopes before the build. Scope matching is exact; for example, `empire` selects only `@ralphschuler/screeps-empire`.

#### 2. GitHub Release

Create a GitHub release to publish all packages:

1. Go to Releases → Create new release
2. Create a new tag (e.g., `v1.0.0`)
3. Title: "v1.0.0 - Release name"
4. Description: Release notes
5. Click "Publish release"

The workflow automatically publishes all non-private packages.

#### 3. Version Tags (Planned)

Future enhancement: Push version tags to trigger publishing:

```bash
git tag @ralphschuler/screeps-kernel@1.0.0
git push origin @ralphschuler/screeps-kernel@1.0.0
```

### Workflow Steps

The automated workflow performs:

1. ✅ Checkout code
2. ✅ Setup Node.js 24
3. ✅ Install dependencies
4. ✅ Validate the manifest-driven `all` set or one exact manual scope
5. ✅ Build all packages
6. ✅ Run all workspace tests once
7. ✅ Stage selected packages in dependency-safe order
8. ✅ Normalize internal monorepo dependency ranges in each staged manifest
9. ✅ Publish to npm with provenance

Use `npm run publish:framework:dry-run` locally for non-publishing validation; the release workflow has no unreachable PR dry-run branch.

### Workflow Security

- Uses npm provenance for supply chain security
- Requires `NPM_TOKEN` secret
- Uses OpenID Connect (OIDC) for authentication
- Only triggers on releases or manual dispatch

## Versioning Strategy

We follow [Semantic Versioning 2.0.0](https://semver.org/):

### Version Format: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes that require user code updates
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes that are backward compatible

### Version Guidelines

#### Increment PATCH (0.1.0 → 0.1.1)

- Bug fixes
- Performance improvements (no API changes)
- Documentation updates
- Internal refactoring (no API changes)

Examples:

- Fix CPU budget calculation bug
- Optimize pathfinding cache lookup
- Fix typos in README

#### Increment MINOR (0.1.0 → 0.2.0)

- New features (backward compatible)
- New public APIs or methods
- Deprecation warnings (but functionality still works)
- New optional parameters

Examples:

- Add new event type to kernel
- Add portal cache invalidation method
- Add new behavior to roles package

#### Increment MAJOR (0.1.0 → 1.0.0)

- Breaking API changes
- Removed deprecated features
- Changed method signatures
- Changed default behavior
- Renamed exports

Examples:

- Remove deprecated `kernel.legacy()` method
- Change `PortalManager` constructor signature
- Rename `execute()` to `run()` in Process interface

### Pre-Release Versions

For alpha/beta releases:

- **Alpha**: `1.0.0-alpha.1`, `1.0.0-alpha.2`
- **Beta**: `1.0.0-beta.1`, `1.0.0-beta.2`
- **Release Candidate**: `1.0.0-rc.1`, `1.0.0-rc.2`

Publish pre-releases with:

```bash
npm publish --tag alpha
npm publish --tag beta
npm publish --tag rc
```

### Version 0.x.y (Initial Development)

Current state: All packages are `0.x.y`

Meaning:

- APIs may change without warning
- No guarantee of backward compatibility
- Not recommended for production use

Once stable, promote to `1.0.0`.

### Version Compatibility

Package manifests are authoritative for compatibility ranges. Inspect the current framework manifests with `npm query '[name^="@ralphschuler/screeps-"]'` and validate normalized publish artifacts with `npm run publish:framework:check`; do not duplicate a static compatibility matrix here.

## Pre-Publish Validation

Before publishing, always verify:

### 1. Package Build

```bash
npm run build
```

Check for TypeScript errors:

```bash
tsc --noEmit
```

### 2. Tests Pass

```bash
npm test
```

All tests must pass. If tests fail, fix them before publishing.

### 3. Package Contents

Verify the publish staging path and packed manifests:

```bash
npm run publish:framework:check
```

This fails if any packed package manifest still contains `workspace:*` or an internal `@ralphschuler/screeps-*` wildcard dependency.

Should NOT include:

- `src/` (only `dist/` should be published)
- `test/`
- `.github/`
- `node_modules/`
- `*.test.ts`
- `tsconfig.json`

SHOULD include:

- `dist/`
- `README.md`
- `LICENSE`
- `CHANGELOG.md`
- `package.json`

### 4. Package Metadata

Verify package.json has:

- ✅ Correct version number
- ✅ Complete description
- ✅ Keywords for discoverability
- ✅ Repository URL
- ✅ Bugs URL
- ✅ Homepage URL
- ✅ License
- ✅ Main entry point (`dist/index.js`)
- ✅ TypeScript types (`dist/index.d.ts`)

### 5. Documentation

- ✅ README.md is up-to-date
- ✅ API documentation matches code
- ✅ Examples work with current version
- ✅ CHANGELOG.md documents changes

### 6. Dependencies

Check for:

- No broken dependencies
- Peer dependencies correctly specified
- Version ranges are appropriate

```bash
npm ls
```

### 7. License Files

Each package must have:

- LICENSE file (Unlicense)
- Correct license field in package.json

### Pre-Publish Checklist Script

Create a validation script (future enhancement):

```bash
#!/bin/bash
# scripts/validate-package.sh

echo "🔍 Validating package for publishing..."

# Check version updated
if git diff HEAD^ HEAD -- package.json | grep -q '"version"'; then
  echo "✅ Version updated"
else
  echo "❌ Version not updated"
  exit 1
fi

# Build
echo "🔨 Building..."
npm run build || exit 1

# Test
echo "🧪 Testing..."
npm test || exit 1

# Pack dry-run
echo "📦 Checking package contents..."
npm pack --dry-run

echo "✅ Package validation complete!"
```

## Troubleshooting

### Common Issues

#### Issue: "You do not have permission to publish"

**Solution:**

- Verify you're logged in: `npm whoami`
- Check you have access to `@ralphschuler` scope
- Verify `NPM_TOKEN` secret is set correctly
- Ensure 2FA is configured

#### Issue: "Version already published"

**Solution:**

- Check current version on npm: `npm view @ralphschuler/screeps-kernel version`
- Bump version: `npm version patch`
- Cannot republish same version - must increment

#### Issue: "Package not found" after publishing

**Solution:**

- Wait 1-2 minutes for npm CDN to update
- Check npm website directly
- Clear npm cache: `npm cache clean --force`

#### Issue: Build fails with missing dependencies

**Solution:**

- Run `npm run build:all` from repository root
- Ensure internal packages are built first
- Check package.json `peerDependencies`

#### Issue: Tests fail in CI but pass locally

**Solution:**

- Check Node.js version matches CI and repository baseline (Node.js 24.x / `>=24 <25`)
- Ensure all devDependencies are installed
- Look for environment-specific issues

#### Issue: "ENEEDAUTH" error

**Solution:**

- Re-login: `npm login`
- Regenerate token: `npm token create`
- Update `NPM_TOKEN` secret in GitHub

### Debug Commands

Check npm configuration:

```bash
npm config list
```

Verify authentication:

```bash
npm whoami
```

Check package info:

```bash
npm view @ralphschuler/screeps-kernel
```

List your published packages:

```bash
npm access ls-packages
```

## Package Dependencies

### Dependency Graph and Publishing Order

Do not maintain a second hand-written dependency graph. The publication helper reads current `dependencies`, `peerDependencies`, and `optionalDependencies` from eligible manifests, then applies a deterministic topological order. Dependencies selected in the same run are published before their dependents; cycles fail before any package is staged.

Inspect the exact current order with:

```bash
node scripts/publish-framework-package.mjs --list
```

`--all` and multiple `--package` selections use this same order. Packages with private or otherwise ineligible internal runtime dependencies are excluded from `--all` and rejected by exact selection, so a release cannot publish an unusable dependency closure. Package authors must still run `npm run publish:framework:check` before release.

### Internal Package References

When one package depends on another from the same monorepo, keep the source manifest on the repository-local range:

```json
{
  "dependencies": {
    "@ralphschuler/screeps-defense": "*"
  }
}
```

Do not publish that source manifest directly. Use the publish staging script:

```bash
node scripts/publish-framework-package.mjs --package packages/@ralphschuler/screeps-roles --dry-run
node scripts/publish-framework-package.mjs --package packages/@ralphschuler/screeps-roles --publish --access public
```

The staging script packs the source package, extracts it, rewrites internal `@ralphschuler/screeps-*` dependencies from `*`/`workspace:*` to the current concrete package versions, repacks for validation, and publishes from the normalized staging directory. Source manifests remain unchanged.

### External Dependencies

Current external framework dependency:

- `screeps-cartographer: ^1.8.15` (runtime or peer dependency, depending on package)

When adding new external dependencies:

1. Verify package is maintained
2. Use semantic version ranges
3. Add to both `dependencies` and `peerDependencies` as appropriate
4. Document in FRAMEWORK.md

## Best Practices

### Before Publishing

1. ✅ Run full test suite
2. ✅ Build and verify output
3. ✅ Update CHANGELOG.md
4. ✅ Review package.json metadata
5. ✅ Test installation locally
6. ✅ Check for breaking changes
7. ✅ Update version according to semver

### After Publishing

1. ✅ Verify on npm registry
2. ✅ Test installation from npm
3. ✅ Update FRAMEWORK.md if needed
4. ✅ Create GitHub release
5. ✅ Announce in community channels (if major release)

### Security

1. ✅ Enable npm 2FA
2. ✅ Use npm provenance (`--provenance` flag)
3. ✅ Keep `NPM_TOKEN` secret secure
4. ✅ Review dependencies for vulnerabilities
5. ✅ Sign git tags for releases

### Documentation

1. ✅ Keep README.md current
2. ✅ Document breaking changes prominently
3. ✅ Provide migration guides for major versions
4. ✅ Include code examples that work
5. ✅ Link to live demo/examples if available

## Next Steps

After initial publishing:

1. **Monitor adoption**: Track npm download stats
2. **Gather feedback**: Create issue templates for bug reports
3. **Version planning**: Plan roadmap for 1.0.0 stable release
4. **Documentation**: Expand guides and tutorials
5. **Examples**: Create more example bots using packages
6. **Automation**: Improve CI/CD workflows
7. **Community**: Engage with users, accept PRs

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Actions](https://docs.github.com/actions)

## Support

For questions or issues:

- GitHub Issues: https://github.com/ralphschuler/screeps/issues
- GitHub Discussions: https://github.com/ralphschuler/screeps/discussions
