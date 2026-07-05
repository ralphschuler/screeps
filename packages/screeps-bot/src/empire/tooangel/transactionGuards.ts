import { getTooAngelMemory } from "./memoryInit";
import type { QuestStatus, TooAngelMemory } from "./types";

const TOOANGEL_USERNAME = "TooAngel";
const REPLAY_RING_LIMIT = 100;
const TRUSTED_QUEST_STATUSES: readonly QuestStatus[] = ["applied", "active"];

interface TooAngelInboundTransaction {
  description: string;
  from: string;
  sender?: { username: string };
  time: number;
  to: string;
  transactionId: string;
}

function transactionKey(transaction: TooAngelInboundTransaction): string {
  if (transaction.transactionId) return transaction.transactionId;
  return [
    transaction.time,
    transaction.sender?.username ?? "unknown",
    transaction.from,
    transaction.to,
    transaction.description
  ].join("|");
}

function trustedOriginRooms(memory: TooAngelMemory): Set<string> {
  const origins = new Set(Object.keys(memory.npcRooms || {}));
  for (const quest of Object.values(memory.activeQuests || {})) {
    if (TRUSTED_QUEST_STATUSES.includes(quest.status) && quest.originRoom) {
      origins.add(quest.originRoom);
    }
  }
  return origins;
}

export function isTrustedTooAngelTransaction(
  transaction: TooAngelInboundTransaction,
  messageOrigin?: string
): boolean {
  if (transaction.sender) {
    return transaction.sender.username === TOOANGEL_USERNAME;
  }

  const memory = getTooAngelMemory();
  const trustedOrigins = trustedOriginRooms(memory);
  if (!trustedOrigins.has(transaction.from)) return false;
  return messageOrigin === undefined || trustedOrigins.has(messageOrigin);
}

export function hasSeenTooAngelTransaction(transaction: TooAngelInboundTransaction): boolean {
  const memory = getTooAngelMemory();
  return memory.recentTransactionIds.includes(transactionKey(transaction));
}

export function rememberTooAngelTransaction(transaction: TooAngelInboundTransaction): void {
  const memory = getTooAngelMemory();
  const key = transactionKey(transaction);
  if (memory.recentTransactionIds.includes(key)) return;

  memory.recentTransactionIds.push(key);
  if (memory.recentTransactionIds.length > REPLAY_RING_LIMIT) {
    memory.recentTransactionIds.splice(0, memory.recentTransactionIds.length - REPLAY_RING_LIMIT);
  }
}

export function shouldProcessTooAngelTransaction(
  transaction: TooAngelInboundTransaction,
  messageOrigin?: string
): boolean {
  if (!isTrustedTooAngelTransaction(transaction, messageOrigin)) return false;
  if (hasSeenTooAngelTransaction(transaction)) return false;
  rememberTooAngelTransaction(transaction);
  return true;
}
