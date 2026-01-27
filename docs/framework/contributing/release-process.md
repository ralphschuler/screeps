# Release Process

Learn how to **release and publish** framework packages to npm.

---

## Table of Contents

- [Release Philosophy](#release-philosophy)
- [Versioning](#versioning)
- [Pre-Release Checklist](#pre-release-checklist)
- [Release Steps](#release-steps)
- [Post-Release Tasks](#post-release-tasks)
- [Hotfix Process](#hotfix-process)

---

## Release Philosophy

### Principles

1. **Semantic Versioning** - Clear version semantics
2. **Quality First** - All tests must pass
3. **Documentation** - Complete and accurate
4. **Backwards Compatibility** - Minimize breaking changes
5. **Changelog** - Transparent change history

### Release Cadence

- **Major versions** - Infrequent, breaking changes
- **Minor versions** - Monthly, new features
- **Patch versions** - As needed, bug fixes

---

## Versioning

Follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

Example: 1.2.3
```

### Version Types

**MAJOR** (1.0.0 → 2.0.0) - Breaking changes:
- API changes that break existing code
- Removal of deprecated features
- Major architecture changes

**MINOR** (1.0.0 → 1.1.0) - New features:
- New functionality (backwards compatible)
- New exports
- Performance improvements

**PATCH** (1.0.0 → 1.0.1) - Bug fixes:
- Bug fixes
- Documentation updates
- Internal improvements

### Version Commands

```bash
# Patch version
npm version patch -w @ralphschuler/screeps-mynew

# Minor version
npm version minor -w @ralphschuler/screeps-mynew

# Major version
npm version major -w @ralphschuler/screeps-mynew
```

---

## Pre-Release Checklist

### 1. Code Quality

- [ ] All tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Code builds: `npm run build`
- [ ] Coverage ≥ 80%: `npm test -- --coverage`

### 2. Documentation

- [ ] README is complete
- [ ] CHANGELOG updated
- [ ] JSDoc comments added
- [ ] Examples are working
- [ ] Migration guide (if breaking changes)

### 3. Dependencies

- [ ] Dependencies up to date
- [ ] No security vulnerabilities: `npm audit`
- [ ] Dependency versions pinned appropriately

### 4. Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance verified

### 5. Version Management

- [ ] Version bumped in package.json
- [ ] CHANGELOG entry added
- [ ] Git commits are clean
- [ ] Branch is up to date with main

---

## Release Steps

### Step 1: Prepare Release Branch

```bash
# Create release branch
git checkout -b release/mynew-v0.2.0

# Ensure clean working directory
git status
```

### Step 2: Update CHANGELOG

```markdown
# CHANGELOG.md

## [0.2.0] - 2026-01-27

### Added
- New feature X
- Support for Y

### Changed
- Improved performance of Z
- Updated API for better clarity

### Fixed
- Bug in feature A
- Memory leak in B

### Deprecated
- Old method C (use D instead)

### Removed
- Deprecated feature E
```

### Step 3: Bump Version

```bash
# Update version in package.json
npm version minor -w @ralphschuler/screeps-mynew

# This creates a git commit and tag automatically
```

### Step 4: Build Package

```bash
# Clean previous build
npm run clean -w @ralphschuler/screeps-mynew

# Build
npm run build -w @ralphschuler/screeps-mynew

# Verify build output
ls -la packages/@ralphschuler/screeps-mynew/dist/
```

### Step 5: Test Build

```bash
# Run tests against built code
npm test -w @ralphschuler/screeps-mynew

# Verify package contents
npm pack -w @ralphschuler/screeps-mynew
tar -tzf ralphschuler-screeps-mynew-0.2.0.tgz
```

### Step 6: Publish to npm

```bash
# Login to npm (first time only)
npm login

# Publish package
npm publish -w @ralphschuler/screeps-mynew --access public

# Verify publication
npm view @ralphschuler/screeps-mynew
```

### Step 7: Create Git Tag

```bash
# Tag was created automatically by npm version
# Push tag to remote
git push --tags

# Push release branch
git push origin release/mynew-v0.2.0
```

### Step 8: Create GitHub Release

```bash
# Create release on GitHub
gh release create @ralphschuler/screeps-mynew@0.2.0 \
  --title "screeps-mynew v0.2.0" \
  --notes "$(cat CHANGELOG.md | sed -n '/## \[0.2.0\]/,/## \[/p' | head -n -1)"
```

---

## Post-Release Tasks

### 1. Merge Release Branch

```bash
# Create PR for release branch
gh pr create \
  --title "Release: screeps-mynew v0.2.0" \
  --body "Release version 0.2.0"

# Merge after approval
gh pr merge --squash
```

### 2. Update Documentation Site

```bash
# Regenerate API documentation
npm run docs:generate

# Deploy documentation (if applicable)
npm run docs:deploy
```

### 3. Announce Release

- Post in GitHub Discussions
- Update framework README if needed
- Notify users in relevant channels

### 4. Monitor

- Watch for bug reports
- Monitor npm download stats
- Check for issues

---

## Hotfix Process

For critical bug fixes that need immediate release:

### Step 1: Create Hotfix Branch

```bash
# Branch from latest release tag
git checkout -b hotfix/mynew-v0.2.1 @ralphschuler/screeps-mynew@0.2.0
```

### Step 2: Fix Bug

```bash
# Make minimal changes to fix bug
# Add test to prevent regression
# Commit changes
git commit -m "fix: critical bug in X"
```

### Step 3: Fast-Track Release

```bash
# Bump patch version
npm version patch -w @ralphschuler/screeps-mynew

# Build and test
npm run build -w @ralphschuler/screeps-mynew
npm test -w @ralphschuler/screeps-mynew

# Publish immediately
npm publish -w @ralphschuler/screeps-mynew --access public

# Push tag
git push --tags
```

### Step 4: Backport Fix

```bash
# Cherry-pick fix to main branch
git checkout main
git cherry-pick <commit-hash>
git push origin main
```

---

## Best Practices

### 1. Test Before Publishing

**Always test** in a real Screeps environment before publishing:

```bash
# Test in private server or simulation
npm pack -w @ralphschuler/screeps-mynew
# Install tarball in test bot
# Verify functionality
```

### 2. Coordinate Major Releases

**Major version** releases should be coordinated:
- Announce intention in advance
- Provide migration guide
- Give users time to prepare

### 3. Use Pre-Release Versions

For beta/alpha testing:

```bash
# Create pre-release version
npm version preminor --preid=beta -w @ralphschuler/screeps-mynew
# Results in: 0.3.0-beta.0

# Publish with beta tag
npm publish -w @ralphschuler/screeps-mynew --tag beta
```

### 4. Maintain Compatibility

**Avoid breaking changes** in minor/patch releases:
- Deprecate before removing
- Provide migration path
- Update documentation

### 5. Document Everything

**Clear documentation** prevents issues:
- Update README
- Add migration guides
- Document breaking changes
- Provide examples

---

## Troubleshooting

### Issue: Publish Failed

```bash
# Check npm credentials
npm whoami

# Verify package name is unique
npm view @ralphschuler/screeps-mynew

# Check access permissions
npm access ls-packages
```

### Issue: Version Conflict

```bash
# Reset version
git tag -d @ralphschuler/screeps-mynew@0.2.0
npm version <correct-version> -w @ralphschuler/screeps-mynew
```

### Issue: Build Errors

```bash
# Clean and rebuild
npm run clean -w @ralphschuler/screeps-mynew
npm install
npm run build -w @ralphschuler/screeps-mynew
```

---

## Related Documentation

- **[Package Development](package-development.md)** - Creating packages
- **[Testing Guide](testing.md)** - Testing requirements
- **[Semantic Versioning](https://semver.org/)** - Versioning specification

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
