# API Documentation Template

This template provides a standard structure for creating comprehensive API documentation for Screeps Framework packages.

## Package Overview

### Package Name
`@ralphschuler/screeps-[package-name]`

### One-Line Description
> Brief description of what this package does (< 80 characters)

### Category
- [ ] Core Infrastructure
- [ ] Process Management
- [ ] Economy & Resources
- [ ] Combat & Defense
- [ ] Architecture & Utilities

### LOC (Lines of Code)
Approximately X,XXX LOC

---

## Documentation Checklist

### Pre-Documentation
- [ ] Review all source files in `src/`
- [ ] Identify all public exports from `src/index.ts`
- [ ] Review existing tests for usage patterns
- [ ] Check package.json for dependencies
- [ ] Read any existing internal documentation

### Required Sections
- [ ] **Package Header** - Name, description, badges
- [ ] **Overview** - What it does, when to use it, key benefits
- [ ] **Installation** - npm install instructions
- [ ] **Quick Start** - <5 minute working example
- [ ] **Features** - 3-5 major features with examples
- [ ] **API Reference** - All public classes, functions, types
- [ ] **Usage Examples** - 3+ real-world scenarios
- [ ] **License** - Link to repository license

### Recommended Sections
- [ ] **Console Commands** - If package provides console namespace
- [ ] **Configuration** - If package accepts options/config
- [ ] **Performance** - CPU/memory metrics and optimization tips
- [ ] **Troubleshooting** - Common issues and solutions
- [ ] **Integration Guide** - Using with other framework packages
- [ ] **Development** - Build, test, and contribution instructions
- [ ] **Related Packages** - Links to complementary packages

---

## Section Templates

### 1. Package Header

```markdown
# @ralphschuler/screeps-[package-name]

> One-line description of what this package does

**Part of the [Screeps Framework](../../FRAMEWORK.md)** - Build powerful Screeps bots using modular, tested packages.

![Build Status](https://img.shields.io/github/actions/workflow/status/ralphschuler/screeps/test.yml?branch=main)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-Unlicense-green)

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [License](#license)
- [Related Packages](#related-packages)
```

### 2. Overview Section

```markdown
## Overview

### What It Does

[2-3 paragraphs explaining:]
- The package's main purpose
- What problems it solves
- How it fits into the Screeps Framework

### When to Use This Package

Use `@ralphschuler/screeps-[package-name]` when you need:

- **Use Case 1**: Description of scenario
- **Use Case 2**: Description of scenario
- **Use Case 3**: Description of scenario

### Key Benefits

- **🚀 Benefit 1**: Detailed explanation
- **⚡ Benefit 2**: Detailed explanation
- **🎯 Benefit 3**: Detailed explanation
```

### 3. Installation Section

```markdown
## Installation

### From npm (Recommended)

```bash
npm install @ralphschuler/screeps-[package-name]
```

### From Repository

```bash
# Clone the repository
git clone https://github.com/ralphschuler/screeps.git
cd screeps

# Install dependencies
npm install

# Build this package
npm run build:[package-name]
```

### Dependencies

This package requires:
- Screeps game environment
- TypeScript >= 4.0
- [Other framework packages if needed]
```

### 4. Quick Start Section

```markdown
## Quick Start

### Basic Usage (< 5 minutes)

```typescript
import { MainClass } from '@ralphschuler/screeps-[package-name]';

// Create an instance
const manager = new MainClass();

// Use in your main loop
export function loop() {
  manager.run();
}
```

**Expected Result**: [What happens when you run this code]

### Common Setup Pattern

```typescript
import { MainClass } from '@ralphschuler/screeps-[package-name]';

// Initialize with configuration
const manager = new MainClass({
  option1: value1,
  option2: value2
});

export function loop() {
  // Process each owned room
  for (const room of Object.values(Game.rooms)) {
    if (room.controller?.my) {
      manager.processRoom(room);
    }
  }
}
```
```

### 5. Features Section

