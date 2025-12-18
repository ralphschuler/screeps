/**
 * Unit tests for TooAngel Diplomacy/Quest System
 */

import { expect } from "chai";
import {
  parseQuestSign,
  parseQuestMessage,
  parseReputationResponse
} from "../../src/empire/tooangel";
import type { TooAngelQuestSign, TooAngelQuest } from "../../src/empire/tooangel/types";

describe("TooAngel System", () => {
  describe("NPC Detector", () => {
    describe("parseQuestSign", () => {
      it("should parse valid quest sign JSON", () => {
        const signText = JSON.stringify({
          type: "quest",
          id: "quest123",
          origin: "W1N1",
          info: "http://tooangel.github.io/screeps"
        });

        const result = parseQuestSign(signText);

        expect(result).to.not.be.null;
        expect(result?.type).to.equal("quest");
        expect(result?.id).to.equal("quest123");
        expect(result?.origin).to.equal("W1N1");
        expect(result?.info).to.equal("http://tooangel.github.io/screeps");
      });

      it("should return null for non-JSON text", () => {
        const result = parseQuestSign("This is not JSON");
        expect(result).to.be.null;
      });

      it("should return null for JSON without required fields", () => {
        const signText = JSON.stringify({
          type: "quest",
          // missing id, origin, info
        });

        const result = parseQuestSign(signText);
        expect(result).to.be.null;
      });

      it("should return null for undefined sign", () => {
        const result = parseQuestSign(undefined);
        expect(result).to.be.null;
      });

      it("should return null for wrong type", () => {
        const signText = JSON.stringify({
          type: "notquest",
          id: "quest123",
          origin: "W1N1",
          info: "http://tooangel.github.io/screeps"
        });

        const result = parseQuestSign(signText);
        expect(result).to.be.null;
      });
    });
  });

  describe("Quest Manager", () => {
    describe("parseQuestMessage", () => {
      it("should parse valid quest message", () => {
        const message = JSON.stringify({
          type: "quest",
          id: "quest456",
          room: "W2N2",
          quest: "buildcs",
          end: 50000
        });

        const result = parseQuestMessage(message);

        expect(result).to.not.be.null;
        expect(result?.type).to.equal("quest");
        expect(result?.id).to.equal("quest456");
        expect(result?.room).to.equal("W2N2");
        expect(result?.quest).to.equal("buildcs");
        expect(result?.end).to.equal(50000);
      });

      it("should parse quest message with optional fields", () => {
        const message = JSON.stringify({
          type: "quest",
          id: "quest789",
          room: "W3N3",
          quest: "defend",
          end: 60000,
          origin: "W1N1",
          result: "won"
        });

        const result = parseQuestMessage(message);

        expect(result).to.not.be.null;
        expect(result?.origin).to.equal("W1N1");
        expect(result?.result).to.equal("won");
      });

      it("should return null for invalid JSON", () => {
        const result = parseQuestMessage("not json");
        expect(result).to.be.null;
      });

      it("should return null for missing required fields", () => {
        const message = JSON.stringify({
          type: "quest",
          id: "quest123"
          // missing room, quest, end
        });

        const result = parseQuestMessage(message);
        expect(result).to.be.null;
      });

      it("should return null for wrong type", () => {
        const message = JSON.stringify({
          type: "reputation",
          id: "quest123",
          room: "W2N2",
          quest: "buildcs",
          end: 50000
        });

        const result = parseQuestMessage(message);
        expect(result).to.be.null;
      });
    });
  });

  describe("Reputation Manager", () => {
    describe("parseReputationResponse", () => {
      it("should parse valid reputation response", () => {
        const message = JSON.stringify({
          type: "reputation",
          reputation: 1500
        });

        const result = parseReputationResponse(message);

        expect(result).to.not.be.null;
        expect(result).to.equal(1500);
      });

      it("should return null for invalid JSON", () => {
        const result = parseReputationResponse("not json");
        expect(result).to.be.null;
      });

      it("should return null for wrong type", () => {
        const message = JSON.stringify({
          type: "quest",
          reputation: 1500
        });

        const result = parseReputationResponse(message);
        expect(result).to.be.null;
      });

      it("should return null for missing reputation field", () => {
        const message = JSON.stringify({
          type: "reputation"
        });

        const result = parseReputationResponse(message);
        expect(result).to.be.null;
      });

      it("should handle zero reputation", () => {
        const message = JSON.stringify({
          type: "reputation",
          reputation: 0
        });

        const result = parseReputationResponse(message);

        expect(result).to.not.be.null;
        expect(result).to.equal(0);
      });

      it("should handle negative reputation", () => {
        const message = JSON.stringify({
          type: "reputation",
          reputation: -500
        });

        const result = parseReputationResponse(message);

        expect(result).to.not.be.null;
        expect(result).to.equal(-500);
      });
    });
  });

  describe("Quest Types", () => {
    it("should support buildcs quest type", () => {
      const message = JSON.stringify({
        type: "quest",
        id: "buildcs1",
        room: "W5N5",
        quest: "buildcs",
        end: 70000
      });

      const result = parseQuestMessage(message);
      expect(result?.quest).to.equal("buildcs");
    });

    it("should parse other quest types", () => {
      const questTypes = [
        "defend", "attack", "sign", "dismantle",
        "transport", "terminal", "harvest"
      ];

      for (const questType of questTypes) {
        const message = JSON.stringify({
          type: "quest",
          id: `${questType}1`,
          room: "W5N5",
          quest: questType,
          end: 70000
        });

        const result = parseQuestMessage(message);
        expect(result?.quest).to.equal(questType);
      }
    });
  });

  describe("Integration", () => {
    it("should handle complete quest workflow", () => {
      // 1. Detect NPC room via sign
      const sign = parseQuestSign(JSON.stringify({
        type: "quest",
        id: "quest123",
        origin: "W1N1",
        info: "http://tooangel.github.io/screeps"
      }));

      expect(sign).to.not.be.null;
      expect(sign?.id).to.equal("quest123");

      // 2. Receive quest details
      const quest = parseQuestMessage(JSON.stringify({
        type: "quest",
        id: "quest123",
        room: "W2N2",
        quest: "buildcs",
        end: 50000
      }));

      expect(quest).to.not.be.null;
      expect(quest?.id).to.equal("quest123");
      expect(quest?.room).to.equal("W2N2");

      // 3. Complete quest and get response
      const completion = parseQuestMessage(JSON.stringify({
        type: "quest",
        id: "quest123",
        room: "W2N2",
        quest: "buildcs",
        end: 50000,
        result: "won"
      }));

      expect(completion).to.not.be.null;
      expect(completion?.result).to.equal("won");
    });
  });
});
