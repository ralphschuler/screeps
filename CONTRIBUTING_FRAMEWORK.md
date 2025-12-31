# Contributing to the Screeps Framework

Thank you for your interest in contributing to the Screeps Framework! This guide will help you understand how to develop, test, and publish framework packages.

## Table of Contents

1. [Philosophy](#philosophy)
2. [Getting Started](#getting-started)
3. [Creating a New Package](#creating-a-new-package)
4. [Package Standards](#package-standards)
5. [Testing Requirements](#testing-requirements)
6. [Documentation Standards](#documentation-standards)
7. [Release Process](#release-process)
8. [Publishing Checklist](#publishing-checklist)

## Philosophy

The Screeps Framework follows these core principles:

1. **Modular**: Each package has a single, well-defined responsibility
2. **Tested**: Comprehensive test coverage ensures reliability
3. **Typed**: Full TypeScript support with strict typing
4. **Framework-Agnostic**: Minimal coupling between packages
5. **CPU-Efficient**: Optimized for performance and caching
6. **Well-Documented**: Clear API docs and usage examples

## Getting Started

### Prerequisites

- Node.js 16.x - 20.x (18.x recommended)
- npm >= 8.0.0
- TypeScript knowledge
- Screeps game knowledge

### Repository Setup

```bash
# Clone the repository
git clone https://github.com/ralphschuler/screeps.git
cd screeps

# Install dependencies
npm install

# Build all packages
npm run build:all

# Run tests
npm run test:all
```

## Creating a New Package

### 1. Package Naming Convention

Framework packages follow this naming convention:

- **Scoped packages** (preferred): `@ralphschuler/screeps-{name}`
  - Example: `@ralphschuler/screeps-kernel`, `@ralphschuler/screeps-spawn`
  - Location: `packages/@ralphschuler/screeps-{name}/`
  
- **Unscoped packages** (legacy): `screeps-{name}`
  - Example: `screeps-chemistry`, `screeps-defense`
  - Location: `packages/screeps-{name}/`

**Recommendation**: Use scoped packages for new framework packages.

### 2. Package Structure

Create your package with this structure:

```
packages/@ralphschuler/screeps-{name}/
├── src/
│   ├── index.ts           # Main exports
│   ├── types.ts           # TypeScript interfaces/types
│   └── {feature}.ts       # Feature implementations
├── test/
│   └── {feature}.test.ts  # Tests
├── package.json           # Package metadata
├── tsconfig.json          # TypeScript config
├── README.md              # Documentation
└── CHANGELOG.md           # Version history
```

### 3. Package.json Template

```json
{
  "name": "@ralphschuler/screeps-{name}",
  "version": "0.1.0",
  "description": "Brief description of your package",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "private": false,
  "scripts": {
    "build": "tsc",
    "test": "mocha test/**/*.test.ts",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "screeps",
    "{feature}",
    "typescript"
  ],
  "author": "Your Name",
  "license": "Unlicense",
  "devDependencies": {
    "@types/chai": "^4.1.6",
    "@types/mocha": "^10.0.10",
    "@types/node": "^25.0.3",
    "@types/screeps": "^3.3.8",
    "chai": "^6.2.2",
    "mocha": "^11.7.5",
    "ts-node": "^10.2.0",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.4.3"
  }
}
```

### 4. TypeScript Configuration

Use this `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "lib": ["ES2022"],
    "target": "ES2022",
    "moduleResolution": "Node",
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

## Package Standards

### Code Quality

1. **TypeScript Strict Mode**: All packages must use strict TypeScript
2. **No `any` Types**: Avoid `any`, use proper types or `unknown`
3. **Consistent Naming**: Use camelCase for variables/functions, PascalCase for classes/types
4. **Pure Functions**: Prefer pure functions when possible
5. **Minimal Dependencies**: Only depend on Screeps API and TypeScript stdlib

### API Design

1. **Clean Interfaces**: Define clear, minimal interfaces
2. **Sensible Defaults**: Provide good defaults for optional parameters
3. **Immutability**: Prefer immutable data structures
4. **Error Handling**: Handle errors gracefully, don't crash the bot
5. **Performance**: Cache expensive operations, minimize CPU usage

### Example: Good API Design

```typescript
// Good: Clean interface with sensible defaults
export interface SpawnConfig {
  debug?: boolean;              // Optional, defaults to false
  rolePriorities?: Record<string, number>; // Optional custom priorities
}

export class SpawnManager {
  constructor(config: SpawnConfig = {}) {
    this.debug = config.debug ?? false;
    this.rolePriorities = { ...DEFAULT_PRIORITIES, ...config.rolePriorities };
  }
  
  // Pure function, no side effects
  getBestBody(role: string, energy: number): BodyPartConstant[] {
    // Implementation
  }
}
```

## Testing Requirements

### Test Coverage

All packages must have:

1. **Unit Tests**: Test individual functions/classes
2. **Integration Tests**: Test package as a whole
3. **Coverage Target**: Aim for 80%+ code coverage
4. **Edge Cases**: Test error conditions and edge cases

### Test Structure

Use Mocha + Chai for testing:

```typescript
import { expect } from 'chai';
import { SpawnManager } from '../src/index';

describe('SpawnManager', () => {
  describe('getBestBody', () => {
    it('should return optimal body for given energy', () => {
      const manager = new SpawnManager();
      const body = manager.getBestBody('harvester', 300);
      
      expect(body).to.be.an('array');
      expect(body).to.include.members([WORK, CARRY, MOVE]);
    });
    
    it('should return null for invalid role', () => {
      const manager = new SpawnManager();
      const body = manager.getBestBody('invalid-role', 1000);
      
      expect(body).to.be.null;
    });
  });
});
```

### Running Tests

```bash
# Test specific package
npm test -w @ralphschuler/screeps-{name}

# Test all packages
npm run test:all
```

## Documentation Standards

### README.md Structure

Every package must have a comprehensive README with:

1. **Title and Description**: Clear, concise description
2. **Features**: Bullet list of key features
3. **Installation**: How to install the package
4. **Quick Start**: Simple usage example
5. **API Reference**: Complete API documentation
6. **Examples**: Real-world usage examples
7. **License**: License information

### Example README Template

```markdown
# @ralphschuler/screeps-{name}

Brief description of what this package does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install @ralphschuler/screeps-{name}
\`\`\`

## Quick Start

\`\`\`typescript
import { MainClass } from '@ralphschuler/screeps-{name}';

const instance = new MainClass();
instance.doSomething();
\`\`\`

## API Reference

### MainClass

Main class description.

#### Constructor

\`\`\`typescript
new MainClass(config?: Config)
\`\`\`

#### Methods

- \`doSomething(): void\` - Does something
- \`doSomethingElse(param: string): number\` - Does something else

## Examples

[More detailed examples]

## License

Unlicense - Public Domain
```

### Code Comments

1. **JSDoc for Public APIs**: All public classes/functions must have JSDoc
2. **Inline Comments**: Explain complex logic, not obvious code
3. **TODO Comments**: Use for future improvements (will create GitHub issues)

```typescript
/**
 * Calculate optimal creep body for given role and energy
 * @param role - The role name (e.g., 'harvester', 'upgrader')
 * @param energy - Available energy for spawning
 * @returns Array of body parts, or null if invalid
 */
export function calculateBody(role: string, energy: number): BodyPartConstant[] | null {
  // Validate inputs
  if (energy < 200) return null;
  
  // Get role template
  const template = ROLE_TEMPLATES[role];
  if (!template) return null;
  
  // TODO: Add boost calculation for war mode
  
  return buildBodyFromTemplate(template, energy);
}
```

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major version** (1.0.0 → 2.0.0): Breaking API changes
- **Minor version** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch version** (1.0.0 → 1.0.1): Bug fixes, backward compatible

### Pre-Release Checklist

Before releasing a new version:

1. **Update Version**: Bump version in `package.json`
2. **Update CHANGELOG**: Add entry to `CHANGELOG.md`
3. **Run Tests**: Ensure all tests pass
4. **Build Package**: Verify build succeeds
5. **Test Integration**: Test in a real bot
6. **Update Docs**: Ensure README is up-to-date

### CHANGELOG.md Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature description

### Changed
- Changed feature description

### Fixed
- Bug fix description

## [0.2.0] - 2024-01-15

### Added
- Feature A
- Feature B

### Fixed
- Bug fix for issue #123

## [0.1.0] - 2024-01-01

### Added
- Initial release
```

### Versioning Strategy

The framework follows **Semantic Versioning (SemVer)** strictly:

#### Version Format: MAJOR.MINOR.PATCH

- **MAJOR** (1.0.0 → 2.0.0): Breaking API changes
  - Incompatible API changes
  - Removal of public APIs
  - Changes to existing behavior that could break users
  - Example: Changing function signatures, removing exports

- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
  - New public APIs
  - New optional parameters
  - Performance improvements
  - Example: Adding new methods, new exports

- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible
  - Bug fixes that don't change API
  - Documentation updates
  - Internal refactoring
  - Example: Fixing calculation errors, correcting edge cases

#### Pre-release Versions

For packages still in initial development (version < 1.0.0):
- 0.1.0 → 0.2.0: Minor breaking changes or major features
- 0.1.0 → 0.1.1: Small features or bug fixes

Once a package reaches 1.0.0, it's considered stable and breaking changes require a major version bump.

### Publishing

Packages are published via GitHub Actions workflow:

#### Automatic Publishing (Recommended)

1. **Update version in package.json**:
   ```bash
   cd packages/@ralphschuler/screeps-{name}
   npm version patch  # or minor, or major
   ```

2. **Update CHANGELOG.md**:
   - Move changes from [Unreleased] to new version section
   - Add release date
   - Create new [Unreleased] section

3. **Commit changes**:
   ```bash
   git add .
   git commit -m "chore(release): @ralphschuler/screeps-{name}@0.2.0"
   git push
   ```

4. **Create GitHub Release**:
   - Go to GitHub → Releases → Create new release
   - Tag: `@ralphschuler/screeps-{name}@0.2.0`
   - Title: `@ralphschuler/screeps-{name} v0.2.0`
   - Description: Copy from CHANGELOG
   - GitHub Actions will automatically publish to npm

#### Manual Publishing (if needed)

1. **Dry run first**:
   ```bash
   cd packages/@ralphschuler/screeps-{name}
   npm publish --dry-run --access public
   ```

2. **Review what will be published**:
   ```bash
   npm pack
   tar -tf *.tgz
   rm *.tgz
   ```

3. **Publish to npm**:
   ```bash
   npm publish --access public
   ```

#### Testing the Workflow

To test the publish workflow without actually publishing:

```bash
# Trigger workflow with dry-run
gh workflow run publish-framework.yml \
  -f publish_scope=spawn

# Or use the GitHub UI:
# Actions → Publish Framework Packages → Run workflow
```

The workflow includes automatic dry-run for PRs and testing.

## Publishing Checklist

Before marking a package as publishable (`private: false`):

- [ ] **Code Quality**
  - [ ] TypeScript strict mode enabled
  - [ ] No linting errors
  - [ ] No build warnings
  - [ ] Code follows standards

- [ ] **Testing**
  - [ ] Unit tests written
  - [ ] Integration tests written
  - [ ] All tests passing
  - [ ] Coverage >= 80%

- [ ] **Documentation**
  - [ ] README.md complete with examples
  - [ ] API documented with JSDoc
  - [ ] CHANGELOG.md created
  - [ ] Added to FRAMEWORK.md

- [ ] **Package Configuration**
  - [ ] `package.json` complete and valid
  - [ ] `private: false` in package.json
  - [ ] Proper keywords and metadata
  - [ ] License specified (Unlicense)

- [ ] **Build & Distribution**
  - [ ] `npm run build` succeeds
  - [ ] `dist/` contains expected files
  - [ ] Type definitions generated
  - [ ] Source maps generated

- [ ] **Integration**
  - [ ] Tested in real bot
  - [ ] No runtime errors
  - [ ] Performance acceptable
  - [ ] Compatible with other packages

## Best Practices

### Do's ✅

- Write comprehensive tests
- Document your API clearly
- Keep packages focused and small
- Optimize for CPU efficiency
- Use TypeScript strict mode
- Provide usage examples
- Handle errors gracefully
- Cache expensive operations

### Don'ts ❌

- Don't add unnecessary dependencies
- Don't use `any` types
- Don't break backward compatibility in minor/patch versions
- Don't couple packages tightly
- Don't skip tests
- Don't leave TODOs in published code
- Don't sacrifice performance for convenience

## Getting Help

- **Documentation**: See [FRAMEWORK.md](FRAMEWORK.md)
- **Issues**: [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ralphschuler/screeps/discussions)
- **Examples**: See [examples/](examples/) directory

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## License

All framework packages are released under the [Unlicense](LICENSE) - public domain.
