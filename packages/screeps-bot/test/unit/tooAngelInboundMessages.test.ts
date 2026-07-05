import { assert } from "chai";
import { processQuestMessages } from "../../src/empire/tooangel/questManager";
import { processReputationUpdates } from "../../src/empire/tooangel/reputationManager";
import type { TooAngelMemory } from "../../src/empire/tooangel/types";

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    transactionId: overrides.transactionId ?? "tx-1",
    time: overrides.time ?? Game.time,
    sender: overrides.sender,
    recipient: overrides.recipient,
    resourceType: overrides.resourceType ?? ("energy" as MarketResourceConstant),
    amount: overrides.amount ?? 1,
    from: overrides.from ?? "W9N9",
    to: overrides.to ?? "W1N1",
    description: overrides.description ?? "{}",
    order: overrides.order
  };
}

function setIncomingTransactions(transactions: Transaction[]): void {
  (Game.market as { incomingTransactions: Transaction[] }).incomingTransactions = transactions;
}

function tooAngelMemory(): TooAngelMemory {
  return (Memory as Memory & { tooangel: TooAngelMemory }).tooangel;
}

describe("TooAngel inbound terminal message safety", () => {
  beforeEach(() => {
    (globalThis as unknown as { Game: Partial<Game> }).Game = {
      time: 1000,
      market: { incomingTransactions: [] }
    };
    (globalThis as unknown as { Memory: Partial<Memory> }).Memory = {};
  });

  it("accepts trusted NPC-room quest messages", () => {
    (Memory as Memory & { tooangel: Partial<TooAngelMemory> }).tooangel = {
      npcRooms: {
        W9N9: { roomName: "W9N9", lastSeen: 900, hasTerminal: true, availableQuests: ["q1"] }
      }
    };
    setIncomingTransactions([
      makeTransaction({
        transactionId: "trusted-quest",
        from: "W9N9",
        description: JSON.stringify({ type: "quest", id: "q1", room: "W8N8", quest: "buildcs", end: 2000 })
      })
    ]);

    processQuestMessages();

    assert.equal(tooAngelMemory().activeQuests.q1?.targetRoom, "W8N8");
    assert.equal(tooAngelMemory().activeQuests.q1?.originRoom, "W9N9");
    assert.deepEqual(tooAngelMemory().recentTransactionIds, ["trusted-quest"]);
  });

  it("accepts quest replies from an active quest origin", () => {
    (Memory as Memory & { tooangel: Partial<TooAngelMemory> }).tooangel = {
      activeQuests: {
        q1: {
          id: "q1",
          type: "buildcs",
          status: "applied",
          targetRoom: "",
          originRoom: "W8N8",
          deadline: 0,
          appliedAt: 950
        }
      }
    };
    setIncomingTransactions([
      makeTransaction({
        transactionId: "active-origin-quest",
        from: "W8N8",
        description: JSON.stringify({ type: "quest", id: "q1", room: "W7N7", quest: "buildcs", end: 2000 })
      })
    ]);

    processQuestMessages();

    assert.equal(tooAngelMemory().activeQuests.q1?.status, "active");
    assert.equal(tooAngelMemory().activeQuests.q1?.targetRoom, "W7N7");
  });

  it("ignores untrusted quest-shaped JSON", () => {
    setIncomingTransactions([
      makeTransaction({
        transactionId: "spoofed-quest",
        sender: { username: "Enemy" },
        from: "W1N1",
        description: JSON.stringify({ type: "quest", id: "q1", room: "W8N8", quest: "buildcs", end: 2000 })
      })
    ]);

    processQuestMessages();

    assert.deepEqual(tooAngelMemory().activeQuests, {});
    assert.deepEqual(tooAngelMemory().recentTransactionIds, []);
  });

  it("rejects non-TooAngel senders even from cached NPC rooms", () => {
    (Memory as Memory & { tooangel: Partial<TooAngelMemory> }).tooangel = {
      npcRooms: {
        W9N9: { roomName: "W9N9", lastSeen: 900, hasTerminal: true, availableQuests: ["q1"] }
      }
    };
    setIncomingTransactions([
      makeTransaction({
        transactionId: "poisoned-npc-room",
        sender: { username: "Enemy" },
        from: "W9N9",
        description: JSON.stringify({ type: "quest", id: "q1", room: "W8N8", quest: "buildcs", end: 2000 })
      })
    ]);

    processQuestMessages();

    assert.deepEqual(tooAngelMemory().activeQuests, {});
    assert.deepEqual(tooAngelMemory().recentTransactionIds, []);
  });

  it("rejects non-TooAngel reputation senders even from cached NPC rooms", () => {
    (Memory as Memory & { tooangel: Partial<TooAngelMemory> }).tooangel = {
      npcRooms: {
        W9N9: { roomName: "W9N9", lastSeen: 900, hasTerminal: true, availableQuests: [] }
      }
    };
    setIncomingTransactions([
      makeTransaction({
        transactionId: "poisoned-npc-reputation",
        sender: { username: "Enemy" },
        from: "W9N9",
        description: JSON.stringify({ type: "reputation", reputation: 666 })
      })
    ]);

    processReputationUpdates();

    assert.equal(tooAngelMemory().reputation.value, 0);
    assert.deepEqual(tooAngelMemory().recentTransactionIds, []);
  });

  it("deduplicates replayed quest transaction IDs", () => {
    (Memory as Memory & { tooangel: Partial<TooAngelMemory> }).tooangel = {
      npcRooms: {
        W9N9: { roomName: "W9N9", lastSeen: 900, hasTerminal: true, availableQuests: ["q1"] }
      }
    };
    setIncomingTransactions([
      makeTransaction({
        transactionId: "replayed-quest",
        from: "W9N9",
        description: JSON.stringify({ type: "quest", id: "q1", room: "W8N8", quest: "buildcs", end: 2000 })
      }),
      makeTransaction({
        transactionId: "replayed-quest",
        from: "W9N9",
        description: JSON.stringify({ type: "quest", id: "q1", room: "W7N7", quest: "buildcs", end: 2000 })
      })
    ]);

    processQuestMessages();

    assert.equal(tooAngelMemory().activeQuests.q1?.targetRoom, "W8N8");
    assert.deepEqual(tooAngelMemory().recentTransactionIds, ["replayed-quest"]);
  });

  it("deduplicates replayed reputation transaction IDs", () => {
    (Memory as Memory & { tooangel: Partial<TooAngelMemory> }).tooangel = {
      npcRooms: {
        W9N9: { roomName: "W9N9", lastSeen: 900, hasTerminal: true, availableQuests: [] }
      }
    };
    setIncomingTransactions([
      makeTransaction({
        transactionId: "replayed-rep",
        from: "W9N9",
        description: JSON.stringify({ type: "reputation", reputation: 42 })
      }),
      makeTransaction({
        transactionId: "replayed-rep",
        from: "W9N9",
        description: JSON.stringify({ type: "reputation", reputation: 7 })
      })
    ]);

    processReputationUpdates();

    assert.equal(tooAngelMemory().reputation.value, 42);
    assert.deepEqual(tooAngelMemory().recentTransactionIds, ["replayed-rep"]);
  });

  it("keeps the replay ring bounded", () => {
    (Memory as Memory & { tooangel: Partial<TooAngelMemory> }).tooangel = {
      npcRooms: {
        W9N9: { roomName: "W9N9", lastSeen: 900, hasTerminal: true, availableQuests: [] }
      }
    };
    setIncomingTransactions(
      Array.from({ length: 125 }, (_, index) =>
        makeTransaction({
          transactionId: `rep-${index}`,
          time: 1000 + index,
          from: "W9N9",
          description: JSON.stringify({ type: "reputation", reputation: index })
        })
      )
    );

    processReputationUpdates();

    assert.lengthOf(tooAngelMemory().recentTransactionIds, 100);
    assert.equal(tooAngelMemory().recentTransactionIds[0], "rep-25");
    assert.equal(tooAngelMemory().recentTransactionIds[99], "rep-124");
  });

  it("keeps malformed trusted messages non-fatal", () => {
    (Memory as Memory & { tooangel: Partial<TooAngelMemory> }).tooangel = {
      npcRooms: {
        W9N9: { roomName: "W9N9", lastSeen: 900, hasTerminal: true, availableQuests: [] }
      }
    };
    setIncomingTransactions([makeTransaction({ transactionId: "bad-json", from: "W9N9", description: "{" })]);

    assert.doesNotThrow(() => {
      processReputationUpdates();
      processQuestMessages();
    });
    assert.deepEqual(tooAngelMemory().recentTransactionIds, []);
  });
});
