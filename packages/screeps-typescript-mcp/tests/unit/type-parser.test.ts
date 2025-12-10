/**
 * Unit tests for type parser
 */

import { describe, it, expect } from "vitest";
import { categorizeType, extractRelatedTypes } from "../../src/scraper/type-parser.js";
import type { TypeDefinition } from "../../src/types.js";

describe("Type Parser", () => {
  describe("categorizeType", () => {
    it("should categorize game types", () => {
      const def: TypeDefinition = {
        id: "game.ts:Game",
        name: "Game",
        kind: "interface",
        content: "export interface Game {}",
        file: "game.ts",
      };
      expect(categorizeType(def)).toBe("game");
    });

    it("should categorize room types", () => {
      const def: TypeDefinition = {
        id: "room.ts:Room",
        name: "Room",
        kind: "class",
        content: "export class Room {}",
        file: "room.ts",
      };
      expect(categorizeType(def)).toBe("room");
    });

    it("should categorize creep types", () => {
      const def: TypeDefinition = {
        id: "creep.ts:Creep",
        name: "Creep",
        kind: "class",
        content: "export class Creep {}",
        file: "creep.ts",
      };
      expect(categorizeType(def)).toBe("creep");
    });

    it("should categorize structure types", () => {
      const def: TypeDefinition = {
        id: "structure.ts:StructureTower",
        name: "StructureTower",
        kind: "class",
        content: "export class StructureTower {}",
        file: "structure.ts",
      };
      expect(categorizeType(def)).toBe("structure");
    });

    it("should categorize constants", () => {
      const def: TypeDefinition = {
        id: "constants.ts:FIND_CREEPS",
        name: "FIND_CREEPS",
        kind: "constant",
        content: "export const FIND_CREEPS = 101;",
        file: "constants.ts",
      };
      expect(categorizeType(def)).toBe("constants");
    });
  });

  describe("extractRelatedTypes", () => {
    it("should extract types from extends clause", () => {
      const def: TypeDefinition = {
        id: "test.ts:Child",
        name: "Child",
        kind: "interface",
        content: "export interface Child extends Parent {}",
        file: "test.ts",
      };
      const related = extractRelatedTypes(def);
      expect(related).toContain("Parent");
    });

    it("should extract types from type references", () => {
      const def: TypeDefinition = {
        id: "test.ts:Container",
        name: "Container",
        kind: "interface",
        content: "export interface Container { item: Item; }",
        file: "test.ts",
      };
      const related = extractRelatedTypes(def);
      expect(related).toContain("Item");
    });

    it("should not include self-references", () => {
      const def: TypeDefinition = {
        id: "test.ts:Node",
        name: "Node",
        kind: "interface",
        content: "export interface Node { next: Node; }",
        file: "test.ts",
      };
      const related = extractRelatedTypes(def);
      expect(related).not.toContain("Node");
    });
  });
});
