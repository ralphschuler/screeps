# @ralphschuler/screeps-standards

Screeps communication standards implementation for inter-player messaging and protocols.

## Overview

This package implements the Screepers Standards protocols for Screeps gameplay:

- **SS2**: Terminal Communications - Multi-packet message transmission via terminal transactions

Based on: https://github.com/screepers/screepers-standards

## Installation

```bash
npm install @ralphschuler/screeps-standards
```

## Usage

### SS2 Terminal Communications

```typescript
import { SS2TerminalComms } from '@ralphschuler/screeps-standards';

// Send a multi-packet message via terminal
const terminal = Game.getObjectById('terminalId') as StructureTerminal;
const message = 'Your long message here...';

SS2TerminalComms.queueMessage(
  terminal,
  'W1N1', // Target room
  RESOURCE_ENERGY,
  100, // Amount per packet
  message
);

// Process packet queue each tick
SS2TerminalComms.processPacketQueue();

// Handle incoming terminal transactions
for (const transaction of Game.market.incomingTransactions) {
  if (transaction.description) {
    const message = SS2TerminalComms.parseTransaction(transaction.description);
    if (message) {
      const complete = SS2TerminalComms.receivePacket(transaction.from, message);
      if (complete) {
        console.log('Received complete message:', complete);
      }
    }
  }
}

// Clean up expired messages
SS2TerminalComms.cleanupExpiredMessages();
SS2TerminalComms.cleanupExpiredQueueItems();
```

## API

### SS2TerminalComms

**Static Methods:**

- `parseTransaction(description: string)` - Parse SS2 transaction description
- `queueMessage(terminal, targetRoom, resourceType, amount, message)` - Queue multi-packet message
- `processPacketQueue()` - Send next queued packets
- `receivePacket(sender, message)` - Process received packet, returns complete message if done
- `cleanupExpiredMessages()` - Remove timed-out incomplete messages
- `cleanupExpiredQueueItems()` - Remove timed-out queue items

**Configuration:**

- `MAX_DESCRIPTION_LENGTH = 100` - Maximum terminal description length
- `MESSAGE_CHUNK_SIZE = 91` - Bytes per packet (100 - 9 header bytes)
- `MESSAGE_TIMEOUT = 1000` - Ticks before incomplete message expires
- `QUEUE_TIMEOUT = 1000` - Ticks before queued packets expire

## Protocol Details

### SS2 Message Format

Transaction descriptions follow this format:
```
msg_id|packet_id|{final_packet|}message_chunk
```

- `msg_id`: 3-character alphanumeric message identifier
- `packet_id`: Packet sequence number (0-99)
- `final_packet`: Total packet count (only in first packet)
- `message_chunk`: Piece of the message content

## Memory Usage

The package extends the global Memory interface:

```typescript
interface Memory {
  ss2PacketQueue?: SS2PacketQueue;
}
```

## License

[Unlicense](https://unlicense.org/) - Public Domain

## Credits

Implements protocols from the [Screepers Standards](https://github.com/screepers/screepers-standards) community project.
