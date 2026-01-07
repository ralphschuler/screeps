# Screepers Standards - Minimal Implementation

This directory contains a **minimal implementation** of [Screepers Standards](https://github.com/screepers/screepers-standards) protocols, following the "Required Code Only" philosophy.

## Currently Implemented

### SS2: Terminal Communications v1.1.0
**Status**: ✅ Active (used in SwarmBot main loop)

Multi-packet message transmission via terminal transactions. Handles splitting large messages into 100-character packets and reassembling them on the receiving end.

**Usage**:
```typescript
// Automatically processes queued packets each tick
SS2TerminalComms.processQueue();

// Send a message (automatically splits if needed)
SS2TerminalComms.sendMessage(terminal, targetRoom, RESOURCE_ENERGY, 100, "your message");
```

**Why we keep this**: Actively used in production for inter-player communication.

## Previously Removed

Following the "Required Code Only" philosophy (ROADMAP Section 2), the following protocols were removed as they were not actively used:

- **SS1: Segment Manager** - Not used anywhere (676 LOC removed)
- **ProtocolRegistry** - Not used anywhere (257 LOC removed)
- **Segment Protocols** (Portals, RoomNeeds, TerminalCom) - Not used (478 LOC removed)
- **Terminal Protocols** (KeyExchange, ResourceRequest) - Not used (638 LOC removed)
- **Console Commands** - Not installed/used (229 LOC removed)

**Total removed**: ~2,278 LOC from standards subsystem

## Future Additions

If additional standards protocols become needed for actual bot functionality, they can be:
1. Reimplemented from the [official standards repository](https://github.com/screepers/screepers-standards)
2. Retrieved from git history
3. Added incrementally as needed

## Reference

- Official Standards: https://github.com/screepers/screepers-standards
- SS2 Specification: https://github.com/screepers/screepers-standards/blob/master/SS2-Terminal_Communications.md
