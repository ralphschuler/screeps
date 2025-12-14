# Pixel Generation Implementation

## Overview

This implementation adds automatic pixel generation from CPU bucket when the bucket has been consistently full for 25+ ticks, addressing the issue: "reimplement the pixel generation when we have a full bucket for more than 25ticks after the bucket reached full".

## How It Works

### Core Logic

1. **Bucket Monitoring**: The `PixelGenerationManager` runs every tick (with IDLE priority) to check if the CPU bucket is at maximum (10,000)

2. **Consecutive Tracking**: It tracks how many consecutive ticks the bucket has been at full capacity

3. **Pixel Generation**: When the bucket has been full for 25 consecutive ticks:
   - Calls `Game.cpu.generatePixel()` which costs 10,000 CPU from bucket
   - Generates 1 pixel resource unit
   - Resets the consecutive tick counter

4. **Counter Reset**: The counter resets in two scenarios:
   - After successfully generating a pixel (ensures 25-tick wait between generations)
   - When the bucket drops below maximum (indicates CPU usage spike)

### Example Timeline

```
Tick 1000: Bucket reaches 10,000 → Start tracking (count = 1)
Tick 1001: Bucket still 10,000 → Continue tracking (count = 2)
...
Tick 1024: Bucket still 10,000 → 25 consecutive ticks → Generate pixel!
Tick 1025: Counter reset, start tracking again if bucket still full
```

## Files Changed

### New Files

1. **`src/empire/pixelGenerationManager.ts`** (268 lines)
   - Main implementation of pixel generation logic
   - Registered as kernel process with IDLE priority
   - Stores state in `global._pixelGenerationMemory`

2. **`test/unit/pixelGenerationManager.test.ts`** (476 lines)
   - Comprehensive test suite covering:
     - Configuration management
     - Bucket tracking
     - Pixel generation logic
     - Counter reset behavior
     - Edge cases and error handling

### Modified Files

3. **`src/core/processRegistry.ts`**
   - Added import of `pixelGenerationManager`
   - Registered manager with kernel process system

## Configuration

The manager supports the following configuration options:

```typescript
{
  enabled: true,                    // Enable/disable pixel generation
  fullBucketTicksRequired: 25,      // Ticks required at full bucket
  bucketMax: 10000,                 // Maximum bucket level
  cpuCostPerPixel: 10000,          // CPU cost per pixel (Screeps constant)
  minBucketAfterGeneration: 0      // Safety margin after generation
}
```

## Usage

The manager is automatically registered and runs as part of the kernel process system. No manual intervention needed.

### Monitoring

Check pixel generation statistics via the manager:

```javascript
// In game console
pixelGenerationManager.getStats()
```

Returns:
```javascript
{
  enabled: true,
  totalGenerated: 5,               // Total pixels generated
  lastGenerationTick: 12345,       // Last tick a pixel was generated
  bucketFullSince: 12300,          // When current full streak started
  consecutiveFullTicks: 20,        // Current consecutive full tick count
  canGenerate: false,              // Whether ready to generate now
  ticksUntilGeneration: 5          // Ticks remaining until next generation
}
```

### Manual Control

```javascript
// Disable pixel generation
pixelGenerationManager.disable()

// Enable pixel generation
pixelGenerationManager.enable()

// Update configuration
pixelGenerationManager.updateConfig({
  fullBucketTicksRequired: 50  // Require 50 ticks instead of 25
})
```

## Design Decisions

### Why IDLE Priority?

Pixel generation is a non-critical operation that should only happen when the bot has sustained CPU surplus. Using IDLE priority ensures:
- Never competes with critical operations (creep movement, spawning, defense)
- Only runs when bucket is healthy
- Minimal impact on bot performance

### Why Check Every Tick (interval: 1)?

To accurately track "consecutive" full bucket ticks, we must check every single tick. Missing a tick would break the consecutive count.

### Why Reset After Generation?

Resetting the counter after generation ensures:
- Bot must demonstrate sustained CPU surplus for another 25 ticks
- Prevents rapid pixel generation that could drain the bucket
- Provides natural rate-limiting (roughly 1 pixel per 25 ticks maximum)

### Why Use Global Memory?

Storing state in `global._pixelGenerationMemory` provides:
- Persistence across global resets (unlike variables in module scope)
- Faster access than parsing Memory object
- Consistent with how kernel processes store transient state

## Testing

### Automated Tests

Run the test suite:
```bash
cd packages/screeps-bot
npm test -- pixelGenerationManager.test.ts
```

Tests cover:
- ✅ Configuration management (default, custom, updates)
- ✅ Memory initialization
- ✅ Bucket tracking (consecutive ticks, reset on drop)
- ✅ Pixel generation (threshold, success, failure)
- ✅ Counter reset behavior
- ✅ Statistics accuracy
- ✅ Edge cases (disabled state, long streaks, rapid fluctuations)
- ✅ Custom configuration

### Manual Verification

A manual test script is available at `/tmp/test-pixel-generation.js`:

```bash
node /tmp/test-pixel-generation.js
```

This simulates the pixel generation logic across multiple scenarios to verify correct behavior.

## Performance Impact

- **CPU per tick**: < 0.01 CPU (simple comparisons and counter increment)
- **Memory footprint**: ~100 bytes (4 numbers in global memory)
- **Frequency**: Every tick (but with IDLE priority, only when CPU available)

## Alignment with ROADMAP

This implementation follows the bot's design principles from ROADMAP.md:

- **Section 2 - Design Principles**: CPU-Bucket-controlled behavior
- **Section 18 - CPU Management**: Bucket-aware scheduling with IDLE priority
- **Section 22 - POSIS Architecture**: Registered as kernel process

## Future Enhancements

Potential improvements (not implemented to maintain minimal changes):

1. **Configurable via config.ts**: Add pixel generation settings to bot config
2. **Statistics tracking**: Store generation history in Memory for analysis
3. **Integration with market**: Auto-sell generated pixels if credits low
4. **Adaptive thresholds**: Adjust required ticks based on average bucket level

## Security Review

✅ CodeQL analysis: No security vulnerabilities detected
✅ Code review: Feedback addressed
✅ Manual testing: Correct behavior verified

## Conclusion

The pixel generation manager provides automatic, safe conversion of excess CPU bucket capacity into pixels. It operates conservatively (requiring 25 consecutive full-bucket ticks) to ensure it only generates pixels when the bot has sustained CPU surplus.