```markdown
## Features

### Feature 1: [Name]

[2-3 sentence description of the feature]

**Benefits:**
- Benefit point 1
- Benefit point 2
- Benefit point 3

**Example:**
```typescript
// Code example demonstrating this feature
import { featureFunction } from '@ralphschuler/screeps-[package-name]';

const result = featureFunction(param1, param2);
console.log(result);
```

**Performance**: ~X.XX CPU per call

---

### Feature 2: [Name]

[Repeat pattern for each major feature]

---

### Feature 3: [Name]

[Repeat pattern for each major feature]
```

### 6. API Reference Section

```markdown
## API Reference

### Classes

#### `ClassName`

[Description of the class]

**Constructor:**
```typescript
constructor(options?: ClassOptions)
```

**Parameters:**
- `options` (optional): Configuration options
  - `option1` (Type): Description
  - `option2` (Type): Description

**Example:**
```typescript
const instance = new ClassName({
  option1: value1,
  option2: value2
});
```

**Methods:**

##### `methodName(param1, param2)`

[Description of what the method does]

**Parameters:**
- `param1` (Type): Description
- `param2` (Type): Description

**Returns:** ReturnType - Description

**Example:**
```typescript
const result = instance.methodName(arg1, arg2);
```

**Performance**: ~X.XX CPU

---

### Functions

#### `functionName(param1, param2)`

[Description of what the function does]

**Parameters:**
- `param1` (Type): Description
- `param2` (Type): Description

**Returns:** ReturnType - Description

**Example:**
```typescript
import { functionName } from '@ralphschuler/screeps-[package-name]';

const result = functionName(arg1, arg2);
```

**Performance**: ~X.XX CPU

---

### Types & Interfaces

#### `InterfaceName`

[Description of the interface]

```typescript
interface InterfaceName {
  property1: Type;
  property2: Type;
  optionalProperty?: Type;
}
```

**Properties:**
- `property1` (Type): Description
- `property2` (Type): Description
- `optionalProperty` (optional, Type): Description

**Example:**
```typescript
const config: InterfaceName = {
  property1: value1,
  property2: value2
};
```

---

### Constants & Enums

#### `CONSTANT_NAME`

[Description of the constant]

**Value:** `"constant-value"`

**Usage:**
```typescript
import { CONSTANT_NAME } from '@ralphschuler/screeps-[package-name]';

if (status === CONSTANT_NAME) {
  // Handle this case
}
```
```

### 7. Usage Examples Section

```markdown
## Usage Examples

### Example 1: [Scenario Name]

**Scenario**: [Description of what this example demonstrates]

```typescript
import { Class1, Class2 } from '@ralphschuler/screeps-[package-name]';

// Setup
const manager = new Class1();

// Main loop
export function loop() {
  // Implementation
  for (const room of Object.values(Game.rooms)) {
    if (room.controller?.my) {
      manager.processRoom(room);
    }
  }
}
```

**Expected Behavior**: [What happens when you run this]

**Performance**: ~X.XX CPU per room

---

### Example 2: [Scenario Name]

[Repeat pattern for each example]

---

### Example 3: [Scenario Name]

[Repeat pattern for each example]
```

### 8. Configuration Section

```markdown
## Configuration

### Configuration Options

The package accepts the following configuration options:

```typescript
interface PackageConfig {
  option1: Type;
  option2: Type;
  optionalOption?: Type;
}
```

**Options:**

#### `option1` (Type, required)

[Description of the option]

**Default**: `defaultValue`

**Example:**
```typescript
const config: PackageConfig = {
  option1: customValue
};
```

---

#### `option2` (Type, required)

[Repeat pattern for each option]

---

### Environment Variables

If applicable, list any environment variables:

- `ENV_VAR_NAME`: Description
```

### 9. Performance Section

