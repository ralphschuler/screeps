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
- `splitMessage(message: string)` - Frame a non-empty message as one or more SS2 packet descriptions; returns `[]` when the payload is empty or exceeds the SS2 packet limit
- `sendMessage(terminal, targetRoom, resourceType, amount, message)` - Send message (single SS2 packet direct, multi-packet queued; empty/oversized payloads return `ERR_INVALID_ARGS`)
- `processQueue()` - Send next queued packets for multi-packet messages
- `parseJSON<T>(message: string)` - Parse JSON message content
- `formatJSON<T>(data: T)` - Format data as JSON string

**Internal Limits:**

- Terminal description max = `100` characters
- `MESSAGE_CHUNK_SIZE = 91` - Payload characters per packet (100 - 9 header characters)
- Maximum generated packet count = `100` (`packet_id` 0-99), maximum payload length = `9100` characters
- `MESSAGE_TIMEOUT = 1000` - Ticks before incomplete message expires
- `QUEUE_TIMEOUT = 1000` - Ticks before queued packets expire

## Protocol Details

### SS2 Message Format

Transaction descriptions follow this format:

```text
msg_id|packet_id|{final_packet|}message_chunk
```

- `msg_id`: 3-character alphanumeric message identifier generated for outgoing packets; incoming parsing preserves the existing 1-3 character acceptance
- `packet_id`: Packet sequence number (0-99)
- `final_packet`: Final packet index, present only in packet `0`; generated single-packet messages use `0`
- `message_chunk`: Non-empty piece of the message content; pipe characters are allowed inside the payload

The public `parseTransaction()` façade delegates to a pure parser module so protocol syntax stays isolated from Screeps state, packet queues, and terminal side effects. Incoming packet-zero descriptions without a final-packet marker are treated as complete single-packet messages when no buffer exists. Empty payloads are rejected because they cannot produce a parseable SS2 packet. Payloads longer than `91` characters are queued as multi-packet sends, so `sendMessage()` returns `OK` after queueing rather than a synchronous `terminal.send()` result.

## Memory Usage

The package extends the global Memory interface:

```typescript
interface Memory {
  ss2PacketQueue?: SS2PacketQueue;
  ss2TerminalComms?: {
    messageBuffers?: { [key: string]: SS2MessageBufferSerialized };
    nextMessageId?: number;
    processedTransactions?: { [transactionId: string]: number };
  };
}
```

## License

[Unlicense](https://unlicense.org/) - Public Domain

## Credits

Implements protocols from the [Screepers Standards](https://github.com/screepers/screepers-standards) community project.
