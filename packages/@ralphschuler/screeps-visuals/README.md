# @ralphschuler/screeps-visuals

Self-contained visualization system for Screeps with optional theming and performance tracking. Extracted from the screeps-bot package to provide an independent, reusable visualization library.

## Features

- **Optional Integration**: Can be completely disabled for production performance
- **Self-Contained**: No hard dependencies on bot internals
- **Performance Tracking**: Built-in CPU cost monitoring
- **Flexible Configuration**: Layer-based control system
- **Multiple Visualizers**: Room, map, and budget dashboards
- **Extensible**: Custom RoomVisual extensions

## Module structure

The package keeps public APIs small (`RoomVisualizer`, `MapVisualizer`, budget dashboards) and hides drawing policy in internal rule modules:

- `room-visualizer/pheromoneRules.ts` maps ROADMAP-style swarm pheromone values to bar colors, fill widths, and the dominant room overlay.
- `room-visualizer/renderRules.ts` scores hostile creep threat and assigns combat/structure visual styles. It is visualization-only; defense targeting remains in defense packages.
- `room-visualizer/resourceFlowRules.ts` selects compact resource badges and computes animated flow-dot positions.

This keeps `roomVisualizer.ts` focused on orchestration: read room/swarm state, check enabled layers, call `RoomVisual`, and report per-layer CPU cost.

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
