# Screepers Standards Implementation

This directory contains the implementation of the [Screepers Standards](https://github.com/screepers/screepers-standards) for inter-player communication and collaboration in Screeps.

## Overview

The Screepers Standards provide a set of protocols for standardized communication between different players' bots. This enables:

- **Alliance coordination**: Share intelligence, resources, and military support
- **Portal mapping**: Collaborative portal network discovery
- **Resource trading**: Alternative to the in-game market for allied players
- **Emergency assistance**: Coordinate evacuation and resource transfers

## Implementation Status

### ✅ Implemented Standards

#### SS1: Default Public Segment (v1.0.0)
- **Location**: `SS1SegmentManager.ts`
- **Status**: Fully implemented (compression requires lzstring library)
- **Features**:
  - Channel advertising and discovery
  - Multi-segment message support
  - Encryption support (keyid-based)
  - Protocol registration

#### SS2: Terminal Communications (v1.1.0)
- **Location**: `SS2TerminalComms.ts`
- **Status**: Fully implemented
- **Features**:
  - Message parsing and reassembly
  - Multi-packet message handling with queue system
  - Automatic packet transmission across multiple ticks
  - Terminal cooldown management
  - JSON message support
  - Transaction validation
  - CPU budget protection

#### SS3: Unified Credentials File (v1.0)
- **Status**: Documented (optional for build tools)
- **Note**: Implementation in build tools, not runtime code

### ✅ Segment Protocols

#### Portals Protocol
- **Location**: `segment-protocols/PortalsProtocol.ts`
- **Purpose**: Share portal locations between players
- **Features**: Room scanning, aggregation, unstable portal tracking

#### Room Needs Protocol
- **Location**: `segment-protocols/RoomNeedsProtocol.ts`
- **Purpose**: Advertise resource needs and surpluses
- **Features**: Auto-calculation, need matching, priority system

#### Terminal Communications Protocol
- **Location**: `segment-protocols/TerminalComProtocol.ts`
- **Purpose**: List available terminals for communication
- **Features**: Auto-discovery, terminal lookup

### ✅ Terminal Protocols

#### Key Exchange Protocol
- **Location**: `terminal-protocols/KeyExchangeProtocol.ts`
- **Purpose**: Secure key exchange via terminal
- **Features**: Key store, request/response handling

#### Resource Request Protocol
- **Location**: `terminal-protocols/ResourceRequestProtocol.ts`
- **Purpose**: Request and fulfill resource transfers
- **Features**: Auto-fulfillment, transfer queue, priority system

## Usage Examples

### Quick Start with Automation

```typescript
import { 
  ProtocolRegistry, 
  installStandardsCommands 
} from "./standards";

// Initialize in main.ts
ProtocolRegistry.initializeDefaults();
installStandardsCommands();

// Enable protocols you want to use
ProtocolRegistry.enableProtocol('portals');
ProtocolRegistry.enableProtocol('roomneeds');

// Auto-update segment every 100 ticks
if (Game.time % 100 === 0) {
  ProtocolRegistry.updateSegment(true, true); // throttling + compression
}
```

### Example 1: Advertising Your Portals (Automatic)

```typescript
import { PortalsProtocol } from "./standards";

// Auto-scan all owned rooms and advertise
PortalsProtocol.autoAdvertisePortals();

// Manual approach (for specific rooms)
const portals = PortalsProtocol.scanRoomForPortals("W1N1");
PortalsProtocol.advertisePortals(portals);
```

### Example 2: Reading Ally Portals

```typescript
import { PortalsProtocol } from "./standards";

// Read portals from an ally
const allyPortals = PortalsProtocol.readPortals("AllyUsername");

// Aggregate portals from multiple allies
const allPortals = PortalsProtocol.aggregatePortals([
  "Ally1", "Ally2", "Ally3"
]);
```

### Example 3: Advertising Resource Needs (Automatic)

```typescript
import { RoomNeedsProtocol } from "./standards";

// Auto-calculate and advertise needs for all rooms
RoomNeedsProtocol.autoAdvertiseNeeds();

// Custom thresholds (optional)
const customThresholds = {
  energy: { min: 50000, max: 200000 },
  power: { min: 1000, max: 5000 },
  [RESOURCE_UTRIUM]: { min: 1000, max: 5000 },
};
RoomNeedsProtocol.autoAdvertiseNeeds(customThresholds);

// Manual approach (for specific room)
const room = Game.rooms["W1N1"];
const needs = RoomNeedsProtocol.calculateRoomNeeds(room, customThresholds);
RoomNeedsProtocol.advertiseNeeds(needs);
```

### Example 4: Finding Resource Matches

```typescript
import { RoomNeedsProtocol } from "./standards";

// Get our needs
const ourNeeds = [...]; // Your needs array

// Find matching trades with an ally
const matches = RoomNeedsProtocol.findMatches(ourNeeds, "AllyUsername");

// Process matches
for (const match of matches) {
  console.log(`Trade: ${match.ourNeed.resource} 
    ${match.ourNeed.amount} <-> ${match.theirNeed.amount}`);
}
```

### Example 5: Requesting Resources

```typescript
import { ResourceRequestProtocol } from "./standards";

const terminal = Game.rooms["W1N1"].terminal;
if (terminal) {
  // Send resource request
  const requestId = ResourceRequestProtocol.sendRequest(
    terminal,
    "E10S10", // Ally's room
    RESOURCE_ENERGY,
    10000,
    "W1N1", // Our destination room
    8 // Priority 1-10
  );
  
  console.log(`Sent resource request: ${requestId}`);
}
```

### Example 6: Sending Multi-Packet Messages

```typescript
import { SS2TerminalComms } from "./standards";

const terminal = Game.rooms["W1N1"].terminal;
if (terminal) {
  // Long message that requires multiple packets
  const longMessage = SS2TerminalComms.formatJSON({
    type: "report",
    data: {
      rooms: ["W1N1", "W2N1", "W3N1"],
      stats: { /* lots of data */ },
      timestamp: Game.time
    }
  });
  
  // Automatically splits and queues packets if message > 100 chars
  // Packets sent automatically each tick respecting terminal cooldown
  const result = SS2TerminalComms.sendMessage(
    terminal,
    "E10S10",           // Target room
    RESOURCE_ENERGY,    // Resource type
    100,                // Amount per packet
    longMessage         // Message (auto-split if needed)
  );
  
  if (result === OK) {
    console.log("Message queued for transmission");
  }
}
```

### Example 7: Processing Incoming Messages

```typescript
import { SS2TerminalComms, ResourceRequestProtocol, KeyExchangeProtocol } from "./standards";

// Process incoming terminal communications
const messages = SS2TerminalComms.processIncomingTransactions();

for (const { sender, message } of messages) {
  // Try resource request protocol
  if (ResourceRequestProtocol.processMessage(sender, message)) {
    continue;
  }
  
  // Try key exchange protocol
  if (KeyExchangeProtocol.processMessage(sender, message)) {
    continue;
  }
  
  // Unknown message type
  console.log(`Unknown message from ${sender}: ${message}`);
}
```

### Example 8: Advertising Your Terminals

```typescript
import { TerminalComProtocol } from "./standards";

// Auto-update terminal list every N ticks
if (Game.time % 100 === 0) {
  TerminalComProtocol.updateOurTerminals();
}
```

### Example 9: Using Protocol Registry

```typescript
import { ProtocolRegistry } from "./standards";

// Initialize default protocols
ProtocolRegistry.initializeDefaults();

// Enable protocols you want
ProtocolRegistry.enableProtocol('portals');
ProtocolRegistry.enableProtocol('roomneeds');

// Auto-update segment (with throttling and compression)
if (Game.time % 100 === 0) {
  ProtocolRegistry.updateSegment(true, true);
}

// List active protocols
const active = ProtocolRegistry.getActiveProtocols();
console.log(`Active protocols: ${active.size}`);

// Disable a protocol
ProtocolRegistry.disableProtocol('portals');
```

### Example 10: Segment Discovery

```typescript
import { SS1SegmentManager } from "./standards";

// Discover nearby players (within 5 rooms)
const discovered = SS1SegmentManager.discoverNearbyPlayers(5);

for (const [username, channels] of discovered) {
  console.log(`${username} supports: ${channels.join(", ")}`);
}

// View metrics
const metrics = SS1SegmentManager.getMetrics();
console.log(`Segment reads: ${metrics.segmentReads.success}/${metrics.segmentReads.success + metrics.segmentReads.failure}`);
```

## TODOs and Future Enhancements

### ✅ Automatic Channel Registration
- **Status**: ✅ Implemented
- **Description**: ProtocolRegistry manages active protocols and auto-generates SS1 channels
- **Impact**: Eliminates manual channel management
- **Files**: `ProtocolRegistry.ts`, `SS1SegmentManager.ts`

### ✅ Segment Compression
- **Status**: ✅ Implemented
- **Description**: Automatic compression of large channel data using lz-string
- **Impact**: Fits more data within 100KB segment limit
- **Files**: `SS1SegmentManager.ts`
- **Features**:
  - Auto-compress channels >1000 bytes
  - Transparent decompression on read
  - Fallback to uncompressed if needed

### ✅ Update Throttling
- **Status**: ✅ Implemented
- **Description**: Content hash tracking prevents unnecessary segment writes
- **Impact**: Reduces segment write overhead
- **Files**: `SS1SegmentManager.ts`
- **Features**:
  - 100-tick minimum update interval
  - Hash-based change detection
  - Force update option available

### ✅ Channel Validation
- **Status**: ✅ Implemented
- **Description**: Validates channel configurations before writing
- **Impact**: Prevents malformed segments
- **Files**: `SS1SegmentManager.ts`
- **Features**:
  - Segment ID range validation (0-99)
  - Version format checking
  - Mutually exclusive field validation
  - Type checking

### ✅ Segment Discovery
- **Status**: ✅ Implemented
- **Description**: Auto-discovers nearby player segments
- **Impact**: Enables automatic alliance protocol detection
- **Files**: `SS1SegmentManager.ts`
- **Features**:
  - Scans rooms within 5-room radius
  - TTL-based cache (10,000 ticks)
  - Automatic segment requests

### ✅ Metrics Tracking
- **Status**: ✅ Implemented
- **Description**: Comprehensive segment operation metrics
- **Impact**: Enables communication debugging and monitoring
- **Files**: `SS1SegmentManager.ts`
- **Features**:
  - Read/write success rates
  - Protocol usage statistics
  - Console commands for viewing

### ✅ Console Commands
- **Status**: ✅ Implemented
- **Description**: Full console interface for standards management
- **Impact**: Easy testing and debugging
- **Files**: `consoleCommands.ts`
- **Usage**: See Console Commands section below

### Multi-Packet Queue
- **Status**: ✅ Implemented
- **Description**: Queue system for sending multi-packet messages across multiple ticks
- **Impact**: Enables messages >100 characters via terminal
- **Files**: `SS2TerminalComms.ts`
- **Features**:
  - Persistent queue storage in Memory
  - Automatic packet transmission respecting terminal cooldown
  - CPU budget protection (max 5 CPU per tick)
  - Timeout handling (1000 ticks)
  - Error recovery for missing terminals and insufficient resources

### Encryption/Decryption
- **Status**: ✅ Implemented (basic XOR cipher)
- **Description**: Encryption support in SS1SegmentManager
- **Impact**: Enables secure encrypted channels
- **Files**: `RoomNeedsProtocol.ts`, `SS1SegmentManager.ts`
- **Note**: Uses simple XOR cipher for lightweight encryption

### Key Exchange Response
- **Status**: Partially implemented
- **Requirements**: Integration with TerminalComProtocol for room lookup
- **Impact**: Completes key exchange workflow
- **Files**: `KeyExchangeProtocol.ts`

## Console Commands

The standards module provides comprehensive console commands for easy management and testing.

### Installation

```typescript
import { installStandardsCommands } from "./standards";

// In main.ts or console
installStandardsCommands();
```

### Available Commands

```javascript
// Help
standards.help()                          // Show all available commands

// Protocol Management
standards.initProtocols()                 // Initialize default protocols
standards.listProtocols()                 // List all registered protocols
standards.enableProtocol('portals')       // Enable a protocol
standards.disableProtocol('roomneeds')    // Disable a protocol
standards.updateSegment()                 // Update segment with active protocols

// Metrics
standards.metrics()                       // Show segment operation metrics
standards.resetMetrics()                  // Reset all metrics

// Discovery
standards.discover(5)                     // Discover nearby players (max distance)
standards.listPlayerChannels('username')  // List channels from player
standards.getPlayerPortals('username')    // Get portals from player
standards.getPlayerNeeds('username')      // Get needs from player

// Protocol Actions
standards.advertisePortals()              // Auto-scan and advertise portals
standards.advertiseNeeds()                // Auto-calculate and advertise needs
standards.processTransfers()              // Process queued resource transfers
```

### Example Workflow

```javascript
// 1. Initialize and enable protocols
standards.initProtocols()
standards.enableProtocol('portals')
standards.enableProtocol('roomneeds')
standards.enableProtocol('terminalcom')

// 2. Auto-advertise your data
standards.advertisePortals()    // Scans all owned rooms for portals
standards.advertiseNeeds()      // Calculates needs from all rooms

// 3. Update segment
standards.updateSegment()       // Publishes to segment 0

// 4. Discover allies
standards.discover(5)           // Find nearby players

// 5. View their data
standards.getPlayerPortals('AllyUsername')
standards.getPlayerNeeds('AllyUsername')

// 6. Check performance
standards.metrics()
```

## Integration with Bot Architecture

The standards implementation is designed to be:

1. **Modular**: Can be enabled/disabled per protocol
2. **Non-intrusive**: No dependencies on core bot logic
3. **CPU-efficient**: Only runs when needed
4. **Memory-efficient**: Uses segments for large data

### Adding to Main Loop

The SS2 Terminal Communications queue processing is already integrated into the main game loop (`SwarmBot.ts`):

```typescript
// In SwarmBot.ts (already implemented)
unifiedStats.measureSubsystem("ss2PacketQueue", () => {
  SS2TerminalComms.processQueue(); // Runs every tick
});
```

To process incoming messages and send multi-packet messages:

```typescript
import { SS2TerminalComms, TerminalComProtocol } from "./standards";

// Process incoming terminal messages
const messages = SS2TerminalComms.processIncomingTransactions();
for (const { sender, message } of messages) {
  // Handle messages
}

// Send a multi-packet message (automatically queued if >100 chars)
const terminal = Game.rooms["W1N1"].terminal;
if (terminal) {
  SS2TerminalComms.sendMessage(
    terminal,
    "E10S10",              // Target room
    RESOURCE_ENERGY,       // Resource type
    100,                   // Amount
    "Long message..."      // Message (auto-split if needed)
  );
}
```

## Testing

Unit tests are available in `test/unit/standards/`:
- `SS1SegmentManager.test.ts` (5 tests)
- `SS2TerminalComms.test.ts` (13 tests including queue management)

Run tests:
```bash
npm run test:unit -- --grep "SS1SegmentManager|SS2TerminalComms"
```

### Queue System Test Coverage
The SS2 multi-packet queue system has comprehensive test coverage:
- Single-packet message handling
- Multi-packet message queueing
- Sequential packet transmission across ticks
- Terminal cooldown respect
- Missing terminal error handling
- Insufficient resources retry logic
- Critical error cleanup
- Queue item expiration

## References

- [Screepers Standards Repository](https://github.com/screepers/screepers-standards)
- [SS1 Specification](https://github.com/screepers/screepers-standards/blob/master/SS1-Default_Public_Segment.md)
- [SS2 Specification](https://github.com/screepers/screepers-standards/blob/master/SS2-Terminal_Communications.md)
- [SS3 Specification](https://github.com/screepers/screepers-standards/blob/master/SS3-Unified_Credentials_File.md)
- ROADMAP.md Section 24: Screepers Standards Integration

## License

This implementation follows the same license as the main bot (Unlicense).
The Screepers Standards themselves are under MIT License.
