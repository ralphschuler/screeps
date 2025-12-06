/**
 * Unit tests for index builder
 */

import { describe, it, expect, beforeEach } from "vitest";
import { searchIndex, getEntryById, getEntriesByType, clearCache } from "../../src/scraper/index-builder.js";
import type { DocIndex } from "../../src/types.js";

describe("Index Builder", () => {
  let mockIndex: DocIndex;

  beforeEach(() => {
    clearCache();

    mockIndex = {
      entries: [
        {
          id: "api-game",
          title: "Game",
          url: "https://docs.screeps.com/api/#Game",
          content: "The main global game object containing all the game play information.",
          type: "api",
          keywords: ["game", "global"]
        },
        {
          id: "api-creep",
          title: "Creep",
          url: "https://docs.screeps.com/api/#Creep",
          content: "Creeps are your units. They can move, harvest, build, attack, and perform other actions.",
          type: "api",
          keywords: ["creep", "unit"]
        },
        {
          id: "mechanics-control",
          title: "Room Control",
          url: "https://docs.screeps.com/control.html",
          content: "Room control mechanics explain how to claim and control rooms in Screeps.",
          type: "mechanics",
          keywords: ["control", "room", "controller"]
        }
      ],
      lastUpdated: new Date(),
      version: "1.0.0"
    };
  });

  describe("searchIndex", () => {
    it("should find entries by title", () => {
      const results = searchIndex(mockIndex, "Creep");

      expect(results.length).toBeGreaterThan(0);
      const creepResult = results.find(r => r.entry.id === "api-creep");
      expect(creepResult).toBeDefined();
      expect(creepResult?.matches).toContain("title");
    });

    it("should find entries by keyword", () => {
      const results = searchIndex(mockIndex, "unit");

      expect(results).toHaveLength(1);
      expect(results[0].entry.id).toBe("api-creep");
      expect(results[0].matches.some(m => m.startsWith("keyword:"))).toBe(true);
    });

    it("should find entries by content", () => {
      const results = searchIndex(mockIndex, "harvest");

      expect(results).toHaveLength(1);
      expect(results[0].entry.id).toBe("api-creep");
      expect(results[0].matches).toContain("content");
    });

    it("should find entries by id", () => {
      const results = searchIndex(mockIndex, "mechanics-control");

      expect(results).toHaveLength(1);
      expect(results[0].entry.id).toBe("mechanics-control");
      expect(results[0].matches).toContain("id");
    });

    it("should return multiple results", () => {
      const results = searchIndex(mockIndex, "screeps");

      expect(results.length).toBeGreaterThan(0);
    });

    it("should return empty array for no matches", () => {
      const results = searchIndex(mockIndex, "nonexistent");

      expect(results).toHaveLength(0);
    });

    it("should sort results by score", () => {
      const results = searchIndex(mockIndex, "control");

      // Results should be sorted by score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it("should be case-insensitive", () => {
      const results1 = searchIndex(mockIndex, "CREEP");
      const results2 = searchIndex(mockIndex, "creep");

      expect(results1).toHaveLength(results2.length);
    });
  });

  describe("getEntryById", () => {
    it("should return entry by id", () => {
      const entry = getEntryById(mockIndex, "api-game");

      expect(entry).toBeDefined();
      expect(entry?.id).toBe("api-game");
      expect(entry?.title).toBe("Game");
    });

    it("should return null for non-existent id", () => {
      const entry = getEntryById(mockIndex, "nonexistent");

      expect(entry).toBeNull();
    });
  });

  describe("getEntriesByType", () => {
    it("should return API entries", () => {
      const entries = getEntriesByType(mockIndex, "api");

      expect(entries).toHaveLength(2);
      expect(entries[0].type).toBe("api");
      expect(entries[1].type).toBe("api");
    });

    it("should return mechanics entries", () => {
      const entries = getEntriesByType(mockIndex, "mechanics");

      expect(entries).toHaveLength(1);
      expect(entries[0].type).toBe("mechanics");
    });

    it("should return empty array if no matches", () => {
      const emptyIndex: DocIndex = {
        entries: [],
        lastUpdated: new Date(),
        version: "1.0.0"
      };

      const entries = getEntriesByType(emptyIndex, "api");

      expect(entries).toHaveLength(0);
    });
  });
});
