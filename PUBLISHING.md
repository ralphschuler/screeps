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

The Screeps framework consists of 7 reusable packages published under the `@ralphschuler` npm scope:

1. **@ralphschuler/screeps-kernel** - Process scheduler with CPU budget management
2. **@ralphschuler/screeps-pathfinding** - Advanced pathfinding utilities
3. **@ralphschuler/screeps-remote-mining** - Remote mining system
4. **@ralphschuler/screeps-roles** - Reusable role behaviors
5. **@ralphschuler/screeps-console** - Console command framework
6. **@ralphschuler/screeps-stats** - Stats collection and export
7. **@ralphschuler/screeps-visuals** - Visualization system (private, not published)

## Package Status

| Package | npm Published | Version | Build Status | Tests | License |
|---------|--------------|---------|--------------|-------|---------|
| screeps-kernel | ❌ Not yet | 0.1.0 | ✅ Working | ✅ Passing | Unlicense |
| screeps-pathfinding | ❌ Not yet | 0.1.0 | ✅ Working | ✅ Passing | Unlicense |
| screeps-remote-mining | ❌ Not yet | 0.1.0 | ✅ Working | ✅ Passing | Unlicense |
| screeps-roles | ❌ Not yet | 0.1.0 | ⚠️ Broken* | ✅ Passing | Unlicense |
| screeps-console | ❌ Not yet | 0.1.0 | ✅ Working | ✅ Passing | Unlicense |
| screeps-stats | ❌ Not yet | 0.1.0 | ✅ Working | ✅ Passing | Unlicense |
| screeps-visuals | N/A (private) | 0.1.0 | ✅ Working | ✅ Passing | Unlicense |

*Note: Build issues tracked in [#1010](https://github.com/ralphschuler/screeps/issues/1010)

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

- Node.js 16.x or 18.x (as specified in package.json engines)
- npm 8.0.0 or higher
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

Preview what will be published:

```bash
npm pack --dry-run
```

This shows exactly which files will be included in the published package.

#### 6. Test Local Installation

Create a test package and install:

```bash
npm pack
cd /tmp
mkdir test-install
cd test-install
npm init -y
npm install /path/to/ralphschuler-screeps-kernel-0.1.1.tgz
```

Verify the package works:
```bash
node -e "const kernel = require('@ralphschuler/screeps-kernel'); console.log(kernel);"
```

#### 7. Publish to npm

```bash
npm publish --access public
```

For scoped packages (`@ralphschuler/*`), you must use `--access public` unless you have a paid npm account.

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
for pkg in kernel pathfinding remote-mining roles console stats; do
  echo "Publishing screeps-$pkg..."
  cd packages/@ralphschuler/screeps-$pkg
  npm version patch
  npm run build
  npm test
  npm publish --access public
  cd ../../..
done
```

## Automated Publishing (CI/CD)

The repository includes a GitHub Actions workflow for automated publishing.

### Workflow File

Location: `.github/workflows/publish-framework.yml`

### Trigger Methods

#### 1. Manual Workflow Dispatch

Publish specific packages on demand:

1. Go to GitHub Actions → Publish Framework Packages
2. Click "Run workflow"
3. Select scope: `all`, `kernel`, `pathfinding`, etc.
4. Click "Run workflow"

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
2. ✅ Setup Node.js 18
3. ✅ Install dependencies
4. ✅ Build all packages (ensures dependencies are available)
5. ✅ Run tests
6. ✅ Check if package is publishable (skip if `private: true`)
7. ✅ Publish to npm with provenance
8. ✅ Dry-run mode for PRs (doesn't actually publish)

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

Maintain this compatibility matrix in FRAMEWORK.md:

| Package | Depends On | Compatible Versions |
|---------|-----------|---------------------|
| screeps-roles | screeps-defense | 0.1.x |
| screeps-remote-mining | screeps-cartographer | ^1.8.13 |
| screeps-pathfinding | screeps-cartographer | ^1.8.13 |

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

Verify `.npmignore` excludes dev files:

```bash
npm pack --dry-run
```

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
- Check Node.js version matches CI (18.x)
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

### Dependency Graph

```
screeps-kernel (standalone)
├── No dependencies

screeps-pathfinding (standalone)
├── No dependencies

screeps-remote-mining
└── peerDependencies
    └── screeps-cartographer: ^1.8.13

screeps-roles
├── screeps-cartographer: ^1.8.13
└── @ralphschuler/screeps-defense: *

screeps-console (standalone)
├── No dependencies

screeps-stats (standalone)
├── No dependencies

screeps-visuals (private)
├── Not published
```

### Publishing Order

When publishing multiple packages, follow this order to satisfy dependencies:

1. **Tier 1 - Standalone Packages** (no dependencies)
   - screeps-kernel
   - screeps-pathfinding
   - screeps-console
   - screeps-stats

2. **Tier 2 - Packages with external peer dependencies**
   - screeps-remote-mining (depends on screeps-cartographer)

3. **Tier 3 - Packages with internal dependencies**
   - screeps-roles (depends on screeps-defense)

### Internal Package References

When one package depends on another from the same monorepo:

**Option 1: Workspace reference (development)**
```json
{
  "dependencies": {
    "@ralphschuler/screeps-defense": "*"
  }
}
```

**Option 2: Version range (published)**
```json
{
  "dependencies": {
    "@ralphschuler/screeps-defense": "^0.1.0"
  }
}
```

### External Dependencies

Current external dependencies:
- `screeps-cartographer: ^1.8.13` (peer dependency)

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
