import { expect } from "chai";

/**
 * Tests for Portal Manager functionality
 * 
 * Since we can't easily mock the full Game object, we test the logic and algorithms
 * that power the portal management system.
 */

describe("Portal Manager", () => {
  describe("Portal Destination Parsing", () => {
    /**
     * Simulates parsing portal destination information
     */
    interface PortalDest {
      shard?: string;
      room?: string;
      x?: number;
      y?: number;
      roomName?: string;
    }

    function parsePortalDestination(dest: PortalDest): { type: "inter-shard" | "intra-shard" | "unknown"; shard?: string; room: string } | null {
      // Inter-shard portal (has shard and room)
      if (dest.shard && dest.room) {
        return {
          type: "inter-shard",
          shard: dest.shard,
          room: dest.room
        };
      }

      // Intra-shard portal (RoomPosition-like)
      if (dest.roomName !== undefined) {
        return {
          type: "intra-shard",
          room: dest.roomName
        };
      }

      return null;
    }

    it("should parse inter-shard portal destination", () => {
      const dest = { shard: "shard1", room: "E10N10" };
      const result = parsePortalDestination(dest);
      
      expect(result).to.not.be.null;
      expect(result!.type).to.equal("inter-shard");
      expect(result!.shard).to.equal("shard1");
      expect(result!.room).to.equal("E10N10");
    });

    it("should parse intra-shard portal destination", () => {
      const dest = { x: 25, y: 25, roomName: "E5N5" };
      const result = parsePortalDestination(dest);
      
      expect(result).to.not.be.null;
      expect(result!.type).to.equal("intra-shard");
      expect(result!.room).to.equal("E5N5");
    });

    it("should return null for invalid destination", () => {
      const dest = { x: 25, y: 25 }; // Missing roomName
      const result = parsePortalDestination(dest);
      
      expect(result).to.be.null;
    });

    it("should handle empty destination", () => {
      const dest = {};
      const result = parsePortalDestination(dest);
      
      expect(result).to.be.null;
    });
  });

  describe("Portal Age Validation", () => {
    /**
     * Simulates checking if portal information is still valid
     */
    const PORTAL_MAX_AGE = 10000;

    function isPortalStale(lastSeen: number, currentTick: number): boolean {
      return currentTick - lastSeen >= PORTAL_MAX_AGE;
    }

    it("should consider fresh portals as valid", () => {
      expect(isPortalStale(1000, 1100)).to.be.false;
    });

    it("should consider portals at max age as valid", () => {
      expect(isPortalStale(1000, 10999)).to.be.false;
    });

    it("should consider old portals as stale", () => {
      expect(isPortalStale(1000, 11000)).to.be.true;
    });

    it("should handle portals just over max age", () => {
      expect(isPortalStale(1000, 11001)).to.be.true;
    });

    it("should handle very old portals", () => {
      expect(isPortalStale(1000, 50000)).to.be.true;
    });
  });

  describe("Portal Route Calculation", () => {
    /**
     * Simulates calculating distance and priority for portal routes
     */
    interface SimpleRoute {
      rooms: string[];
      distance: number;
    }

    function calculateRouteMetrics(route: SimpleRoute): {
      totalDistance: number;
      roomCount: number;
      avgRoomDistance: number;
    } {
      return {
        totalDistance: route.distance,
        roomCount: route.rooms.length,
        avgRoomDistance: route.distance / Math.max(route.rooms.length, 1)
      };
    }

    it("should calculate metrics for single room route", () => {
      const route = { rooms: ["E1N1"], distance: 0 };
      const metrics = calculateRouteMetrics(route);
      
      expect(metrics.totalDistance).to.equal(0);
      expect(metrics.roomCount).to.equal(1);
      expect(metrics.avgRoomDistance).to.equal(0);
    });

    it("should calculate metrics for multi-room route", () => {
      const route = { rooms: ["E1N1", "E2N1", "E3N1"], distance: 10 };
      const metrics = calculateRouteMetrics(route);
      
      expect(metrics.totalDistance).to.equal(10);
      expect(metrics.roomCount).to.equal(3);
      expect(metrics.avgRoomDistance).to.be.closeTo(3.33, 0.01);
    });

    it("should handle empty route", () => {
      const route = { rooms: [], distance: 0 };
      const metrics = calculateRouteMetrics(route);
      
      expect(metrics.roomCount).to.equal(0);
      expect(metrics.avgRoomDistance).to.equal(0);
    });
  });

  describe("Portal Route Comparison", () => {
    /**
     * Simulates comparing portal routes to find the optimal one
     */
    interface PortalRoute {
      distance: number;
      portals: number;
      calculatedAt: number;
    }

    function compareRoutes(a: PortalRoute, b: PortalRoute, currentTick: number): number {
      // Prefer routes with fewer portals (fewer shard jumps)
      if (a.portals !== b.portals) {
        return a.portals - b.portals;
      }

      // Then prefer shorter routes
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }

      // Finally prefer more recently calculated routes
      return b.calculatedAt - a.calculatedAt;
    }

    it("should prefer routes with fewer portals", () => {
      const routeA = { distance: 5, portals: 1, calculatedAt: 100 };
      const routeB = { distance: 3, portals: 2, calculatedAt: 100 };
      
      expect(compareRoutes(routeA, routeB, 100)).to.be.lessThan(0);
    });

    it("should prefer shorter routes when portal count is equal", () => {
      const routeA = { distance: 3, portals: 1, calculatedAt: 100 };
      const routeB = { distance: 5, portals: 1, calculatedAt: 100 };
      
      expect(compareRoutes(routeA, routeB, 100)).to.be.lessThan(0);
    });

    it("should prefer more recent routes when distance and portals are equal", () => {
      const routeA = { distance: 5, portals: 1, calculatedAt: 200 };
      const routeB = { distance: 5, portals: 1, calculatedAt: 100 };
      
      expect(compareRoutes(routeA, routeB, 200)).to.be.lessThan(0);
    });

    it("should return 0 for identical routes", () => {
      const routeA = { distance: 5, portals: 1, calculatedAt: 100 };
      const routeB = { distance: 5, portals: 1, calculatedAt: 100 };
      
      expect(compareRoutes(routeA, routeB, 100)).to.equal(0);
    });
  });

  describe("InterShardMemory Data Format", () => {
    /**
     * Simulates the InterShardMemory data structure
     */
    interface InterShardPortalData {
      shard: string;
      portals: Record<string, Array<{ shard?: string; room: string }>>;
      lastUpdate: number;
    }

    function serializePortalData(data: InterShardPortalData): string {
      return JSON.stringify(data);
    }

    function deserializePortalData(json: string): InterShardPortalData | null {
      try {
        return JSON.parse(json) as InterShardPortalData;
      } catch {
        return null;
      }
    }

    it("should serialize and deserialize portal data", () => {
      const data: InterShardPortalData = {
        shard: "shard0",
        portals: {
          "E1N1": [
            { shard: "shard1", room: "E10N10" },
            { room: "E2N1" }
          ]
        },
        lastUpdate: 12345
      };

      const serialized = serializePortalData(data);
      const deserialized = deserializePortalData(serialized);

      expect(deserialized).to.not.be.null;
      expect(deserialized!.shard).to.equal("shard0");
      expect(deserialized!.portals["E1N1"]).to.have.lengthOf(2);
      expect(deserialized!.lastUpdate).to.equal(12345);
    });

    it("should handle empty portal data", () => {
      const data: InterShardPortalData = {
        shard: "shard0",
        portals: {},
        lastUpdate: 0
      };

      const serialized = serializePortalData(data);
      const deserialized = deserializePortalData(serialized);

      expect(deserialized).to.not.be.null;
      expect(Object.keys(deserialized!.portals)).to.have.lengthOf(0);
    });

    it("should return null for invalid JSON", () => {
      const invalid = "{invalid json";
      const result = deserializePortalData(invalid);
      
      expect(result).to.be.null;
    });

    it("should handle multiple rooms with portals", () => {
      const data: InterShardPortalData = {
        shard: "shard0",
        portals: {
          "E1N1": [{ shard: "shard1", room: "W1N1" }],
          "E2N2": [{ shard: "shard2", room: "W2N2" }],
          "E3N3": [{ room: "E4N3" }]
        },
        lastUpdate: 100
      };

      const serialized = serializePortalData(data);
      const deserialized = deserializePortalData(serialized);

      expect(deserialized).to.not.be.null;
      expect(Object.keys(deserialized!.portals)).to.have.lengthOf(3);
    });
  });

  describe("Portal Cache Key Generation", () => {
    /**
     * Simulates generating cache keys for portal data
     */
    function generatePortalCacheKey(roomName: string): string {
      return `portals:room:${roomName}`;
    }

    function generateRouteCacheKey(fromRoom: string, toShard: string): string {
      return `portal:route:${fromRoom}:${toShard}`;
    }

    it("should generate unique cache keys for different rooms", () => {
      const key1 = generatePortalCacheKey("E1N1");
      const key2 = generatePortalCacheKey("E2N1");
      
      expect(key1).to.not.equal(key2);
    });

    it("should generate consistent cache keys for same room", () => {
      const key1 = generatePortalCacheKey("E1N1");
      const key2 = generatePortalCacheKey("E1N1");
      
      expect(key1).to.equal(key2);
    });

    it("should generate unique route cache keys", () => {
      const key1 = generateRouteCacheKey("E1N1", "shard1");
      const key2 = generateRouteCacheKey("E1N1", "shard2");
      const key3 = generateRouteCacheKey("E2N1", "shard1");
      
      expect(key1).to.not.equal(key2);
      expect(key1).to.not.equal(key3);
      expect(key2).to.not.equal(key3);
    });

    it("should generate consistent route cache keys", () => {
      const key1 = generateRouteCacheKey("E1N1", "shard1");
      const key2 = generateRouteCacheKey("E1N1", "shard1");
      
      expect(key1).to.equal(key2);
    });
  });

  describe("Linear Distance Calculation", () => {
    /**
     * Simulates calculating linear distance between rooms
     * This mirrors Game.map.getRoomLinearDistance behavior
     */
    function parseRoomName(roomName: string): { x: number; y: number } | null {
      const match = roomName.match(/^([WE])(\d+)([NS])(\d+)$/);
      if (!match) return null;

      const [, xDir, xNum, yDir, yNum] = match;
      // Per Screeps coordinate system:
      // - W0N0 is at (-1, 0), E0N0 is at (0, 0), W0S0 is at (-1, -1)
      // - W rooms: x = -(num + 1), E rooms: x = num
      // - S rooms: y = -(num + 1), N rooms: y = num
      const x = xDir === "W" ? -(parseInt(xNum!, 10) + 1) : parseInt(xNum!, 10);
      const y = yDir === "N" ? parseInt(yNum!, 10) : -(parseInt(yNum!, 10) + 1);

      return { x, y };
    }

    function getRoomLinearDistance(room1: string, room2: string): number | null {
      const pos1 = parseRoomName(room1);
      const pos2 = parseRoomName(room2);

      if (!pos1 || !pos2) return null;

      return Math.max(Math.abs(pos2.x - pos1.x), Math.abs(pos2.y - pos1.y));
    }

    it("should calculate distance between adjacent rooms", () => {
      expect(getRoomLinearDistance("E1N1", "E2N1")).to.equal(1);
      expect(getRoomLinearDistance("E1N1", "E1N2")).to.equal(1);
    });

    it("should calculate distance between distant rooms", () => {
      expect(getRoomLinearDistance("E1N1", "E10N1")).to.equal(9);
      expect(getRoomLinearDistance("E1N1", "E1N10")).to.equal(9);
    });

    it("should return 0 for same room", () => {
      expect(getRoomLinearDistance("E1N1", "E1N1")).to.equal(0);
    });

    it("should handle rooms in different quadrants", () => {
      expect(getRoomLinearDistance("E1N1", "W1N1")).to.equal(3);
      expect(getRoomLinearDistance("E1N1", "E1S1")).to.equal(3);
      expect(getRoomLinearDistance("E1N1", "W1S1")).to.equal(3);
    });

    it("should handle diagonal distances", () => {
      const dist = getRoomLinearDistance("E1N1", "E5N5");
      expect(dist).to.equal(4); // max(|5-1|, |5-1|) = max(4, 4) = 4
    });

    it("should return null for invalid room names", () => {
      expect(getRoomLinearDistance("Invalid", "E1N1")).to.be.null;
      expect(getRoomLinearDistance("E1N1", "Invalid")).to.be.null;
    });
  });

  describe("Portal Filtering by Shard", () => {
    /**
     * Simulates filtering portals by destination shard
     */
    interface PortalInfo {
      pos: { x: number; y: number; roomName: string };
      destination: {
        shard?: string;
        room: string;
      };
    }

    function filterPortalsByShard(portals: PortalInfo[], targetShard: string): PortalInfo[] {
      return portals.filter(p => p.destination.shard === targetShard);
    }

    it("should filter portals to specific shard", () => {
      const portals: PortalInfo[] = [
        { pos: { x: 10, y: 10, roomName: "E1N1" }, destination: { shard: "shard1", room: "W1N1" } },
        { pos: { x: 20, y: 20, roomName: "E1N1" }, destination: { shard: "shard2", room: "W2N2" } },
        { pos: { x: 30, y: 30, roomName: "E1N1" }, destination: { room: "E2N1" } }
      ];

      const filtered = filterPortalsByShard(portals, "shard1");
      
      expect(filtered).to.have.lengthOf(1);
      expect(filtered[0].destination.shard).to.equal("shard1");
    });

    it("should return empty array when no portals match", () => {
      const portals: PortalInfo[] = [
        { pos: { x: 10, y: 10, roomName: "E1N1" }, destination: { shard: "shard1", room: "W1N1" } }
      ];

      const filtered = filterPortalsByShard(portals, "shard2");
      
      expect(filtered).to.have.lengthOf(0);
    });

    it("should handle portals without shard (intra-shard)", () => {
      const portals: PortalInfo[] = [
        { pos: { x: 10, y: 10, roomName: "E1N1" }, destination: { room: "E2N1" } }
      ];

      const filtered = filterPortalsByShard(portals, "shard1");
      
      expect(filtered).to.have.lengthOf(0);
    });

    it("should find multiple portals to same shard", () => {
      const portals: PortalInfo[] = [
        { pos: { x: 10, y: 10, roomName: "E1N1" }, destination: { shard: "shard1", room: "W1N1" } },
        { pos: { x: 20, y: 20, roomName: "E1N1" }, destination: { shard: "shard1", room: "W2N2" } },
        { pos: { x: 30, y: 30, roomName: "E1N1" }, destination: { shard: "shard2", room: "W3N3" } }
      ];

      const filtered = filterPortalsByShard(portals, "shard1");
      
      expect(filtered).to.have.lengthOf(2);
    });
  });

  describe("Closest Portal Selection", () => {
    /**
     * Simulates finding the closest portal from a list
     */
    interface Position {
      x: number;
      y: number;
      roomName: string;
    }

    interface PortalInfo {
      pos: Position;
      distance: number;
    }

    function findClosestPortal(from: Position, portals: PortalInfo[]): PortalInfo | null {
      if (portals.length === 0) return null;

      return portals.reduce((closest, current) => {
        return current.distance < closest.distance ? current : closest;
      });
    }

    it("should find closest portal from list", () => {
      const from = { x: 25, y: 25, roomName: "E1N1" };
      const portals: PortalInfo[] = [
        { pos: { x: 10, y: 10, roomName: "E2N1" }, distance: 5 },
        { pos: { x: 20, y: 20, roomName: "E3N1" }, distance: 2 },
        { pos: { x: 30, y: 30, roomName: "E4N1" }, distance: 8 }
      ];

      const closest = findClosestPortal(from, portals);
      
      expect(closest).to.not.be.null;
      expect(closest!.distance).to.equal(2);
    });

    it("should return null for empty portal list", () => {
      const from = { x: 25, y: 25, roomName: "E1N1" };
      const closest = findClosestPortal(from, []);
      
      expect(closest).to.be.null;
    });

    it("should return single portal when only one available", () => {
      const from = { x: 25, y: 25, roomName: "E1N1" };
      const portals: PortalInfo[] = [
        { pos: { x: 10, y: 10, roomName: "E2N1" }, distance: 5 }
      ];

      const closest = findClosestPortal(from, portals);
      
      expect(closest).to.not.be.null;
      expect(closest!.distance).to.equal(5);
    });

    it("should handle multiple portals with same distance", () => {
      const from = { x: 25, y: 25, roomName: "E1N1" };
      const portals: PortalInfo[] = [
        { pos: { x: 10, y: 10, roomName: "E2N1" }, distance: 3 },
        { pos: { x: 20, y: 20, roomName: "E3N1" }, distance: 3 }
      ];

      const closest = findClosestPortal(from, portals);
      
      expect(closest).to.not.be.null;
      expect(closest!.distance).to.equal(3);
    });
  });

  describe("Portal Route Validation", () => {
    /**
     * Simulates validating a portal route for completeness
     */
    interface PortalRoute {
      rooms: string[];
      portals: Array<{ x: number; y: number; roomName: string }>;
      distance: number;
    }

    function isValidPortalRoute(route: PortalRoute): boolean {
      // Route must have at least one room
      if (route.rooms.length === 0) return false;

      // Distance must be non-negative
      if (route.distance < 0) return false;

      // Portal count must not exceed room count
      if (route.portals.length > route.rooms.length) return false;

      return true;
    }

    it("should validate complete portal route", () => {
      const route: PortalRoute = {
        rooms: ["E1N1", "E2N1"],
        portals: [{ x: 49, y: 25, roomName: "E1N1" }],
        distance: 5
      };

      expect(isValidPortalRoute(route)).to.be.true;
    });

    it("should reject route with no rooms", () => {
      const route: PortalRoute = {
        rooms: [],
        portals: [],
        distance: 0
      };

      expect(isValidPortalRoute(route)).to.be.false;
    });

    it("should reject route with negative distance", () => {
      const route: PortalRoute = {
        rooms: ["E1N1"],
        portals: [],
        distance: -1
      };

      expect(isValidPortalRoute(route)).to.be.false;
    });

    it("should reject route with more portals than rooms", () => {
      const route: PortalRoute = {
        rooms: ["E1N1"],
        portals: [
          { x: 49, y: 25, roomName: "E1N1" },
          { x: 0, y: 25, roomName: "E2N1" }
        ],
        distance: 5
      };

      expect(isValidPortalRoute(route)).to.be.false;
    });

    it("should validate route with zero distance", () => {
      const route: PortalRoute = {
        rooms: ["E1N1"],
        portals: [],
        distance: 0
      };

      expect(isValidPortalRoute(route)).to.be.true;
    });
  });
});
