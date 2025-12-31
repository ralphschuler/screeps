# Intelligence & Coordination System

## Overview

The Intelligence & Coordination system provides comprehensive enemy tracking, threat prediction, cross-shard intelligence sharing, and market trend analysis for the Screeps bot.

## Components

### 1. Intel Scanner (`IntelScanner`)

Continuously scans rooms for enemy activity and updates the intelligence database.

**Features:**
- Periodic room scanning with threat-based prioritization
- Enemy player tracking and room ownership monitoring
- Automatic threat level updates based on hostile activity
- Integration with existing room intel database

**Configuration:**
```typescript
{
  updateInterval: 10,        // Scan every 10 ticks
  minBucket: 4000,          // Minimum bucket to run
  maxCpuBudget: 0.02,       // 2% CPU budget
  roomsPerTick: 3,          // Scan 3 rooms per tick
  rescanInterval: 1000,     // Rescan rooms every 1000 ticks
  allies: [],               // Allied player usernames
  aggressionThreshold: 5    // Actions to elevate threat
}
```

**Usage:**
```typescript
import { IntelScanner } from "./empire/intelligence";

const scanner = new IntelScanner();
// The scanner runs automatically via ProcessClass decorator

// Get enemy info
const enemy = scanner.getEnemyPlayer("username");
const allEnemies = scanner.getAllEnemies();

// Note: Allies must be configured at initialization time
// via the config.allies array (manual whitelist)
```

### 2. Threat Predictor (`ThreatPredictor`)

Analyzes hostile movement patterns and predicts potential threats.

**Features:**
- Hostile creep tracking with movement vectors
- Attack vector prediction
- Force strength calculation
- Confidence-based threat alerts

**Configuration:**
```typescript
{
  updateInterval: 20,              // Predict every 20 ticks
  minBucket: 5000,                // Minimum bucket to run
  maxCpuBudget: 0.02,             // 2% CPU budget
  trackHistoryLength: 1000,       // Track history for 1000 ticks
  minThreatStrength: 5,           // Minimum combat parts for alert
  confidenceThreshold: 0.6        // 60% confidence for alerts
}
```

**Usage:**
```typescript
import { ThreatPredictor } from "./empire/intelligence";

const predictor = new ThreatPredictor();

// Get predictions for a room
const predictions = predictor.getPredictionsForRoom("E1N1");

// Get all active predictions
const allPredictions = predictor.getAllPredictions();

// Get high-urgency predictions
const urgent = predictor.getUrgentOpportunities();

// Track specific player's hostiles
const tracks = predictor.getHostileTracksForPlayer("enemyUsername");
```

### 3. Cross-Shard Intelligence (`CrossShardIntelCoordinator`)

Shares intelligence across all shards via InterShardMemory.

**Features:**
- Enemy intelligence sharing across shards
- Global alliance list synchronization
- Compact serialization (fits in 100KB limit)
- Automatic threat response coordination

**Configuration:**
```typescript
{
  updateInterval: 50,      // Sync every 50 ticks
  minBucket: 6000,        // Minimum bucket to run
  maxCpuBudget: 0.01      // 1% CPU budget
}
```

**Usage:**
```typescript
import { CrossShardIntelCoordinator } from "./empire/intelligence";

const coordinator = new CrossShardIntelCoordinator();

// Get global intelligence
const globalEnemies = coordinator.getGlobalEnemies();

// Note: Alliance management methods (addGlobalAlly, removeGlobalAlly, getGlobalAllies) 
// have been removed as part of the alliance system cleanup
```

### 4. Market Trend Analyzer (`MarketTrendAnalyzer`)

Advanced market analysis for trading optimization.

**Features:**
- Supply and demand tracking
- Price momentum analysis
- Volatility assessment
- Trading opportunity detection
- Arbitrage identification

**Configuration:**
```typescript
{
  updateInterval: 500,                    // Analyze every 500 ticks
  minBucket: 7000,                       // Minimum bucket to run
  maxCpuBudget: 0.02,                    // 2% CPU budget
  trackedResources: [                     // Resources to track
    RESOURCE_ENERGY,
    RESOURCE_HYDROGEN,
    // ... more resources
  ],
  highVolatilityThreshold: 0.3,          // 30% volatility warning
  opportunityConfidenceThreshold: 0.7     // 70% confidence threshold
}
```

