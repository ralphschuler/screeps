# Documentation

This directory contains general documentation for the Screeps project.

## Documentation Structure

Documentation for this project is organized as follows:

- **Root `docs/` directory**: General project documentation, guides, and system overviews
- **Package `docs/` directories**: Package-specific documentation in `packages/*/docs/`

## Building Documentation

The project includes an automated documentation build system that aggregates all markdown files from the root `docs/` directory and all package `docs/` directories into a combined wiki format.

### Build Locally

To build the documentation locally:

```bash
npm run build:docs
```

This will:
1. Scan all documentation directories
2. Process and combine markdown files
3. Generate wiki-compatible files in the `wiki/` directory

### Automatic Publishing

Documentation is automatically published to the [project wiki](https://github.com/ralphschuler/screeps/wiki) when changes are pushed to the `main` branch. The GitHub Actions workflow:

1. Builds the documentation using `build:docs`
2. Checks out the wiki repository
3. Updates wiki pages with the latest documentation
4. Commits and pushes changes

## Contributing Documentation

### Adding New Documentation

1. **For general documentation**: Add markdown files to the root `docs/` directory
2. **For package-specific documentation**: Add markdown files to `packages/<package-name>/docs/`

### Documentation Guidelines

- Use clear, descriptive filenames (e.g., `CACHE_SYSTEM.md`, not `doc1.md`)
- Include a title and overview at the top of each file
- Use proper markdown formatting
- Link to related documentation using relative links
- Keep documentation up-to-date with code changes

### File Organization

- Group related files in subdirectories when it makes sense
- Use consistent naming conventions
- Prefix system/subsystem documentation with capital letters (e.g., `CPU_MANAGEMENT.md`)
- Use lowercase with hyphens for guides (e.g., `getting-started.md`)

## Documentation Categories

Current documentation includes:

- **System Documentation**: Core systems and architecture
- **Stats and Metrics**: Monitoring, metrics, and performance tracking
- **Game Mechanics**: Screeps-specific features and systems
- **Package Documentation**: Specific documentation for each package

## Wiki Structure

The generated wiki has:

- **Home Page**: Automatically generated table of contents with links to all documentation
- **Section Pages**: Organized by source (general docs, package-specific docs)
- **Source References**: Each page includes a reference to its source file

## Maintenance

The documentation build system:

- Automatically processes markdown links to be wiki-compatible
- Preserves subdirectory structure in filenames
- Generates a comprehensive table of contents
- Includes source file references for traceability
