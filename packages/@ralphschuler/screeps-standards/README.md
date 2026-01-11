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

SS2TerminalComms.sendMessage(
  terminal,
  'W1N1', // Target room
  RESOURCE_ENERGY,
  100, // Amount per packet
  message
);

// Process packet queue each tick
SS2TerminalComms.processQueue();

// Handle incoming terminal transactions
const incomingMessages = SS2TerminalComms.processIncomingTransactions();
for (const { sender, message } of incomingMessages) {
  console.log(`Received complete message from ${sender}:`, message);
}
```

## API

### SS2TerminalComms

**Static Methods:**

- `parseTransaction(description: string)` - Parse SS2 transaction description
- `processIncomingTransactions()` - Process all incoming transactions and return complete messages
- `splitMessage(message: string)` - Split message into chunks for multi-packet transmission
- `sendMessage(terminal, targetRoom, resourceType, amount, message)` - Send message (single or multi-packet)
- `processQueue()` - Send next queued packets for multi-packet messages
- `parseJSON<T>(message: string)` - Parse JSON message content
- `formatJSON<T>(data: T)` - Format data as JSON string

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
