# @ralphschuler/screeps-clusters

Colony cluster management and inter-room coordination for multi-room operations.

## Status

⚠️ **Work in Progress**: This package is currently being extracted from the monolith and has dependencies that are being resolved.

## Planned Features

### Cluster Manager
Central coordination for multi-room colonies:
- Colony grouping and hierarchy
- Resource pooling across rooms
- Defense coordination
- Expansion planning

### Military Coordination
Multi-room military operations:
- Squad formation and management
- Rally point coordination
- Attack target selection
- Offensive doctrine

### Resource Sharing
Inter-room resource distribution:
- Resource pooling
- Transfer requests
- Priority-based allocation

### Offensive Operations
Coordinated attacks and sieges:
- Operation planning
- Squad deployment
- Target prioritization

## Installation

```bash
npm install @ralphschuler/screeps-clusters
```

## Usage (Planned)

```typescript
import { clusterManager } from '@ralphschuler/screeps-clusters';

// Coordinate cluster operations
clusterManager.tick();
```

## Dependencies

This package requires:
- `@ralphschuler/screeps-core` - For logging and events
- Additional monolith dependencies (being resolved)

## Development Status

Current extraction progress:
- [x] Package structure created
- [x] Source files moved
- [ ] Dependencies resolved
- [ ] Tests migrated
- [ ] Build successful
- [ ] Documentation complete

## License

Unlicense
