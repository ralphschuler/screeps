# @ralphschuler/screeps-pheromones

Pheromone-based coordination system for Screeps swarm architecture.

## Overview

This package implements a stigmergistic communication system using virtual pheromones to coordinate swarm behavior in Screeps. Pheromones enable decentralized decision-making where creeps respond to room-level signals without centralized control.

## Features

- **8 Pheromone Types**: expand, harvest, build, upgrade, defense, war, siege, logistics, nukeTarget
- **Periodic Updates**: Rolling average-based updates every 5-10 ticks
- **Event-Driven Spikes**: Immediate response to hostiles, structure destruction, nukes
- **Decay & Diffusion**: Automatic pheromone decay and propagation to neighbor rooms
- **Metrics Tracking**: Rolling averages for energy, construction, hostiles, damage

## Installation

```bash
npm install @ralphschuler/screeps-pheromones
```

## Usage

```typescript
import { pheromoneManager } from '@ralphschuler/screeps-pheromones';

// Update pheromones periodically
pheromoneManager.updateMetrics(room, swarm);
pheromoneManager.updatePheromones(swarm, room);

// Handle events
pheromoneManager.onHostileDetected(swarm, hostileCount, dangerLevel);
pheromoneManager.onStructureDestroyed(swarm, structureType);
pheromoneManager.onNukeDetected(swarm);

// Apply diffusion to neighbors
pheromoneManager.applyDiffusion(roomSwarmMap);

// Get dominant pheromone
const dominant = pheromoneManager.getDominantPheromone(swarm.pheromones);
```

## Architecture

The pheromone system follows ROADMAP Section 5 specifications:

- **Periodic Updates**: Use rolling averages to smooth metrics over 10 ticks
- **Event Updates**: Immediate spikes for critical events (hostiles, nukes, structure loss)
- **Decay**: Each pheromone type has a decay factor (0.9-0.99) applied per update
- **Diffusion**: High-value pheromones (defense, war, expand) diffuse to neighbors

## API

### PheromoneManager

Main class for managing pheromones.

#### Methods

- `updateMetrics(room: Room, swarm: SwarmState): void` - Update rolling average metrics
- `updatePheromones(swarm: SwarmState, room: Room): void` - Periodic pheromone update with decay
- `onHostileDetected(swarm: SwarmState, count: number, danger: 0|1|2|3): void` - Handle hostile detection
- `onStructureDestroyed(swarm: SwarmState, type: StructureConstant): void` - Handle structure destroyed
- `onNukeDetected(swarm: SwarmState): void` - Handle nuke detection
- `onRemoteSourceLost(swarm: SwarmState): void` - Handle remote source lost
- `applyDiffusion(rooms: Map<string, SwarmState>): void` - Apply diffusion to neighbors
- `getDominantPheromone(pheromones: PheromoneState): keyof PheromoneState | null` - Get highest pheromone

### RollingAverage

Tracks rolling averages for metrics.

#### Methods

- `add(value: number): number` - Add value and return current average
- `get(): number` - Get current average
- `reset(): void` - Clear all values

## License

Unlicense - Public Domain
