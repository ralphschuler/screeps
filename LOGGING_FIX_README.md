# Logging Issue Fix - Deployment Guide

## What Was Fixed

Your bot was stuck showing only bootstrap and emergency logs because:

1. **Emergency Response Bug** - Was creating/deleting state unnecessarily, causing log spam
2. **Low Bucket Mode** - Your bot was in permanent low bucket mode, filtering out most systems
3. **Pixel Generation** - Automatically generating pixels was depleting your bucket from 10,000 to 0 every time it filled

## Changes Made

✅ Fixed emergency response spam
✅ Added visibility into bucket mode (logs every 100 ticks when bucket is low)
✅ Disabled automatic pixel generation
✅ Added comprehensive documentation

## What to Expect After Deploying

### Phase 1: Bucket Recovery (0-30 minutes)
While your bucket is below 2000, you'll see:
```
Bucket LOW mode: 1850/10000 bucket. Running 15/42 processes (filtering LOW/MEDIUM priority)
BOOTSTRAP MODE: 1 active energy producers (1 larva, 0 harvest), 1 total. Energy: 508/1800
```

This is **normal and expected**. Your bot is:
- ✅ Running your rooms
- ✅ Running your creeps  
- ✅ Spawning new creeps
- ✅ Responding to threats
- ⏸️ Temporarily pausing empire/market/expansion to save CPU

### Phase 2: Normal Operation (After bucket > 2000)
You'll see logs from all systems:
```
Kernel: Bucket mode changed from low to normal (bucket: 2150)
[Empire] Analyzing expansion targets...
[Market] Scanning market orders...
[Cluster] Coordinating resource transfers...
[Room:W1N1] Construction sites: 3 active
```

## Action Required: None (Unless...)

### If You Want Pixels

Automatic pixel generation is now **disabled by default**. This prevents your bucket from being depleted.

**To generate pixels manually:**
```javascript
// 1. Wait for stable high bucket
console.log(Game.cpu.bucket); // Should be >9000

// 2. Generate pixel when ready
Game.cpu.generatePixel();

// 3. Wait for recovery before generating another
```

### If You Want to Re-enable Auto Pixel Generation (Not Recommended)

⚠️ **Warning**: Only do this if your CPU usage is consistently well below your limit and bucket stays at 10,000.

Edit `packages/screeps-bot/src/core/kernel.ts`:
```typescript
// Change line 182 from:
pixelGenerationEnabled: false,
// To:
pixelGenerationEnabled: true,
```

## Monitoring After Deployment

### First 10 Minutes
Watch for:
- Bucket level increasing (check every few minutes)
- "Bucket LOW mode" messages decreasing in frequency
- No more "Emergency resolved" spam

### After 30 Minutes
Should see:
- Bucket above 2000 (ideally 5000+)
- "Bucket mode changed from low to normal" message
- Logs from Empire, Market, Cluster, Expansion systems
- All rooms and creeps operating normally

### If Bucket Doesn't Recover

Check for:
1. **Too many rooms** - You may have claimed more rooms than your CPU can handle
2. **CPU-intensive code** - Profile your code to find hotspots
3. **Excessive creeps** - Reduce creep counts if spawning too many

See `packages/screeps-bot/BUCKET_MANAGEMENT.md` for detailed troubleshooting.

## Files to Review

- `packages/screeps-bot/BUCKET_MANAGEMENT.md` - Comprehensive guide on bucket management
- `src/defense/emergencyResponse.ts` - Emergency response fix
- `src/core/kernel.ts` - Bucket mode logging and pixel generation config
- `src/core/coreProcessManager.ts` - Pixel generation process

## Questions?

If you have questions or the issue persists:
1. Check your CPU bucket level: `Game.cpu.bucket`
2. Check which processes are running: `kernel.getProcesses().filter(p => p.stats.lastRunTick === Game.time)`
3. Review the new logs explaining bucket mode
4. Read `BUCKET_MANAGEMENT.md` for detailed explanations

## Summary

Your logging issue was caused by automatic pixel generation keeping your bucket perpetually low. With pixel generation disabled, your bucket will recover, all systems will resume, and you'll see normal comprehensive logging from all subsystems.

**Bottom line**: Just deploy and wait 10-30 minutes. Your bot will recover on its own.