```markdown
## Performance

### CPU Usage

Typical CPU usage for common operations:

| Operation | CPU Cost | Frequency |
|-----------|----------|-----------|
| Operation 1 | ~X.XX CPU | Per tick |
| Operation 2 | ~X.XX CPU | Per room |
| Operation 3 | ~X.XX CPU | On demand |

### Memory Usage

Estimated memory footprint:

- **Per tick**: ~X KB
- **Per room**: ~X KB
- **Total overhead**: ~X KB

### Optimization Tips

1. **Tip 1**: Explanation
   ```typescript
   // Good: Optimized approach
   const optimized = doThis();
   
   // Bad: Inefficient approach
   const inefficient = dontDoThis();
   ```

2. **Tip 2**: Explanation

3. **Tip 3**: Explanation

### Benchmarks

Performance measurements on typical room:

```
Package Operations: 100 iterations
Average CPU: X.XX per iteration
Min: X.XX, Max: X.XX, StdDev: X.XX
```
```

### 10. Troubleshooting Section

```markdown
## Troubleshooting

### Common Issues

#### Issue 1: [Problem Description]

**Symptoms:**
- Symptom 1
- Symptom 2

**Causes:**
- Possible cause 1
- Possible cause 2

**Solutions:**

1. **Solution 1**:
   ```typescript
   // Fix code example
   ```

2. **Solution 2**:
   ```typescript
   // Alternative fix
   ```

---

#### Issue 2: [Problem Description]

[Repeat pattern for each common issue]

---

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
const manager = new Manager({
  debug: true,
  logLevel: 'verbose'
});
```

### Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
2. Review the [Framework Documentation](../../FRAMEWORK.md)
3. Enable debug mode and examine console output
4. Open a new issue with reproduction steps
```

### 11. Development Section

```markdown
## Development

### Building

```bash
# Build this package
npm run build:[package-name]

# Watch mode
npm run watch:[package-name]
```

### Testing

```bash
# Run tests
npm run test:[package-name]

# Watch mode
npm run test:watch:[package-name]

# Coverage report
npm run test:coverage:[package-name]
```

### Project Structure

```
packages/@ralphschuler/screeps-[package-name]/
├── src/
│   ├── index.ts           # Main exports
│   ├── [feature].ts       # Feature implementations
│   └── types.ts           # Type definitions
├── test/
│   └── [feature].test.ts  # Unit tests
├── examples/
│   └── basic.ts           # Usage examples
├── README.md              # This file
├── package.json           # Package metadata
└── tsconfig.json          # TypeScript config
```

### Contributing

See [CONTRIBUTING_FRAMEWORK.md](../../CONTRIBUTING_FRAMEWORK.md) for:
- Coding standards
- Testing requirements
- Pull request process
- Release workflow
```

### 12. License Section

```markdown
## License

This package is part of the Screeps Framework and is released under the [Unlicense](../../LICENSE).

You are free to use, modify, and distribute this code without any restrictions.
```

### 13. Related Packages Section

```markdown
## Related Packages

### Core Dependencies

- [@ralphschuler/screeps-core](../screeps-core) - Core utilities and helpers
- [@ralphschuler/screeps-utils](../../screeps-utils) - Common utility functions

### Complementary Packages

- [@ralphschuler/screeps-[related1]](../screeps-[related1]) - Description
- [@ralphschuler/screeps-[related2]](../screeps-[related2]) - Description

### Framework Resources

- [Framework Guide](../../FRAMEWORK.md) - Complete framework overview
- [Package Publishing](../../PUBLISHING.md) - Publishing guide
- [Contributing](../../CONTRIBUTING_FRAMEWORK.md) - Contribution guidelines
```

---

## TSDoc Comment Format

Use TSDoc comments for all public APIs:

```typescript
/**
 * Brief description of the function/class/method.
 * 
 * More detailed explanation if needed. Can span multiple paragraphs.
 * 
 * @param paramName - Description of the parameter
 * @param optionalParam - Description of optional parameter
 * @returns Description of return value
 * 
 * @example
 * ```typescript
 * const result = functionName('example', 42);
 * console.log(result); // Output: ...
 * ```
 * 
 * @remarks
 * Additional notes, performance characteristics, or implementation details.
 * 
 * @see {@link RelatedClass} for related functionality
 * 
 * @public
 */
