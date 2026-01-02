# @ralphschuler/screeps-visuals

Self-contained visualization system for Screeps with optional theming and performance tracking. Extracted from the screeps-bot package to provide an independent, reusable visualization library.

## Features

- **Optional Integration**: Can be completely disabled for production performance
- **Self-Contained**: No hard dependencies on bot internals
- **Performance Tracking**: Built-in CPU cost monitoring
- **Flexible Configuration**: Layer-based control system
- **Multiple Visualizers**: Room, map, and budget dashboards
- **Extensible**: Custom RoomVisual extensions

## Installation

```bash
npm install @ralphschuler/screeps-visuals
```

## Basic Usage

### Room Visualization

```typescript
import { RoomVisualizer } from '@ralphschuler/screeps-visuals';

// Create visualizer instance
const roomVisualizer = new RoomVisualizer();

// Optionally inject memory manager for pheromone visualization
import { memoryManager } from './memory/manager';
roomVisualizer.setMemoryManager(memoryManager);

// In your main loop
for (const room of Object.values(Game.rooms)) {
  if (room.controller?.my) {
    roomVisualizer.draw(room);
  }
}
```

### Map Visualization

```typescript
import { MapVisualizer } from '@ralphschuler/screeps-visuals';

// Create visualizer instance
const mapVisualizer = new MapVisualizer();

// Optionally inject memory manager
mapVisualizer.setMemoryManager(memoryManager);

// In your main loop
mapVisualizer.draw();
```

For complete documentation, see the README.md in this package.
