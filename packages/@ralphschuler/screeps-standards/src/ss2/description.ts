import type { SS2TransactionMessage } from "../types.js";

/**
 * SS2 terminal transaction description.
 *
 * The Screepers Standard stores message packets in the terminal transaction
 * description field. Packet zero may prefix the payload with the final packet
 * index so receivers know when all chunks have arrived.
 *
 * Wire examples:
 * - `abc|0|2|hello` → first packet, final packet index 2, payload `hello`
 * - `abc|1|world` → continuation packet, payload `world`
 */
const TRANSACTION_DESCRIPTION_PATTERN = /^([\da-zA-Z]{1,3})\|([\d]{1,2})\|(.+)$/;

/**
 * Packet-zero-only marker: `<finalPacket>|<messageChunk>`.
 *
 * This deliberately requires a non-empty chunk after the marker. Existing
 * behavior treats `abc|0|2|` as payload `2|`, not as an empty final chunk.
 */
const FIRST_PACKET_FINAL_MARKER_PATTERN = /^(\d{1,2})\|(.+)$/;

/**
 * Parse an SS2 terminal transaction description into its packet fields.
 *
 * This pure parser is intentionally separate from `SS2TerminalComms` so the
 * class can focus on Screeps state, queues, and terminal side effects.
 */
export function parseSS2TransactionDescription(
  description: string
): SS2TransactionMessage | null {
  const match = description.match(TRANSACTION_DESCRIPTION_PATTERN);

  if (!match) {
    return null;
  }

  const msgId = match[1];
  const packetId = parseInt(match[2], 10);
  let messageChunk = match[3];
  let finalPacket: number | undefined;

  if (packetId === 0) {
    const finalPacketMatch = messageChunk.match(FIRST_PACKET_FINAL_MARKER_PATTERN);
    if (finalPacketMatch) {
      finalPacket = parseInt(finalPacketMatch[1], 10);
      messageChunk = finalPacketMatch[2];
    }
  }

  return {
    msgId,
    packetId,
    finalPacket,
    messageChunk,
  };
}
