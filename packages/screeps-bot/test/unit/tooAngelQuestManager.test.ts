import { assert } from "chai";
import { processQuestMessages } from "../../src/empire/tooangel/questManager";

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

  it("skips terminal transactions already processed in previous ticks", () => {
    const oldQuest = JSON.stringify({ type: "quest", id: "old", room: "W1N1", quest: "buildcs", end: 3000 });
    const newQuest = JSON.stringify({ type: "quest", id: "new", room: "W2N2", quest: "buildcs", end: 3000 });

    setupGame(2000, [
      { transactionId: "old", time: 1500, from: "W0N0", to: "W1N1", description: oldQuest },
      { transactionId: "new", time: 2000, from: "W0N0", to: "W1N1", description: newQuest }
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
