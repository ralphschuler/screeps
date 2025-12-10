# Screeps Visuals System

This directory contains the visualization system for the Screeps bot, providing enhanced in-game visualization capabilities.

## Components

### RoomVisual Extensions (`roomVisualExtensions.ts`)

Based on the [screepers/RoomVisual](https://github.com/screepers/RoomVisual) library, this module extends the native `RoomVisual` prototype with additional drawing capabilities.

**Features:**
- **Structure Drawing**: Enhanced visualization for all structure types with accurate, game-like appearances
- **Resource Badges**: Display resource icons with color-coded badges
- **Speech Bubbles**: Show messages above positions (e.g., for spawning creeps)
- **Animated Markers**: Pulsing position indicators for important events
- **Road Connections**: Visual connections between road structures

**Usage:**

The extensions are automatically loaded when the bot starts. You can use them directly on any `RoomVisual` instance:

```typescript
const visual = new RoomVisual("W1N1");

// Draw a spawn structure
visual.structure(25, 25, STRUCTURE_SPAWN);

// Draw a resource badge
visual.resource(RESOURCE_ENERGY, 30, 30, 0.3);

// Show a speech bubble
visual.speech("Spawning!", 25, 25);

// Animated position marker
visual.animatedPosition(20, 20, { color: "#ff0000" });
```

### Room Visualizer (`roomVisualizer.ts`)

The main room-level visualization system that coordinates all visual elements within a room.

**Features:**
- Room statistics panel (RCL, energy, storage, CPU)
- Pheromone visualization (bars and heatmaps)
- Combat information (threat indicators, tower ranges)
- Spawn queue with progress bars and speech bubbles
- Resource flow visualization with badges
- Traffic path indicators
- Enhanced structure visualization
- Blueprint overlays for planned structures

**Configuration:**

You can toggle different visualization features:

```typescript
import { roomVisualizer } from "./visuals/roomVisualizer";

// Toggle specific features
roomVisualizer.toggle("showPheromones");
roomVisualizer.toggle("showCombat");
roomVisualizer.toggle("showResourceFlow");
roomVisualizer.toggle("showStructures");

// Get current configuration
const config = roomVisualizer.getConfig();

// Set custom configuration
roomVisualizer.setConfig({
  showPheromones: true,
  showCombat: true,
  showResourceFlow: true,
  showStructures: false,
  opacity: 0.6
});
```

**Console Commands:**

```javascript
// Toggle visualizations from the game console
help()  // Shows all available commands including visualization controls
```

### Map Visualizer (`mapVisualizer.ts`)

The map-level visualization system for strategic overview across multiple rooms.

**Features:**
- Room status indicators (RCL, danger level, posture)
- Inter-room connections (remotes, military routes)
- Threat indicators (hostiles, nukes)
- Expansion candidate markers
- Resource flow visualization
- Highway room indicators

**Configuration:**

```typescript
import { mapVisualizer } from "./visuals/mapVisualizer";

// Toggle features
mapVisualizer.toggle("showRoomStatus");
mapVisualizer.toggle("showConnections");
mapVisualizer.toggle("showThreats");
mapVisualizer.toggle("showExpansion");
```

## Architecture

The visualization system is designed to be:

1. **Non-blocking**: Visualization errors don't crash the main loop
2. **Configurable**: All features can be toggled on/off
3. **Performance-conscious**: Uses opacity and selective rendering
4. **Modular**: Easy to add new visualization types

## Integration

The visuals are automatically integrated into the main bot loop (`SwarmBot.ts`):

```typescript
// Room-level visuals
for (const room of ownedRooms) {
  roomVisualizer.draw(room);
}

// Map-level visuals
mapVisualizer.draw();
```

## Extending the System

To add new visualization features:

1. **For room-level features**: Add a new method to `RoomVisualizer` class
2. **For map-level features**: Add a new method to `MapVisualizer` class
3. **For new RoomVisual primitives**: Extend `roomVisualExtensions.ts`

Example:

```typescript
// Add a new visualization method
private drawCustomFeature(visual: RoomVisual, room: Room): void {
  // Your visualization code
  visual.structure(10, 10, STRUCTURE_TOWER);
  visual.resource(RESOURCE_ENERGY, 12, 12);
}

// Add it to the draw() method
public draw(room: Room): void {
  // ... existing code ...
  if (this.config.showCustomFeature) {
    this.drawCustomFeature(visual, room);
  }
}
```

## Performance Considerations

- Visuals are only drawn for rooms you have visibility in
- Complex visualizations (structures, resource flow) are disabled by default
- Use the `opacity` configuration to reduce visual clutter
- Consider CPU impact when enabling multiple visualization layers

## Credits

The RoomVisual extensions are based on the excellent [screepers/RoomVisual](https://github.com/screepers/RoomVisual) library by the Screeps community.
