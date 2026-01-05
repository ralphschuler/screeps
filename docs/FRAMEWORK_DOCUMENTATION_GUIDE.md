# Framework Package Documentation Guide

This guide provides a systematic approach to creating comprehensive documentation for all framework packages.

## Table of Contents

- [Documentation Standards](#documentation-standards)
- [Package Documentation Checklist](#package-documentation-checklist)
- [Section-by-Section Guide](#section-by-section-guide)
- [Examples by Package Type](#examples-by-package-type)
- [Common Patterns](#common-patterns)
- [Tools and Automation](#tools-and-automation)

## Documentation Standards

### Target Audience

Framework package documentation serves three audiences:

1. **Bot Developers**: Need quick start, examples, and integration guides
2. **Framework Contributors**: Need API reference and architecture details
3. **AI Agents**: Need structured, parseable documentation for code generation

### Quality Metrics

Good documentation has:

- **Completeness**: All public APIs documented
- **Clarity**: Examples that work out-of-the-box
- **Discoverability**: Table of contents and clear headings
- **Maintainability**: Consistent structure across packages

### Documentation Requirements

**Minimum Requirements** (for all packages):
- Quick Start (< 5 minute example)
- Feature list with descriptions
- API Reference (all public exports)
- At least 3 usage examples
- Installation instructions
- License

**Recommended Additions**:
- Console commands (if applicable)
- Performance metrics
- Troubleshooting section
- Integration examples with other packages
- Migration guides

## Package Documentation Checklist

Use this checklist when documenting a package:

### Pre-Documentation
- [ ] Review package source code (`src/`)
- [ ] Check for existing internal documentation (`src/README.md`, comments)
- [ ] Identify all public exports (`src/index.ts`)
- [ ] List all main classes, functions, types
- [ ] Review tests for usage patterns
- [ ] Check package.json for dependencies and metadata

### Required Sections
- [ ] **Overview** - What it does, when to use it, key benefits
- [ ] **Installation** - npm install command
- [ ] **Quick Start** - < 5 minute working example
- [ ] **Features** - 3-5 major features with descriptions and examples
- [ ] **API Reference** - All public exports documented
- [ ] **Usage Examples** - 3+ real-world scenarios
- [ ] **License** - Link to Unlicense

### Recommended Sections
- [ ] **Console Commands** - If package provides console namespace
- [ ] **Configuration** - If package accepts options
- [ ] **Performance** - CPU/memory metrics
- [ ] **Troubleshooting** - Common issues and solutions
- [ ] **Integration Guide** - How to use with other packages
- [ ] **Development** - Build and test instructions
- [ ] **Related Packages** - Links to complementary packages

### Quality Checks
- [ ] All code examples are runnable
- [ ] Table of contents is complete
- [ ] Links work (internal and external)
- [ ] Code examples use correct package imports
- [ ] TypeScript types are accurate
- [ ] No placeholder text ("TODO", "Coming soon") without context

## Section-by-Section Guide

### 1. Overview Section

**Purpose**: Answer "What is this package and why should I use it?"

**Template:**
```markdown
## Overview

### What It Does

[2-3 paragraphs explaining the package's purpose and capabilities]

### When to Use This Package

- **Use case 1**: Description
- **Use case 2**: Description
- **Use case 3**: Description

### Key Benefits

- **Benefit 1**: Explanation
- **Benefit 2**: Explanation
- **Benefit 3**: Explanation
```

**Example** (from screeps-layouts):
```markdown
The layouts package provides a comprehensive system for automated base construction in Screeps. It handles:
- **Blueprint Selection**: Automatically chooses the best base layout
- **Intelligent Placement**: Finds optimal anchor positions
- **Road Networks**: Calculates efficient road systems
```

### 2. Installation Section

**Purpose**: Show how to install the package

**Template:**
```markdown
## Installation

```bash
npm install @ralphschuler/screeps-[package-name]
```
```

**Add dependencies if needed:**
```markdown
### Dependencies

This package requires:
- Screeps game environment
- TypeScript >= 4.0
- @ralphschuler/screeps-utils (for caching)
```

### 3. Quick Start Section

**Purpose**: Get user running code in < 5 minutes

**Template:**
```markdown
## Quick Start

### Basic Usage (< 5 minutes)

```typescript
import { MainClass } from '@ralphschuler/screeps-[package]';

// Minimal example
export function loop() {
  const manager = new MainClass();
  manager.run();
}
```

**Expected Result**: [What happens when you run this]
```

**Key Points:**
- Keep it minimal (10-15 lines max)
- Must be runnable without modification
- Explain what the code does
- State expected outcome

### 4. Features Section

**Purpose**: Showcase 3-5 main features with examples

**Template:**
```markdown
## Features

### Feature 1: [Name]

[Description of the feature]

**Benefits:**
- Benefit point 1
- Benefit point 2

**Example:**
```typescript
// Code example demonstrating this feature
```
```

**Example** (from screeps-intershard):
```markdown
### Feature 1: Automatic Shard Role Assignment

Shards are automatically assigned roles based on their state:

**Benefits:**
- Zero manual configuration
- Dynamic role transitions

**Example:**
```typescript
const state = shardManager.getCurrentShardState();
console.log(`Current role: ${state?.role}`);
```
```

### 5. API Reference Section

**Purpose**: Document all public exports

**Structure:**
- Classes (with constructors, methods, properties)
- Functions (standalone)
- Types & Interfaces
- Constants & Enums

**Class Documentation Template:**
```markdown
### ClassName

Description of the class.

**Constructor:**
```typescript
new ClassName(options?: ClassOptions)
```

**Options:**
- `option1` (type): Description - Default: `value`

**Methods:**

#### `methodName(param1: Type1): ReturnType`

Description.

**Parameters:**
- `param1`: Description

**Returns:** Description

**Example:**
```typescript
const result = instance.methodName(arg);
```
```

**Function Documentation Template:**
```markdown
#### functionName(param1: Type1, param2: Type2): ReturnType

Description.

**Parameters:**
- `param1`: Description
- `param2`: Description

**Returns:** Description

**Example:**
```typescript
const result = functionName(arg1, arg2);
```
```

**Tips:**
- Include TypeScript signatures
- Show parameter types and defaults
- Provide 1-2 line example for each
- Use JSDoc comments from source code

### 6. Usage Examples Section

**Purpose**: Show real-world integration patterns

**Template:**
```markdown
## Usage Examples

### Example 1: [Common Use Case]

**Scenario:** [Describe the problem being solved]

**Code:**
```typescript
// Complete, runnable example
```

**Explanation:**
1. Step 1 explanation
2. Step 2 explanation
3. Result
```

**Guidelines:**
- 3+ examples minimum
- Each example should be complete and runnable
- Cover different complexity levels (basic, intermediate, advanced)
- Show integration with other systems/packages

### 7. Console Commands Section

**Purpose**: Document console API (if package provides one)

**Template:**
```markdown
## Console Commands

All commands are in the `namespace` console namespace:

### Monitoring Commands

```javascript
// Command description
namespace.command()

// Command with params
namespace.command(param1, param2)
```

### Management Commands

```javascript
// Management command
namespace.manage('value')
```
```

**Example** (from screeps-intershard):
```markdown
### Portal Commands

```javascript
// List all portals
shard.portals()

// Find best portal route
shard.bestPortal('shard1', 'E1N1')
```
```

### 8. Performance Section

**Purpose**: Provide CPU/memory benchmarks

**Template:**
```markdown
## Performance

### CPU Usage

**Typical CPU Cost:**
- Operation 1: ~X.XX CPU per call
- Operation 2: ~X.XX CPU per tick
- **Total average**: ~X.XX CPU per tick

### Memory Usage

**Memory Footprint:**
- Per-room: ~X KB
- Global: ~X KB

### Optimization Tips

1. **Tip 1**: Description
   ```typescript
   // Example
   ```

2. **Tip 2**: Description
```

**Tips:**
- Use actual measurements if possible
- Provide context (e.g., "with 10 rooms")
- Include optimization suggestions

### 9. Troubleshooting Section

**Purpose**: Address common issues

**Template:**
```markdown
## Troubleshooting

### Common Issues

#### Issue 1: [Problem Description]

**Symptoms:**
- Symptom 1
- Symptom 2

**Cause:** [Explanation]

**Solution:**
```typescript
// Code fix
```

**Prevention:** [How to avoid]
```

**Guidelines:**
- 3-5 common issues
- Include symptoms (what user sees)
- Explain root cause
- Provide solution code or steps

## Examples by Package Type

### Example 1: Manager/Coordinator Package

**Type**: Active manager that runs each tick (e.g., shardManager, linkManager)

**Key Sections:**
- Quick Start: Show `manager.run()` integration
- Features: Highlight automatic behaviors
- API: Focus on configuration and control methods
- Examples: Show typical main loop integration

**Reference**: `@ralphschuler/screeps-intershard`

### Example 2: Utility Package

**Type**: Collection of utility functions (e.g., screeps-utils)

**Key Sections:**
- Quick Start: Show importing and using utilities
- Features: Group by category (caching, selection, etc.)
- API: Document each utility function
- Examples: Show solving specific problems

**Reference**: `@ralphschuler/screeps-utils`

### Example 3: Blueprint/Data Package

**Type**: Provides data structures or blueprints (e.g., screeps-layouts)

**Key Sections:**
- Quick Start: Show using a blueprint
- Features: Explain available blueprints/data
- API: Document accessors and validators
- Examples: Show customization and selection

**Reference**: `@ralphschuler/screeps-layouts`

### Example 4: Role/Behavior Package

**Type**: Provides creep behaviors or roles (e.g., screeps-roles)

**Key Sections:**
- Quick Start: Show running a role
- Features: List available behaviors
- API: Document behavior functions and state
- Examples: Show composing custom roles

**Reference**: `@ralphschuler/screeps-roles`

## Common Patterns

### Pattern 1: Singleton Manager

Many packages export a singleton manager instance:

```typescript
import { linkManager } from '@ralphschuler/screeps-economy';

// Used directly - no instantiation needed
linkManager.run(room);
```

**Documentation Approach:**
- Show imports clearly
- Explain singleton pattern briefly
- Document configuration if applicable

### Pattern 2: Class-Based API

Some packages require instantiation:

```typescript
import { SpawnManager } from '@ralphschuler/screeps-spawn';

const manager = new SpawnManager(options);
manager.processSpawnQueue(spawns, requests);
```

**Documentation Approach:**
- Show constructor clearly
- Document all options
- Provide example configuration

### Pattern 3: Process Decorator

Packages using kernel integration:

```typescript
// Package exports a manager with @Process decorator
// Automatically registered with kernel
```

**Documentation Approach:**
- Explain automatic registration
- Show how to check if process is running
- Document process priority and frequency

### Pattern 4: Pure Functions

Utility packages with pure functions:

```typescript
import { calculatePath } from '@ralphschuler/screeps-pathfinding';

const path = calculatePath(from, to, options);
```

**Documentation Approach:**
- Document each function clearly
- Show parameter types
- Provide usage examples

## Tools and Automation

### Extracting API from Source

Use TypeScript compiler API or manual review:

```bash
# List all exports
grep -r "export" src/index.ts

# Find all public classes
grep -r "export class" src/

# Find all public functions
grep -r "export function" src/
```

### Checking Documentation Coverage

```bash
# Find all exported items
grep -E "export (class|function|interface|type|const|enum)" src/**/*.ts

# Compare with API Reference section in README
```

### Template Automation

Create a script to generate skeleton README:

```typescript
// generateDocs.ts
import { readFileSync } from 'fs';

function generateSkeleton(packagePath: string) {
  const pkg = require(`${packagePath}/package.json`);
  const exports = extractExports(`${packagePath}/src/index.ts`);
  
  return `
# ${pkg.name}

> ${pkg.description}

## Installation

\`\`\`bash
npm install ${pkg.name}
\`\`\`

## Quick Start

\`\`\`typescript
import { /* exports */ } from '${pkg.name}';

// TODO: Add quick start example
\`\`\`

## API Reference

${exports.map(e => `### ${e.name}\n\nTODO: Document\n`).join('\n')}
`;
}
```

## Documentation Workflow

1. **Preparation**
   - Clone repository
   - Review source code
   - Check for internal docs
   - List all exports

2. **Structure**
   - Create outline from template
   - Organize sections
   - Add table of contents

3. **Content**
   - Write Overview
   - Add Quick Start
   - Document Features
   - Create API Reference
   - Write Examples

4. **Quality**
   - Test all code examples
   - Check links
   - Verify TypeScript types
   - Review for completeness

5. **Review**
   - Compare with template checklist
   - Ensure consistency with other packages
   - Test examples in Screeps environment (if possible)

## Quick Reference: Documentation Sizes

Based on completed packages:

| Package | README Lines | Sections | Examples |
|---------|--------------|----------|----------|
| screeps-layouts | 700+ | 12 | 3 |
| screeps-intershard | 850+ | 13 | 3 |

**Target**: 600-900 lines for comprehensive documentation

**Minimum**: 300-400 lines for adequate documentation

## Common Pitfalls

### Pitfall 1: Assuming Prior Knowledge

**Problem**: Documentation assumes user knows other parts of framework

**Solution**: Link to related packages, explain integrations

### Pitfall 2: Incomplete Examples

**Problem**: Examples that don't run without modification

**Solution**: Test all examples, make them self-contained

### Pitfall 3: Missing Type Information

**Problem**: Examples don't show TypeScript types

**Solution**: Include types in function signatures and examples

### Pitfall 4: Outdated Documentation

**Problem**: Docs don't match current implementation

**Solution**: Review source code before writing, validate examples

### Pitfall 5: No Performance Context

**Problem**: Users don't know CPU/memory impact

**Solution**: Add Performance section with actual measurements

## Conclusion

Good documentation is:
- **Complete**: Covers all features
- **Clear**: Easy to understand
- **Practical**: Includes working examples
- **Discoverable**: Well-organized with ToC
- **Maintainable**: Consistent structure

Use this guide to create documentation that helps developers build better Screeps bots faster.

## Next Steps

For each undocumented package:

1. Review this guide
2. Use the checklist
3. Follow the section templates
4. Add 3+ working examples
5. Test all code
6. Review for completeness

**Estimated time per package**: 1-2 hours for comprehensive documentation

**Priority order**:
1. Packages with large codebases but minimal docs (screeps-visuals, screeps-roles)
2. Well-documented packages needing enhancement (kernel, pathfinding)
3. Utility packages (screeps-utils, screeps-console)
4. Skeleton packages (screeps-empire - needs implementation first)
