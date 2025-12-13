# LarvaWorker Diagnostic Guide

## Overview

This document provides guidance on diagnosing larvaWorker issues using the screeps-mcp server when connected to a live Screeps game.

## Prerequisites

- screeps-mcp server running and connected to your Screeps account
- Access to MCP tools via the screeps-mcp package

## Diagnostic Steps with screeps-mcp

### 1. Check Current Creep Status

Use the `screeps_room_objects` tool to list all creeps in your room:

```typescript
// Example MCP call
screeps_room_objects({
  room: "W1N1"  // Replace with your room name
})
```

**Look for:**
- How many larvaWorker creeps exist
- Their current energy levels
- Their positions relative to spawns and sources

### 2. Check Memory State

Use `screeps_memory_get` to inspect larvaWorker memory:

```typescript
// Check a specific creep's memory
screeps_memory_get({
  path: "creeps.LarvaWorker_12345"  // Replace with actual creep name
})
```

**Verify:**
- `role` is set to "larvaWorker"
- `family` is set to "economy"
- `working` state is properly initialized (true when carrying energy, false when empty)
- No stuck `state` values that would cause idle action loops

### 3. Check Room Energy Sources

Use `screeps_room_objects` to verify energy availability:

```typescript
screeps_room_objects({
  room: "W1N1"
})
```

**Check for:**
- Active sources with energy
- Containers with energy > 100
- Storage with available energy
- Dropped resources on the ground

### 4. Monitor Console Logs

Use `screeps_console` to check for errors or warnings:

```typescript
screeps_console({
  expression: "Memory.log"  // Or check recent console output
})
```

**Look for:**
- "larvaWorker returning idle - no energy sources available"
- "found N containers but distribution returned null"
- "found N sources but distribution returned null"
- Any exceptions related to larvaWorker execution

### 5. Check Spawn Queue

Use `screeps_memory_get` to check spawn queue:

```typescript
screeps_memory_get({
  path: "rooms.W1N1.spawnQueue"
})
```

**Verify:**
- larvaWorker has appropriate priority (should be HIGH = 100 in emergencies)
- No blocking issues preventing larvaWorker spawns

## Common Issues and Solutions

### Issue 1: LarvaWorkers Idle Despite Energy Available

**Symptoms:**
- Containers have energy > 100
- Sources are active
- larvaWorker shows "idle" action

**Diagnosis:**
```typescript
// Check distributed target assignment
screeps_memory_get({
  path: "rooms.W1N1.targetAssignments"
})
```

**Solution:**
- The LARVA_WORKER_FIX.md already added fallback logic for this
- If still occurring, check if `findDistributedTarget` is returning null
- Verify target distribution cache isn't corrupted

### Issue 2: LarvaWorkers Not Spawning

**Symptoms:**
- No larvaWorkers exist
- Spawn queue shows larvaWorker requests but they're not being processed

**Diagnosis:**
```typescript
// Check energy available for spawning
screeps_room_status({
  room: "W1N1"
})
```

**Solution:**
- Verify energy available >= 150 (minimum for ultra-minimal larvaWorker)
- Check if spawn is busy with other creeps
- Verify spawn queue priorities

### Issue 3: LarvaWorkers Stuck at Spawn

**Symptoms:**
- larvaWorkers spawned but remain at spawn position
- No movement to energy sources

**Diagnosis:**
```typescript
// Check creep state
screeps_memory_get({
  path: "creeps.LarvaWorker_12345.state"
})
```

**Solution:**
- This is now fixed - larvaWorkers should use collection points when idle
- Verify `working` state is properly toggling between true/false
- Check that `findEnergy()` is returning valid actions

### Issue 4: Working State Not Initializing

**Symptoms:**
- `working` is undefined in memory
- Creeps flip between collecting and delivering every tick

**Diagnosis:**
```typescript
// Check multiple creeps' working state
screeps_console({
  expression: "Object.values(Game.creeps).filter(c => c.memory.role === 'larvaWorker').map(c => ({name: c.name, working: c.memory.working, energy: c.store.energy}))"
})
```

**Solution:**
- Already fixed in economy.ts - `updateWorkingState()` initializes undefined states
- Verify the fix is deployed to your server

## Code Verification

### Check Current Implementation

1. **Fallback Logic in findEnergy()**
   - File: `packages/screeps-bot/src/roles/behaviors/economy.ts`
   - Lines: 140-195
   - Verify fallback to `findClosestByRange` exists for both containers and sources

2. **Working State Initialization**
   - File: `packages/screeps-bot/src/roles/behaviors/economy.ts`
   - Function: `updateWorkingState()`
   - Verify it handles undefined `working` state

3. **Collection Point Usage**
   - Currently NOT implemented for larvaWorkers (they use build/upgrade when idle)
   - larvaWorkers are designed to always have work (deliver, build, or upgrade)

## Expected Behavior

A properly functioning larvaWorker should:

1. **When Empty (working = false):**
   - Pick up dropped resources
   - Withdraw from containers with energy > 100
   - Withdraw from storage if available
   - Harvest directly from sources as last resort

2. **When Carrying Energy (working = true):**
   - Deliver to spawns/extensions first
   - Deliver to towers if spawn/extensions full
   - Transfer to storage if all structures full
   - Build construction sites
   - Upgrade controller

3. **Never:**
   - Idle when energy sources are available
   - Get stuck at spawn blocking other creeps
   - Flip working state every tick

## Performance Metrics

Monitor these metrics via `screeps_stats`:

- CPU usage per larvaWorker (should be < 0.5 CPU/tick)
- Energy delivered per tick per larvaWorker
- Time between spawns and first delivery
- Percentage of ticks spent idle vs working

## Additional Resources

- LARVA_WORKER_FIX.md - Previous fix for idle deadlock bug
- ROADMAP.md Section 8 - Economy & Infrastructure design
- packages/screeps-bot/test/unit/larvaWorker.test.ts - Unit tests
