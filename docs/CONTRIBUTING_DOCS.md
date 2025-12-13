# Contributing to Documentation

This guide explains how to add and maintain documentation in the Screeps project.

## Quick Start

1. **Add documentation files** to the appropriate location:
   - General docs → `/docs/`
   - Package-specific docs → `/packages/<package-name>/docs/`

2. **Build and preview** your changes:
   ```bash
   npm run build:docs
   ```
   
3. **Review generated wiki** in the `wiki/` directory

4. **Commit your changes** - the wiki will be automatically updated when merged to `main`

## File Organization

### Root Documentation (`/docs/`)
Place documentation here for:
- Project-wide systems and architecture
- General guides and tutorials
- Cross-cutting concerns (stats, metrics, monitoring)
- Game mechanics and strategies

### Package Documentation (`/packages/*/docs/`)
Each package should have its own `docs/` directory for:
- Package-specific features and APIs
- Implementation details
- Configuration options
- Usage examples

## Naming Conventions

### File Names
- **System docs**: Use UPPERCASE with underscores (e.g., `CPU_MANAGEMENT.md`)
- **Guides**: Use lowercase with hyphens (e.g., `getting-started.md`)
- **Subsystems**: Prefix with parent system (e.g., `cpu-bucket-management.md`)

### Titles
- Start each file with a clear H1 heading
- Include an overview section
- Use descriptive section headings

## Writing Style

### Structure
```markdown
# Title

Brief description of what this document covers.

## Overview

High-level explanation of the topic.

## [Main Sections]

Detailed content organized logically.

## Examples

Practical examples where applicable.

## Related Documentation

Links to related topics.
```

### Best Practices
- **Be concise**: Get to the point quickly
- **Use examples**: Show, don't just tell
- **Link related docs**: Help users navigate
- **Keep it current**: Update docs when code changes
- **Use code blocks**: Include syntax highlighting
- **Add diagrams**: Use ASCII art or mermaid when helpful

## Linking Between Documents

### Internal Links
Use relative paths to link to other documentation:
```markdown
See [CPU Management](./CPU_MANAGEMENT.md) for details.
```

The build system automatically converts these to wiki-compatible links.

### External Links
Use standard markdown links:
```markdown
See [Screeps API](https://docs.screeps.com/api/) for reference.
```

## Building Documentation

### Local Build
```bash
npm run build:docs
```

This creates a `wiki/` directory with all documentation files processed and combined.

### What the Build System Does
1. Scans all documentation directories
2. Processes markdown for wiki compatibility
3. Adds source file references
4. Converts relative links to wiki format
5. Generates table of contents (Home.md)

### Output Structure
- `wiki/Home.md` - Main table of contents
- `wiki/[filename].md` - Root documentation files
- `wiki/[package]-[filename].md` - Package documentation files

## Automatic Publishing

### Workflow
When changes are merged to `main`, the `wiki-publish` workflow:
1. Builds the documentation
2. Pushes to the GitHub wiki repository
3. Makes it available at https://github.com/ralphschuler/screeps/wiki

### Triggering
The workflow runs when:
- Changes are pushed to `docs/` or `packages/*/docs/`
- The build script is modified
- Manually triggered via workflow dispatch

## Documentation Categories

### System Documentation
Core systems and their architecture:
- Behavior System
- CPU Management
- Caching System
- Pheromone System
- etc.

### Package Documentation
Package-specific details:
- MCP server documentation
- Exporter configuration
- Mod features
- etc.

### Guides and Tutorials
How-to documentation:
- Getting started
- Advanced features
- Best practices
- Troubleshooting

## Maintenance

### Review Schedule
- **Major changes**: Update docs in the same PR
- **Quarterly**: Review for accuracy and completeness
- **After releases**: Ensure docs match new features

### Deprecation
When removing features:
1. Mark as deprecated in docs first
2. Wait at least one release cycle
3. Remove both code and documentation together

### Archive Process
For historical documentation:
1. Move to `docs/archive/` directory
2. Add note explaining deprecation
3. Remove from main documentation flow

## Templates

### System Documentation Template
```markdown
# [System Name]

Brief description of the system's purpose.

## Overview

What this system does and why it exists.

## Architecture

How the system is structured.

## Usage

How to use or interact with the system.

## Configuration

Available settings and their effects.

## Examples

Practical usage examples.

## Performance

CPU/memory considerations.

## Related Systems

Links to related documentation.
```

### Package Documentation Template
```markdown
# [Package Name]

Package purpose and overview.

## Installation

Setup instructions.

## Configuration

Environment variables, settings, etc.

## Usage

How to use the package.

## API Reference

Key functions, classes, or tools.

## Examples

Code examples and use cases.

## Troubleshooting

Common issues and solutions.
```

## Getting Help

- Check existing documentation for examples
- Review the [build script](../scripts/build-docs.js) to understand processing
- Look at [generated wiki](https://github.com/ralphschuler/screeps/wiki) to see output
- Ask in pull request reviews for documentation feedback

## Quick Tips

✅ **Do:**
- Write documentation while writing code
- Use clear, descriptive filenames
- Include examples and use cases
- Link to related documentation
- Update docs when code changes

❌ **Don't:**
- Use generic names like `doc1.md` or `notes.md`
- Duplicate information across multiple files
- Include implementation details that change frequently
- Forget to test your markdown rendering
- Leave outdated documentation

## Example Workflow

1. You're adding a new feature to `screeps-bot`:
   ```bash
   # Create documentation file
   touch packages/screeps-bot/docs/NEW_FEATURE.md
   
   # Write documentation
   vim packages/screeps-bot/docs/NEW_FEATURE.md
   
   # Build and preview
   npm run build:docs
   cat wiki/screeps-bot-NEW_FEATURE.md
   
   # Commit with code changes
   git add packages/screeps-bot/docs/NEW_FEATURE.md
   git commit -m "Add new feature with documentation"
   ```

2. Documentation is automatically published when merged to `main`

3. Users can find it at: https://github.com/ralphschuler/screeps/wiki
