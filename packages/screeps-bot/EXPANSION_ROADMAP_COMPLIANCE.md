# Expansion Manager - ROADMAP Compliance

## Overview
This document details how the Expansion Manager implementation aligns with ROADMAP.md Section 7 & 9 requirements for autonomous expansion and remote mining.

## ROADMAP Section 7: Early-Game Strategy – Scout & Static Mining

### Remote-Kandidaten zu identifizieren ✅
**Requirement**: Scout neighboring rooms to identify remote mining candidates
**Implementation**:
- `findRemoteCandidates()` evaluates all scouted rooms in intel database
- Filters by ownership, reservation, highway/SK status
- **NEW**: Added profitability analysis with ROI >2x threshold
- Calculates scores based on sources, distance, threat level, terrain

### Remote-Mining starten ✅
**Requirement**: Start remote mining operations
**Implementation**:
- `updateRemoteAssignments()` manages remote room assignments
- Respects room stability (RCL requirements before remotes)
- Dynamically adjusts remote capacity based on room energy and danger
- **NEW**: Only assigns profitable remotes (energy gain > 2x cost)

### Reservation von Remotes ✅
**Requirement**: Reserve remote controllers (1500 → 3000 energy capacity)
**Implementation**:
- `assignReserverTargets()` assigns claimers as reservers
- Tracks reservation status per remote room
- Profitability calculations assume reservation bonuses

## ROADMAP Section 9: Base-Blueprints (Baupläne)

### Expansion to fill GCL capacity ✅
**Requirement**: Utilize full GCL capacity (so viele Räume kontrollieren, wie der GCL erlaubt)
**Implementation**:
- `isExpansionReady()` checks GCL limits and pacing
- **NEW**: GCL progress threshold (70% before next claim)
- **NEW**: Room stability check (60% of rooms must be RCL 4+)
- **NEW**: Expansion cancellation prevents wasted GCL

### Autonomous Expansion ✅
**Requirement**: Automatic expansion at GCL level-up
**Implementation**:
- EmpireManager scores and queues expansion candidates
- **NEW**: Multi-factor scoring system (12 factors)
- **NEW**: Safety analysis (2-range hostile scanning)
- **NEW**: Cluster-aware prioritization
- ExpansionManager automatically assigns claimers

## New Features Beyond ROADMAP

### Multi-Factor Scoring System ✅
**Purpose**: Optimize room selection quality
**Factors Evaluated**:
1. Source count (2 sources = +40, 1 source = +20)
2. Mineral type (rare minerals like Catalyst = +15)
3. Distance from owned rooms (penalty = distance × 5)
4. Hostile presence (adjacent rooms scan)
5. Threat level (penalty = threat × 15)
6. Terrain quality (plains +15, swamp -10)
7. Highway proximity (+10 strategic bonus)
8. Portal proximity (+5 cross-shard bonus)
9. Controller level (previously owned +2 per RCL)
10. Cluster proximity (close rooms +25 to +5)
11. Highway exclusion (cannot claim)
12. SK room penalty (-50 for special handling)

### Safety Analysis ✅
**Purpose**: Avoid hostile-adjacent and war zone expansion
**Checks**:
- 2-range radius hostile structure scanning
- Adjacent room ownership detection
- War zone detection (between 2+ hostile players)
- Tower and spawn count in nearby rooms
- Path defensibility considerations

### Profitability Calculator ✅
**Purpose**: Only mine profitable remote rooms
**Calculation**:
- Energy cost: harvester (650) + haulers (450 × sources)
- Trip time: distance × 50 ticks
- Trips per lifetime: 1500 / trip time
- Energy gain: (3000 / 300) × sources per tick
- ROI threshold: Must exceed 2.0x

### Expansion Cancellation ✅
**Purpose**: Detect and abort failed expansion attempts
**Triggers**:
- Timeout: 5000 ticks since last evaluation
- Claimer death: No active claimer after 1000 ticks
- Hostile claim: Target room claimed by enemy
- Low energy: Average storage below 20k energy
**Actions**:
- Remove from claim queue
- Clear claimer assignments
- Log cancellation reason

## Performance Targets

### CPU Budget ✅
- ExpansionManager: 0.02 CPU budget (2% of limit)
- Runs every 20 ticks (MediumFrequency)
- Profitability check adds minimal overhead

### Success Rate (Target: 80%+ profitable claims)
**Mechanisms**:
- Safety analysis prevents hostile encounters
- Profitability ensures positive economic contribution
- Cluster preference maintains defensibility
- Cancellation prevents wasted resources

## Testing Coverage

### Unit Tests ✅
- 20+ tests for scoring algorithm
- Safety analysis and war zone detection
- Profitability calculations and ROI
- Expansion cancellation logic
- Edge cases and boundary conditions

### Integration Points
- EmpireManager: Populates claim queue with scored candidates
- ExpansionManager: Consumes queue and manages claiming
- IntelScanner: Provides room intel for scoring
- MemoryManager: Stores expansion state and assignments

## Future Enhancements

### Expansion Templates (Deferred)
**Rationale**: Current scoring system already differentiates based on:
- Room posture (eco, war, defensive)
- War pheromone levels
- Mineral types and strategic value
- Cluster positioning

Template system would provide minimal additional value over the comprehensive multi-factor scoring.

### Portal Tracking
**Status**: Placeholder in scoring system
**Implementation**: Requires RoomIntel schema update to track portal positions

### Alliance Integration
**Status**: Stub implementation (always returns false)
**Implementation**: Removed (alliance system disabled per ROADMAP "Required Code Only" philosophy)

## Compliance Summary

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Remote mining candidate identification | ✅ Complete | `findRemoteCandidates()` |
| Remote mining operations | ✅ Complete | `updateRemoteAssignments()` |
| Remote reservation | ✅ Complete | `assignReserverTargets()` |
| GCL capacity utilization | ✅ Complete | `isExpansionReady()` |
| Autonomous expansion | ✅ Complete | EmpireManager + ExpansionManager |
| Multi-factor scoring | ✅ Core Complete | 12-factor evaluation (portal=stub) |
| Safety analysis | ✅ Complete | 2-range hostile scanning |
| Profitability analysis | ✅ Complete | ROI >2x threshold |
| Expansion cancellation | ✅ Complete | Timeout + failure detection |
| GCL-based timing | ✅ Complete | 70% progress threshold |
| Cluster-aware expansion | ✅ Complete | Distance-based clustering |

**Overall Compliance**: Core implementation complete (11/11 requirements with 2 documented stubs for future enhancement)