**Usage:**
```typescript
import { MarketTrendAnalyzer } from "./empire/intelligence";

const analyzer = new MarketTrendAnalyzer();

// Get supply/demand analysis
const analysis = analyzer.getSupplyDemand(RESOURCE_ENERGY);
console.log(`Sentiment: ${analysis.sentiment}`); // -1 to 1

// Get trading opportunities
const opportunities = analyzer.getOpportunities();
const urgentOpps = analyzer.getUrgentOpportunities();

// Check market conditions
const sentiment = analyzer.getMarketSentiment(RESOURCE_ENERGY);
const isTight = analyzer.isMarketTight(RESOURCE_ENERGY);
```

## Integration

All components are automatically registered with the kernel via `@ProcessClass()` decorator and run on their configured intervals. They integrate seamlessly with existing systems:

- **IntelScanner** updates the existing `Memory.empire.knownRooms` database
- **ThreatPredictor** generates alerts and updates room threat levels
- **CrossShardIntelCoordinator** syncs with `InterShardMemory`
- **MarketTrendAnalyzer** enhances the existing `MarketManager`

## Memory Usage

- **Room Intel**: Already tracked in `Memory.empire.knownRooms`
- **Enemy Players**: Stored in-memory Map, not persisted
- **Predictions**: Stored in-memory, regenerated each tick
- **InterShard**: Uses compact serialization, ~5-10KB per shard
- **Market Trends**: Stored in-memory cache

## CPU Impact

Each component uses a small CPU budget:
- IntelScanner: ~0.5-1.0 CPU per tick (scans 3 rooms)
- ThreatPredictor: ~0.3-0.5 CPU per tick (analyzes patterns)
- CrossShardIntel: ~0.1-0.2 CPU per tick (sync every 50 ticks)
- MarketTrendAnalyzer: ~0.5-1.0 CPU per tick (every 500 ticks)

Total overhead: ~1-2% of CPU budget on average.

## Event Integration

Components emit events via the EventBus:

```typescript
// IntelScanner events
eventBus.emit("intel.enemyDiscovered", { username: "enemy" });
eventBus.emit("intel.threatLevelChanged", { room: "E1N1", level: 2 });

// ThreatPredictor events
eventBus.emit("threat.detected", { room: "E1N1", confidence: 0.85 });
eventBus.emit("threat.imminent", { room: "E1N1", strength: 50 });

// MarketTrendAnalyzer events
eventBus.emit("market.opportunity", { resource: RESOURCE_ENERGY, type: "buy" });
eventBus.emit("market.volatility", { resource: RESOURCE_GHODIUM });
```

## Console Commands

Access intelligence data via console:

```javascript
// Get enemy info
global.intel.getEnemyPlayer("username")
global.intel.getAllEnemies()

// Get threat predictions
global.threats.getPredictionsForRoom("E1N1")
global.threats.getAllPredictions()

// Get market opportunities
global.market.getOpportunities()
global.market.getSupplyDemand(RESOURCE_ENERGY)

// Note: Alliance management methods have been removed
// Configure allies at initialization time via config.allies array
```

## Configuration

All components can be configured via their constructors:

```typescript
// In SwarmBot.ts or main initialization
const intelScanner = new IntelScanner({
  roomsPerTick: 5,
  allies: ["ally1", "ally2"]
});

const threatPredictor = new ThreatPredictor({
  confidenceThreshold: 0.8
});

const marketAnalyzer = new MarketTrendAnalyzer({
  trackedResources: [RESOURCE_ENERGY, RESOURCE_POWER]
});
```

## Roadmap Alignment

This implementation follows the ROADMAP.md principles:

- **Decentralization**: Each room's intel is independent
- **Stigmergic Communication**: Uses pheromone-like threat levels
- **Event-driven Logic**: Reacts to hostile detection and market changes
- **Aggressive Caching**: All data cached in-memory with TTL
- **Strict Tick Budget**: Each component uses <2% CPU
- **CPU Bucket Management**: Adjusts frequency based on bucket level

## Future Enhancements

Potential improvements:
1. Machine learning for threat prediction
2. Historical pattern analysis
3. Diplomatic relationship tracking
4. Market price forecasting models
5. Multi-player alliance coordination
6. Automated treaty negotiations
