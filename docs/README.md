# Documentation

This directory contains general documentation for the Screeps project.

## Documentation Structure

Documentation for this project is organized as follows:

- **Root `docs/` directory**: General project documentation, guides, and system overviews
- **`docs/adr/` directory**: Architecture Decision Records (ADRs) documenting key architectural choices
- **Package `docs/` directories**: Package-specific documentation in `packages/*/docs/`

## Architecture Decision Records (ADRs)

The **[docs/adr/](adr/README.md)** directory contains comprehensive Architecture Decision Records that document:

- Why certain architectural patterns were chosen
- Trade-offs between different approaches
- Performance implications of design decisions
- Historical context for future refactoring

**Key ADRs**:
- [ADR-0001: POSIS Process Architecture](adr/0001-posis-process-architecture.md)
- [ADR-0002: Pheromone Coordination System](adr/0002-pheromone-coordination-system.md)
- [ADR-0003: Cartographer Traffic Management](adr/0003-cartographer-traffic-management.md)
- [ADR-0004: Five-Layer Swarm Architecture](adr/0004-five-layer-swarm-architecture.md)
- [ADR-0005: Memory Segment vs Heap Storage](adr/0005-memory-segment-vs-heap-storage.md)
- [ADR-0006: Cache Strategy and TTL Policy](adr/0006-cache-strategy-and-ttl-policy.md)
- [ADR-0007: Spawn Queue Prioritization](adr/0007-spawn-queue-prioritization.md)
- [ADR-0008: Tower Targeting Algorithm](adr/0008-tower-targeting-algorithm.md)

See [adr/README.md](adr/README.md) for the complete ADR index and template.

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

- **Architecture Decision Records (ADRs)**: Key architectural decisions and their rationale
  - See [adr/README.md](adr/README.md) for the complete ADR catalog
- **System Documentation**: Core systems and architecture
- **Stats and Metrics**: Monitoring, metrics, and performance tracking
- **Game Mechanics**: Screeps-specific features and systems
- **State Machines**: Creep behavior visualization and documentation
  - [State Machine Overview](STATE_MACHINES.md) - Architecture and common patterns
  - [State Machine Gallery](STATE_MACHINE_GALLERY.md) - Visual index of all 26 creep roles
  - Individual role diagrams in `state-machines/` subdirectories
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
