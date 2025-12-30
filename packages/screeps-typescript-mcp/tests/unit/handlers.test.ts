/**
 * Unit tests for TypeScript type handlers
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleSearch,
  handleGetType,
  handleListTypes,
  handleGetRelated,
  handleGetByFile,
} from "../../src/handlers/tools.js";

// Mock the index-builder module
vi.mock("../../src/scraper/index-builder.js", () => ({
  buildIndex: vi.fn(),
  searchIndex: vi.fn(),
  getTypeByName: vi.fn(),
  getAllTypeNames: vi.fn(),
  getTypesByFile: vi.fn(),
}));

// Mock the type-parser module
vi.mock("../../src/scraper/type-parser.js", () => ({
  categorizeType: vi.fn((def: { name: string }) => {
    if (def.name.startsWith("Structure")) return "structure";
    if (def.name === "Creep") return "creep";
    if (def.name === "Room") return "room";
    return "other";
  }),
  extractRelatedTypes: vi.fn(() => ({
    extends: ["RoomObject"],
    implements: [],
    references: ["BodyPartConstant"],
  })),
}));

import {
  buildIndex,
  searchIndex,
  getTypeByName,
  getAllTypeNames,
  getTypesByFile,
} from "../../src/scraper/index-builder.js";

describe("TypeScript Type Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleSearch", () => {
    it("should search for types and return results", async () => {
      const mockIndex = new Map([
        [
          "creep.d.ts:Creep",
          {
            id: "creep.d.ts:Creep",
            name: "Creep",
            kind: "interface",
            content: "export interface Creep extends RoomObject {}",
            file: "creep.d.ts",
            lineNumber: 10,
            description: "A creep",
          },
        ],
      ]);

      const mockResults = [
        {
          id: "creep.d.ts:Creep",
          name: "Creep",
          kind: "interface",
          content: "export interface Creep extends RoomObject {}",
          file: "creep.d.ts",
          lineNumber: 10,
          description: "A creep",
        },
      ];

      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (searchIndex as ReturnType<typeof vi.fn>).mockReturnValue(mockResults);

      const result = await handleSearch({ query: "Creep" });

      expect(buildIndex).toHaveBeenCalled();
      expect(searchIndex).toHaveBeenCalledWith(mockIndex, "Creep", undefined);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("Creep");
      expect(result.content[0]?.text).toContain("creep.d.ts");
    });

    it("should respect limit parameter", async () => {
      const mockIndex = new Map();
      const mockResults: never[] = [];

      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (searchIndex as ReturnType<typeof vi.fn>).mockReturnValue(mockResults);

      await handleSearch({ query: "test", limit: 5 });

      expect(searchIndex).toHaveBeenCalledWith(mockIndex, "test", 5);
    });

    it("should handle empty search results", async () => {
      const mockIndex = new Map();
      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (searchIndex as ReturnType<typeof vi.fn>).mockReturnValue([]);

      const result = await handleSearch({ query: "nonexistent" });

      expect(result.content[0]?.text).toContain('"count": 0');
    });
  });

  describe("handleGetType", () => {
    it("should get a specific type definition", async () => {
      const mockIndex = new Map();
      const mockType = {
        id: "creep.d.ts:Creep",
        name: "Creep",
        kind: "interface",
        content: "export interface Creep extends RoomObject {}",
        file: "creep.d.ts",
        lineNumber: 10,
      };

      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (getTypeByName as ReturnType<typeof vi.fn>).mockReturnValue(mockType);

      const result = await handleGetType({ name: "Creep" });

      expect(buildIndex).toHaveBeenCalled();
      expect(getTypeByName).toHaveBeenCalledWith(mockIndex, "Creep");
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("Creep");
      expect(result.content[0]?.text).toContain("creep.d.ts");
    });

    it("should handle type not found", async () => {
      const mockIndex = new Map();
      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (getTypeByName as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const result = await handleGetType({ name: "NonExistent" });

      expect(result.content[0]?.text).toContain("Type not found");
      expect(result.content[0]?.text).toContain("NonExistent");
    });
  });

  describe("handleListTypes", () => {
    it("should list all types without filter", async () => {
      const mockIndex = new Map([
        [
          "creep.d.ts:Creep",
          {
            id: "creep.d.ts:Creep",
            name: "Creep",
            kind: "interface",
            content: "export interface Creep {}",
            file: "creep.d.ts",
          },
        ],
        [
          "room.d.ts:Room",
          {
            id: "room.d.ts:Room",
            name: "Room",
            kind: "interface",
            content: "export interface Room {}",
            file: "room.d.ts",
          },
        ],
      ]);

      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (getAllTypeNames as ReturnType<typeof vi.fn>).mockReturnValue(["Creep", "Room"]);

      const result = await handleListTypes({});

      expect(buildIndex).toHaveBeenCalled();
      expect(getAllTypeNames).toHaveBeenCalledWith(mockIndex);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("Creep");
      expect(result.content[0]?.text).toContain("Room");
    });

    it("should filter types by file", async () => {
      const mockIndex = new Map();
      const mockTypes = [
        {
          id: "creep.d.ts:Creep",
          name: "Creep",
          kind: "interface",
          content: "export interface Creep {}",
          file: "creep.d.ts",
        },
      ];

      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (getAllTypeNames as ReturnType<typeof vi.fn>).mockReturnValue(["Creep"]);
      (getTypeByName as ReturnType<typeof vi.fn>).mockReturnValue(mockTypes[0]);

      const result = await handleListTypes({ filter: "creep" });

      expect(result.content[0]?.text).toContain("Creep");
    });

    it("should handle empty results", async () => {
      const mockIndex = new Map();
      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (getAllTypeNames as ReturnType<typeof vi.fn>).mockReturnValue([]);

      const result = await handleListTypes({});

      expect(result.content[0]?.text).toContain('"count": 0');
    });
  });

  describe("handleGetRelated", () => {
    it("should get related types", async () => {
      const mockIndex = new Map();
      const mockType = {
        id: "creep.d.ts:Creep",
        name: "Creep",
        kind: "interface",
        content: "export interface Creep extends RoomObject { body: BodyPartConstant[] }",
        file: "creep.d.ts",
        relatedTypes: ["RoomObject", "BodyPartConstant"],
      };

      const mockRoomObject = {
        id: "room-object.d.ts:RoomObject",
        name: "RoomObject",
        kind: "interface",
        content: "export interface RoomObject {}",
        file: "room-object.d.ts",
      };

      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (getTypeByName as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(mockType)
        .mockReturnValue(mockRoomObject);

      const result = await handleGetRelated({ name: "Creep" });

      expect(buildIndex).toHaveBeenCalled();
      expect(getTypeByName).toHaveBeenCalledWith(mockIndex, "Creep");
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("RoomObject");
    });

    it("should handle type not found", async () => {
      const mockIndex = new Map();
      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (getTypeByName as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const result = await handleGetRelated({ name: "NonExistent" });

      expect(result.content[0]?.text).toContain("Type not found");
    });
  });

  describe("handleGetByFile", () => {
    it("should get types from a specific file", async () => {
      const mockIndex = new Map();
      const mockTypes = [
        {
          id: "creep.d.ts:Creep",
          name: "Creep",
          kind: "interface",
          content: "export interface Creep {}",
          file: "creep.d.ts",
        },
        {
          id: "creep.d.ts:CreepMemory",
          name: "CreepMemory",
          kind: "interface",
          content: "export interface CreepMemory {}",
          file: "creep.d.ts",
        },
      ];

      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (getTypesByFile as ReturnType<typeof vi.fn>).mockReturnValue(mockTypes);

      const result = await handleGetByFile({ fileName: "creep.d.ts" });

      expect(buildIndex).toHaveBeenCalled();
      expect(getTypesByFile).toHaveBeenCalledWith(mockIndex, "creep.d.ts");
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("Creep");
      expect(result.content[0]?.text).toContain("CreepMemory");
    });

    it("should handle file not found", async () => {
      const mockIndex = new Map();
      (buildIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockIndex);
      (getTypesByFile as ReturnType<typeof vi.fn>).mockReturnValue([]);

      const result = await handleGetByFile({ fileName: "nonexistent.d.ts" });

      expect(result.content[0]?.text).toContain('"count": 0');
    });
  });
});
