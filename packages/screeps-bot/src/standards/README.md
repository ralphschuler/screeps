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
- **Status**: Core functionality implemented
- **Features**:
  - Message parsing and reassembly
  - Multi-packet message handling
  - JSON message support
  - Transaction validation

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

### Example 1: Advertising Your Portals

```typescript
import { PortalsProtocol } from "./standards";

// Scan your rooms for portals
const portals = PortalsProtocol.scanRoomForPortals("W1N1");

// Advertise them to allies
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

### Example 3: Advertising Resource Needs

```typescript
import { RoomNeedsProtocol } from "./standards";

// Define thresholds
const thresholds = {
  energy: { min: 50000, max: 200000 },
  U: { min: 1000, max: 5000 },
};

// Calculate needs for a room
const room = Game.rooms["W1N1"];
const needs = RoomNeedsProtocol.calculateRoomNeeds(room, thresholds);

// Advertise needs
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

### Example 6: Processing Incoming Messages

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

### Example 7: Advertising Your Terminals

```typescript
import { TerminalComProtocol } from "./standards";

// Auto-update terminal list every N ticks
if (Game.time % 100 === 0) {
  TerminalComProtocol.updateOurTerminals();
}
```

## TODOs and Future Enhancements

### Compression Support
- **Status**: Not implemented
- **Requirements**: Add `lzstring` library
- **Impact**: Enables compressed segment data for larger payloads
- **Files**: `SS1SegmentManager.ts`

### Multi-Packet Queue
- **Status**: Not implemented
- **Requirements**: Implement packet queue system for multi-tick sends
- **Impact**: Enables messages >100 characters via terminal
- **Files**: `SS2TerminalComms.ts`

### Encryption/Decryption
- **Status**: Not implemented
- **Requirements**: Integration with key exchange and crypto library
- **Impact**: Enables secure encrypted channels
- **Files**: `RoomNeedsProtocol.ts`, `SS1SegmentManager.ts`

### Key Exchange Response
- **Status**: Partially implemented
- **Requirements**: Integration with TerminalComProtocol for room lookup
- **Impact**: Completes key exchange workflow
- **Files**: `KeyExchangeProtocol.ts`

## Integration with Bot Architecture

The standards implementation is designed to be:

1. **Modular**: Can be enabled/disabled per protocol
2. **Non-intrusive**: No dependencies on core bot logic
3. **CPU-efficient**: Only runs when needed
4. **Memory-efficient**: Uses segments for large data

### Adding to Main Loop

To integrate standards into your main loop:

```typescript
import { SS2TerminalComms, TerminalComProtocol } from "./standards";

// In your main loop
if (Game.time % 10 === 0) {
  // Update our terminals list
  TerminalComProtocol.updateOurTerminals();
  
  // Process incoming terminal messages
  const messages = SS2TerminalComms.processIncomingTransactions();
  // ... handle messages
}
```

## Testing

Unit tests are available in `test/unit/standards/`:
- `SS1SegmentManager.test.ts` (5 tests)
- `SS2TerminalComms.test.ts` (11 tests)

Run tests:
```bash
npm run test:unit -- --grep "SS1SegmentManager|SS2TerminalComms"
```

## References

- [Screepers Standards Repository](https://github.com/screepers/screepers-standards)
- [SS1 Specification](https://github.com/screepers/screepers-standards/blob/master/SS1-Default_Public_Segment.md)
- [SS2 Specification](https://github.com/screepers/screepers-standards/blob/master/SS2-Terminal_Communications.md)
- [SS3 Specification](https://github.com/screepers/screepers-standards/blob/master/SS3-Unified_Credentials_File.md)
- ROADMAP.md Section 24: Screepers Standards Integration

## License

This implementation follows the same license as the main bot (Unlicense).
The Screepers Standards themselves are under MIT License.
