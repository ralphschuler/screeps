import { assert } from "chai";
import { parseQuestSign, scanRoomForNPC } from "../../src/empire/tooangel/npcDetector";
import { parseQuestMessage, processQuestMessages } from "../../src/empire/tooangel/questManager";
import { parseReputationResponse, processReputationUpdates } from "../../src/empire/tooangel/reputationManager";

const previousGame = (global as any).Game;
const previousMemory = (global as any).Memory;

function setupGame(time: number, incomingTransactions: any[]): void {
  (global as any).Game = {
    time,
    market: { incomingTransactions }
  };
  (global as any).Memory = {};
}

describe("TooAngel quest manager", () => {
  afterEach(() => {
    (global as any).Game = previousGame;
    (global as any).Memory = previousMemory;
  });

  it("skips literal undefined messages before JSON parsing", () => {
    const originalParse = JSON.parse;
    let undefinedParseAttempts = 0;
    JSON.parse = ((text: string, reviver?: (this: any, key: string, value: any) => any) => {
      if (text === "undefined") undefinedParseAttempts++;
      return originalParse(text, reviver);
    }) as typeof JSON.parse;

    try {
      assert.isNull(parseQuestMessage("undefined"));
      assert.isNull(parseReputationResponse("undefined"));
      assert.isNull(parseQuestSign("undefined"));
      assert.equal(undefinedParseAttempts, 0, "known non-JSON marker should be rejected before JSON.parse");
    } finally {
      JSON.parse = originalParse;
    }
  });

  it("detects quest NPC rooms only from TooAngel-signed controllers", () => {
    const sign = JSON.stringify({ type: "quest", id: "q1", origin: "W9N9", info: "https://tooangel.example/q1" });
    const room = {
      name: "W9N9",
      controller: { sign: { username: "TooAngel", text: sign } },
      terminal: { my: false }
    } as unknown as Room;

    const npcRoom = scanRoomForNPC(room);

    assert.equal(npcRoom?.roomName, "W9N9");
    assert.deepEqual(npcRoom?.availableQuests, ["q1"]);
  });

  it("rejects spoofed quest signs from non-TooAngel controllers", () => {
    const sign = JSON.stringify({ type: "quest", id: "q1", origin: "W9N9", info: "https://tooangel.example/q1" });
    const room = {
      name: "W9N9",
      controller: { sign: { username: "Enemy", text: sign } },
      terminal: { my: false }
    } as unknown as Room;

    assert.isNull(scanRoomForNPC(room));
  });

  it("continues quest processing after malformed transaction descriptions", () => {
    const validQuest = JSON.stringify({ type: "quest", id: "valid", room: "W2N2", quest: "buildcs", end: 3000 });

    setupGame(2000, [
      { transactionId: "bad", time: 1999, from: "W0N0", to: "W1N1", description: "undefined" },
      { transactionId: "valid", time: 2000, sender: { username: "TooAngel" }, from: "W0N0", to: "W1N1", description: validQuest }
    ]);

    assert.doesNotThrow(() => processQuestMessages());

    const quests = (global as any).Memory.tooangel.activeQuests;
    assert.property(quests, "valid", "valid quest after malformed transaction should still be handled");
    assert.equal((global as any).Memory.tooangel.lastProcessedTick, 2000);
  });

  it("continues reputation processing after malformed transaction descriptions", () => {
    const validReputation = JSON.stringify({ type: "reputation", reputation: 42 });

    setupGame(2000, [
      { transactionId: "bad", time: 1999, from: "W0N0", to: "W1N1", description: "undefined" },
      { transactionId: "valid", time: 2000, sender: { username: "TooAngel" }, from: "W0N0", to: "W1N1", description: validReputation }
    ]);

    assert.doesNotThrow(() => processReputationUpdates());
    assert.equal((global as any).Memory.tooangel.reputation.value, 42);
  });

  it("skips terminal transactions already processed in previous ticks", () => {
    const oldQuest = JSON.stringify({ type: "quest", id: "old", room: "W1N1", quest: "buildcs", end: 3000 });
    const newQuest = JSON.stringify({ type: "quest", id: "new", room: "W2N2", quest: "buildcs", end: 3000 });

    setupGame(2000, [
      { transactionId: "old", time: 1500, sender: { username: "TooAngel" }, from: "W0N0", to: "W1N1", description: oldQuest },
      { transactionId: "new", time: 2000, sender: { username: "TooAngel" }, from: "W0N0", to: "W1N1", description: newQuest }
    ]);
    (global as any).Memory.tooangel = {
      enabled: true,
      reputation: { value: 0, lastUpdated: 0 },
      npcRooms: {},
      activeQuests: {},
      completedQuests: [],
      lastProcessedTick: 1500
    };

    processQuestMessages();

    const quests = (global as any).Memory.tooangel.activeQuests;
    assert.notProperty(quests, "old", "old transactions should not be replayed");
    assert.property(quests, "new", "current unprocessed transactions should still be handled");
    assert.equal((global as any).Memory.tooangel.lastProcessedTick, 2000);
  });
});