export function functionName(paramName: string, optionalParam?: number): ResultType {
  // Implementation
}
```

### TSDoc Tags Reference

- `@param` - Document function/method parameters
- `@returns` - Document return values
- `@example` - Provide usage examples
- `@remarks` - Additional notes and details
- `@see` - Cross-reference to related items
- `@deprecated` - Mark deprecated APIs
- `@public` / `@internal` - API visibility
- `@throws` - Document thrown exceptions
- `@typeParam` - Document generic type parameters

---

## Quality Checklist

Before submitting documentation, verify:

### Completeness
- [ ] All public exports are documented
- [ ] All sections from template are included (or marked N/A)
- [ ] Table of contents is complete and accurate
- [ ] Links work (internal and external)

### Accuracy
- [ ] All code examples are tested and runnable
- [ ] TypeScript types are correct
- [ ] Performance metrics are measured (not guessed)
- [ ] API signatures match actual implementation

### Usability
- [ ] Quick start takes < 5 minutes
- [ ] Examples cover common use cases
- [ ] Troubleshooting addresses known issues
- [ ] Navigation is clear and logical

### Consistency
- [ ] Follows template structure
- [ ] Matches style of other framework packages
- [ ] Uses consistent terminology
- [ ] Formatting is clean (no extra spaces, proper indentation)

---

## Documentation Best Practices

### 1. Write for Your Audience

- **Bot Developers**: Focus on practical examples and quick starts
- **Framework Contributors**: Include architecture details and design decisions
- **AI Agents**: Use structured, parseable formats

### 2. Keep Examples Realistic

```typescript
// Good: Real-world example
const spawner = new SpawnManager();
for (const room of Object.values(Game.rooms)) {
  if (room.controller?.my) {
    spawner.processRoom(room);
  }
}

// Bad: Oversimplified toy example
const x = new Manager();
x.run();
```

### 3. Show Don't Just Tell

```markdown
<!-- Good: Show code and explain -->
The cache manager automatically handles TTL:

```typescript
const cache = new CacheManager({ ttl: 100 });
cache.set('key', value); // Expires after 100 ticks
```

<!-- Bad: Just explain -->
The cache manager has automatic TTL handling.
```

### 4. Include Performance Context

```markdown
<!-- Good: Specific metrics -->
Performance: ~0.05 CPU per call
Typical usage: 10-20 calls per tick
Total CPU impact: ~0.5-1.0 CPU per tick

<!-- Bad: Vague claims -->
This is fast and efficient.
```

### 5. Make It Scannable

Use:
- Clear headings
- Bullet points
- Code blocks
- Tables
- Emoji sparingly for visual breaks (🚀 ⚡ 🎯 ✅ ⚠️ ❌)

### 6. Link Liberally

- Link to related packages
- Link to framework documentation
- Link to Screeps API docs
- Link to source code on GitHub

---

## Example: Complete Package Documentation

See these packages for reference implementations:

1. **[@ralphschuler/screeps-layouts](../screeps-layouts/README.md)** (✅ 700+ lines)
   - Excellent API reference
   - Multiple working examples
   - Comprehensive troubleshooting

2. **[@ralphschuler/screeps-intershard](../screeps-intershard/README.md)** (✅ 850+ lines)
   - Complete feature documentation
   - Console command reference
   - Performance benchmarks

These packages demonstrate the target quality level for all framework documentation.

---

## Notes for AI Agents

When generating documentation:

1. **Source Analysis**:
   - Read all files in `src/`
   - Extract exports from `src/index.ts`
   - Review tests for usage patterns
   - Check package.json for metadata

2. **Structure**:
   - Start with template sections
   - Fill in package-specific details
   - Keep consistent formatting
   - Generate 3+ real examples

3. **Validation**:
   - Verify all code examples compile
   - Check TypeScript types match implementation
   - Test examples produce expected output
   - Validate internal links

4. **Quality**:
   - Target 400-800 lines for full documentation
   - Include performance metrics from tests
   - Add troubleshooting for known issues
   - Link to related packages

---

This template is maintained as part of the [Screeps Framework Documentation Guide](./FRAMEWORK_DOCUMENTATION_GUIDE.md).
