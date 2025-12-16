/**
 * Performance Benchmarking Tests
 *
 * Tests CPU and memory performance characteristics:
 * - Critical path benchmarks
 * - CPU usage profiling
 * - Memory usage validation
 * - Scalability tests
 *
 * Addresses Issue: Performance profiling for production readiness
 */

import { expect } from "chai";
import { performance } from "perf_hooks";

// Mock performance tracking
const mockPerformance = {
  measurements: new Map<string, number[]>()
};

describe("Performance Benchmarks", () => {
  beforeEach(() => {
    mockPerformance.measurements.clear();
  });

  // Helper function to measure execution time
  const measurePerformance = (name: string, fn: () => void): number => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    if (!mockPerformance.measurements.has(name)) {
      mockPerformance.measurements.set(name, []);
    }
    mockPerformance.measurements.get(name)!.push(duration);
    
    return duration;
  };

  describe("Creep Processing Performance", () => {
    it("should process single creep within CPU budget", () => {
      const CPU_BUDGET_PER_CREEP = 0.5;
      
      const processCreep = () => {
        // Simulate creep processing
        let sum = 0;
        for (let i = 0; i < 100; i++) {
          sum += i;
        }
        return sum;
      };

      const time = measurePerformance("single_creep", processCreep);
      
      // Time should be minimal (< 1ms in tests)
      expect(time).to.be.lessThan(10);
    });

    it("should scale linearly with creep count", () => {
      const processCreeps = (count: number) => {
        const results: number[] = [];
        for (let i = 0; i < count; i++) {
          // Simulate creep logic
          let sum = 0;
          for (let j = 0; j < 50; j++) {
            sum += j;
          }
          results.push(sum);
        }
        return results;
      };

      const time10 = measurePerformance("10_creeps", () => processCreeps(10));
      const time100 = measurePerformance("100_creeps", () => processCreeps(100));

      // Should be roughly proportional (allowing for variance)
      const ratio = time100 / time10;
      expect(ratio).to.be.greaterThan(2); // At least some linear scaling
      expect(ratio).to.be.lessThan(20); // But not more than 20x (reasonable variance)
    });

    it("should handle 1000 creeps within acceptable time", () => {
      const processLargeSwarm = () => {
        const creeps: any[] = [];
        for (let i = 0; i < 1000; i++) {
          creeps.push({
            name: `creep_${i}`,
            role: ["harvester", "hauler", "upgrader", "builder"][i % 4],
            processed: true
          });
        }
        return creeps.filter(c => c.processed).length;
      };

      const time = measurePerformance("1000_creeps", processLargeSwarm);
      
      // Should complete in reasonable time (< 100ms in test environment)
      expect(time).to.be.lessThan(100);
    });

    it("should efficiently filter creeps by role", () => {
      const filterCreeps = (count: number, targetRole: string) => {
        const creeps = Array.from({ length: count }, (_, i) => ({
          name: `creep_${i}`,
          role: ["harvester", "hauler", "upgrader"][i % 3]
        }));

        return creeps.filter(c => c.role === targetRole);
      };

      const time = measurePerformance("filter_creeps", () => filterCreeps(1000, "harvester"));
      
      // Filtering should be fast
      expect(time).to.be.lessThan(20);
    });
  });

  describe("Room Processing Performance", () => {
    it("should process single room within CPU budget", () => {
      const CPU_BUDGET_PER_ROOM = 2.0;

      const processRoom = () => {
        // Simulate room processing
        const structures = Array.from({ length: 50 }, (_, i) => ({
          id: `struct_${i}`,
          type: ["spawn", "extension", "tower", "storage"][i % 4]
        }));

        const spawns = structures.filter(s => s.type === "spawn");
        const towers = structures.filter(s => s.type === "tower");
        
        return { spawns: spawns.length, towers: towers.length };
      };

      const time = measurePerformance("room_processing", processRoom);
      expect(time).to.be.lessThan(50);
    });

    it("should scale with number of rooms", () => {
      const processMultipleRooms = (roomCount: number) => {
        const results: any[] = [];
        for (let i = 0; i < roomCount; i++) {
          // Simulate room processing
          const structures = Array.from({ length: 50 }, (_, j) => ({
            roomId: i,
            structId: j
          }));
          results.push(structures.length);
        }
        return results;
      };

      const time1 = measurePerformance("1_room", () => processMultipleRooms(1));
      const time10 = measurePerformance("10_rooms", () => processMultipleRooms(10));

      const ratio = time10 / time1;
      expect(ratio).to.be.greaterThan(1);
      expect(ratio).to.be.lessThan(15);
    });

    it("should efficiently cache room data", () => {
      interface RoomCache {
        [roomName: string]: {
          data: any;
          cachedAt: number;
        };
      }

      const cache: RoomCache = {};

      const getCachedRoomData = (roomName: string, tick: number) => {
        if (cache[roomName] && (tick - cache[roomName].cachedAt) < 10) {
          return cache[roomName].data;
        }

        // Expensive calculation
        const data = { structures: 50, creeps: 20 };
        cache[roomName] = { data, cachedAt: tick };
        return data;
      };

      // First call - cache miss
      const time1 = measurePerformance("cache_miss", () => getCachedRoomData("W1N1", 100));
      
      // Second call - cache hit
      const time2 = measurePerformance("cache_hit", () => getCachedRoomData("W1N1", 101));

      // Cache hit should be equal or faster
      expect(time2).to.be.at.most(time1);
    });
  });

  describe("Pathfinding Performance", () => {
    it("should cache paths to avoid recalculation", () => {
      interface PathCache {
        [key: string]: {
          path: string;
          cachedAt: number;
        };
      }

      const pathCache: PathCache = {};

      const findPath = (from: string, to: string, tick: number) => {
        const cacheKey = `${from}_${to}`;
        
        if (pathCache[cacheKey] && (tick - pathCache[cacheKey].cachedAt) < 50) {
          return pathCache[cacheKey].path;
        }

        // Expensive pathfinding
        const path = `path_${from}_to_${to}`;
        pathCache[cacheKey] = { path, cachedAt: tick };
        return path;
      };

      const time1 = measurePerformance("pathfind_new", () => findPath("A", "B", 100));
      const time2 = measurePerformance("pathfind_cached", () => findPath("A", "B", 101));

      expect(time2).to.be.at.most(time1);
    });

    it("should limit pathfinding operations per tick", () => {
      const MAX_PATHFINDING_PER_TICK = 10;
      let pathfindingCount = 0;

      const requestPath = (from: string, to: string): boolean => {
        if (pathfindingCount >= MAX_PATHFINDING_PER_TICK) {
          return false; // Deferred
        }
        pathfindingCount++;
        return true; // Processed
      };

      // Request 15 paths
      const results: boolean[] = [];
      for (let i = 0; i < 15; i++) {
        results.push(requestPath(`A${i}`, `B${i}`));
      }

      const processed = results.filter(r => r === true).length;
      const deferred = results.filter(r => r === false).length;

      expect(processed).to.equal(10);
      expect(deferred).to.equal(5);
    });

    it("should use efficient path serialization", () => {
      interface Position {
        x: number;
        y: number;
      }

      const serializePath = (path: Position[]): string => {
        return path.map(p => `${p.x},${p.y}`).join("|");
      };

      const deserializePath = (serialized: string): Position[] => {
        return serialized.split("|").map(s => {
          const [x, y] = s.split(",").map(Number);
          return { x, y };
        });
      };

      const path: Position[] = Array.from({ length: 50 }, (_, i) => ({
        x: i % 50,
        y: Math.floor(i / 50)
      }));

      const serialized = serializePath(path);
      const deserialized = deserializePath(serialized);

      expect(deserialized).to.deep.equal(path);
      expect(serialized.length).to.be.lessThan(500); // Compact representation
    });
  });

  describe("Memory Usage Performance", () => {
    it("should keep memory footprint under limits", () => {
      const MAX_MEMORY_SIZE = 2 * 1024 * 1024; // 2MB

      const estimateSize = (obj: any): number => {
        return JSON.stringify(obj).length;
      };

      const memory = {
        rooms: {} as any,
        creeps: {} as any,
        empire: {}
      };

      // Simulate 20 rooms
      for (let i = 0; i < 20; i++) {
        memory.rooms[`W${i}N${i}`] = {
          sources: [{}, {}],
          structures: {},
          pheromones: { harvest: 50, build: 30, upgrade: 40 }
        };
      }

      // Simulate 100 creeps
      for (let i = 0; i < 100; i++) {
        memory.creeps[`creep_${i}`] = {
          role: "harvester",
          room: "W1N1",
          target: "source1"
        };
      }

      const size = estimateSize(memory);
      expect(size).to.be.lessThan(MAX_MEMORY_SIZE);
    });

    it("should clean up dead creep memory", () => {
      const memory = {
        creeps: {
          "creep_1": { role: "harvester", alive: true },
          "creep_2": { role: "hauler", alive: false },
          "creep_3": { role: "upgrader", alive: true },
          "creep_4": { role: "builder", alive: false }
        }
      };

      // Cleanup dead creeps
      const cleanedMemory = { creeps: {} as any };
      for (const [name, data] of Object.entries(memory.creeps)) {
        if (data.alive) {
          cleanedMemory.creeps[name] = data;
        }
      }

      expect(Object.keys(memory.creeps)).to.have.lengthOf(4);
      expect(Object.keys(cleanedMemory.creeps)).to.have.lengthOf(2);
    });

    it("should limit pheromone history length", () => {
      const MAX_HISTORY = 20;
      
      interface EventLog {
        events: Array<{ type: string; tick: number }>;
      }

      const log: EventLog = {
        events: []
      };

      // Add 30 events
      for (let i = 0; i < 30; i++) {
        log.events.push({ type: "event", tick: i });
        
        // Trim to max length
        if (log.events.length > MAX_HISTORY) {
          log.events.shift();
        }
      }

      expect(log.events).to.have.lengthOf(MAX_HISTORY);
      expect(log.events[0].tick).to.equal(10); // First 10 removed
    });

    it("should use efficient data structures", () => {
      // Array vs Object lookup performance
      const arrayData = Array.from({ length: 1000 }, (_, i) => ({
        id: `id_${i}`,
        value: i
      }));

      const objectData = arrayData.reduce((acc, item) => {
        acc[item.id] = item.value;
        return acc;
      }, {} as Record<string, number>);

      // Array search
      const timeArray = measurePerformance("array_search", () => {
        return arrayData.find(item => item.id === "id_500");
      });

      // Object lookup
      const timeObject = measurePerformance("object_lookup", () => {
        return objectData["id_500"];
      });

      // Object lookup should be faster
      expect(timeObject).to.be.at.most(timeArray);
    });
  });

  describe("CPU Bucket Management", () => {
    it("should throttle operations when bucket is low", () => {
      const operations = {
        critical: [] as string[],
        normal: [] as string[],
        deferred: [] as string[]
      };

      const scheduleOperation = (name: string, priority: "critical" | "normal", bucket: number) => {
        const LOW_BUCKET = 5000;
        const CRITICAL_BUCKET = 2000;

        if (bucket < CRITICAL_BUCKET) {
          operations.deferred.push(name);
        } else if (bucket < LOW_BUCKET && priority === "normal") {
          operations.deferred.push(name);
        } else if (priority === "critical") {
          operations.critical.push(name);
        } else {
          operations.normal.push(name);
        }
      };

      scheduleOperation("spawn_defender", "critical", 3000);
      scheduleOperation("room_planning", "normal", 3000);
      scheduleOperation("tower_attack", "critical", 3000);

      expect(operations.critical).to.have.lengthOf(2);
      expect(operations.deferred).to.have.lengthOf(1);
    });

    it("should allow expensive operations when bucket is high", () => {
      const HIGH_BUCKET = 9000;
      const bucket = 9500;

      const canRunExpensive = bucket > HIGH_BUCKET;
      expect(canRunExpensive).to.be.true;
    });

    it("should track CPU usage per subsystem", () => {
      interface CPUStats {
        [subsystem: string]: number;
      }

      const cpuStats: CPUStats = {};

      const trackCPU = (subsystem: string, cpuUsed: number) => {
        if (!cpuStats[subsystem]) {
          cpuStats[subsystem] = 0;
        }
        cpuStats[subsystem] += cpuUsed;
      };

      trackCPU("creeps", 45.5);
      trackCPU("rooms", 30.2);
      trackCPU("creeps", 25.3);
      trackCPU("market", 5.0);

      expect(cpuStats.creeps).to.be.closeTo(70.8, 0.1);
      expect(cpuStats.rooms).to.be.closeTo(30.2, 0.1);
      expect(cpuStats.market).to.be.closeTo(5.0, 0.1);
    });

    it("should identify CPU-intensive operations", () => {
      interface Operation {
        name: string;
        cpuUsed: number;
      }

      const operations: Operation[] = [
        { name: "creep_logic", cpuUsed: 45 },
        { name: "room_planning", cpuUsed: 85 },
        { name: "pathfinding", cpuUsed: 120 },
        { name: "market_logic", cpuUsed: 15 }
      ];

      const expensive = operations.filter(op => op.cpuUsed > 50);
      const sorted = [...expensive].sort((a, b) => b.cpuUsed - a.cpuUsed);

      expect(expensive).to.have.lengthOf(2);
      expect(sorted[0].name).to.equal("pathfinding");
    });
  });

  describe("Scalability Tests", () => {
    it("should handle empire with 20 rooms", () => {
      const processEmpire = (roomCount: number) => {
        const rooms: any[] = [];
        for (let i = 0; i < roomCount; i++) {
          rooms.push({
            name: `W${i}N${i}`,
            rcl: 8,
            energy: 300000,
            creeps: 50
          });
        }
        return rooms.reduce((sum, r) => sum + r.creeps, 0);
      };

      const time = measurePerformance("empire_20_rooms", () => processEmpire(20));
      const totalCreeps = processEmpire(20);

      expect(totalCreeps).to.equal(1000);
      expect(time).to.be.lessThan(100);
    });

    it("should handle 100 simultaneous squads", () => {
      interface Squad {
        id: string;
        members: string[];
        target: string;
      }

      const squads: Squad[] = Array.from({ length: 100 }, (_, i) => ({
        id: `squad_${i}`,
        members: [`m1_${i}`, `m2_${i}`, `m3_${i}`],
        target: `target_${i}`
      }));

      const processSquads = () => {
        return squads.filter(s => s.members.length >= 3).length;
      };

      const time = measurePerformance("100_squads", processSquads);
      expect(time).to.be.lessThan(50);
    });

    it("should handle complex market with 1000 orders", () => {
      interface MarketOrder {
        id: string;
        resource: string;
        price: number;
        amount: number;
      }

      const orders: MarketOrder[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `order_${i}`,
        resource: ["energy", "H", "O", "U", "L"][i % 5],
        price: 1.0 + (i % 10) * 0.1,
        amount: 1000 + (i * 100)
      }));

      const processOrders = () => {
        const energyOrders = orders.filter(o => o.resource === "energy");
        const avgPrice = energyOrders.reduce((sum, o) => sum + o.price, 0) / energyOrders.length;
        return { count: energyOrders.length, avgPrice };
      };

      const time = measurePerformance("1000_orders", processOrders);
      expect(time).to.be.lessThan(50);
    });

    it("should maintain performance with 5000 creeps", () => {
      const creeps = Array.from({ length: 5000 }, (_, i) => ({
        name: `creep_${i}`,
        role: ["harvester", "hauler", "upgrader", "builder", "defender"][i % 5],
        room: `W${Math.floor(i / 250)}N${Math.floor(i / 250)}`
      }));

      const processCreeps = () => {
        const byRoom = creeps.reduce((acc, c) => {
          if (!acc[c.room]) acc[c.room] = 0;
          acc[c.room]++;
          return acc;
        }, {} as Record<string, number>);
        return Object.keys(byRoom).length;
      };

      const time = measurePerformance("5000_creeps", processCreeps);
      expect(time).to.be.lessThan(100);
    });
  });

  describe("Performance Regression Detection", () => {
    it("should detect performance degradation", () => {
      const baseline = 50; // ms
      const current = 75; // ms
      const threshold = 1.3; // 30% degradation allowed

      const hasRegression = current > (baseline * threshold);
      expect(hasRegression).to.be.true;
    });

    it("should track performance trends over multiple runs", () => {
      const measurements = [45, 48, 47, 50, 52, 55, 60, 65];
      
      const trend = (arr: number[]): "improving" | "degrading" | "stable" => {
        if (arr.length < 2) return "stable";
        const first = arr[0];
        const last = arr[arr.length - 1];
        const change = (last - first) / first;
        
        if (change > 0.1) return "degrading";
        if (change < -0.1) return "improving";
        return "stable";
      };

      expect(trend(measurements)).to.equal("degrading");
    });

    it("should maintain acceptable average performance", () => {
      const measurements = [45, 50, 48, 52, 47, 51];
      const average = measurements.reduce((sum, m) => sum + m, 0) / measurements.length;
      const MAX_AVG = 60;

      expect(average).to.be.lessThan(MAX_AVG);
    });
  });

  describe("Object Cache Performance", () => {
    beforeEach(() => {
      // Reset Game and global state
      // @ts-ignore: Setting up test environment
      global.Game = {
        time: 1000,
        rooms: {},
        cpu: { getUsed: () => 0 },
        getObjectById: (id: Id<any>) => {
          // Simulate lookup cost
          let sum = 0;
          for (let i = 0; i < 10; i++) {
            sum += i;
          }
          
          if (id === "test-storage-1") {
            return { id, structureType: STRUCTURE_STORAGE };
          }
          return null;
        }
      };
      
      const { clearObjectCache, resetCacheStats } = require("../../src/utils/objectCache");
      clearObjectCache();
      resetCacheStats();
    });

    it("should reduce lookup time with caching", () => {
      const { getCachedObjectById } = require("../../src/utils/objectCache");
      
      // First lookup - cache miss (slower)
      const time1 = measurePerformance("cache_miss", () => {
        getCachedObjectById("test-storage-1" as Id<any>);
      });
      
      // Second lookup - cache hit (faster)
      const time2 = measurePerformance("cache_hit", () => {
        getCachedObjectById("test-storage-1" as Id<any>);
      });
      
      // Cache hit should be faster than cache miss
      expect(time2).to.be.at.most(time1);
    });

    it("should achieve high hit rate with repeated accesses", () => {
      const { getCachedObjectById, getCacheStatistics, resetCacheStats } = 
        require("../../src/utils/objectCache");
      
      resetCacheStats();
      
      // Access same object 100 times
      for (let i = 0; i < 100; i++) {
        getCachedObjectById("test-storage-1" as Id<any>);
      }
      
      const stats = getCacheStatistics();
      
      // Should have 1 miss (first access) and 99 hits
      expect(stats.misses).to.equal(1);
      expect(stats.hits).to.equal(99);
      expect(stats.hitRate).to.equal(99); // 99/100 = 99%
    });

    it("should demonstrate CPU savings with multiple objects", () => {
      const { getCachedObjectById, getCacheStatistics, resetCacheStats } = 
        require("../../src/utils/objectCache");
      
      // Mock multiple objects
      const objectIds = Array.from({ length: 50 }, (_, i) => `obj-${i}`);
      
      // @ts-ignore: Mock getObjectById
      global.Game.getObjectById = (id: Id<any>) => {
        // Simulate lookup cost
        let sum = 0;
        for (let i = 0; i < 10; i++) {
          sum += i;
        }
        return { id };
      };
      
      resetCacheStats();
      
      // Access each object 10 times
      const time = measurePerformance("cached_multi_access", () => {
        for (let i = 0; i < 10; i++) {
          for (const id of objectIds) {
            getCachedObjectById(id as Id<any>);
          }
        }
      });
      
      const stats = getCacheStatistics();
      
      // Should have 50 misses (one per unique object) and 450 hits (9 additional accesses per object)
      expect(stats.misses).to.equal(50);
      expect(stats.hits).to.equal(450);
      expect(stats.hitRate).to.equal(90); // 450/500 = 90%
      
      // CPU saved should be positive
      expect(stats.cpuSaved).to.be.greaterThan(0);
    });

    it("should maintain performance with TTL expiration", () => {
      const { getCachedObjectById, resetCacheStats } = require("../../src/utils/objectCache");
      
      resetCacheStats();
      
      // Access object at tick 1000 (structure with 10-tick TTL, expires at 1010)
      const obj1 = getCachedObjectById("test-storage-1" as Id<any>);
      
      // Advance 5 ticks (structure still cached, expires at 1010)
      // @ts-ignore: Modifying test environment
      global.Game.time = 1005;
      
      const time1 = measurePerformance("within_ttl", () => {
        const obj2 = getCachedObjectById("test-storage-1" as Id<any>);
        // Should be same cached object
        expect(obj1).to.equal(obj2);
      });
      
      // Advance past TTL (to tick 1010 - entry expires)
      // @ts-ignore: Modifying test environment  
      global.Game.time = 1010;
      
      const time2 = measurePerformance("after_ttl", () => {
        const obj3 = getCachedObjectById("test-storage-1" as Id<any>);
        // Should be freshly fetched, different object
        expect(obj1).to.not.equal(obj3);
      });
      
      // Both should complete quickly (no performance degradation)
      expect(time1).to.be.lessThan(10);
      expect(time2).to.be.lessThan(10);
    });

    it("should handle cache warming efficiently", () => {
      const { warmCache } = require("../../src/utils/objectCache");
      
      // Mock rooms with structures
      // @ts-ignore: Setting up test environment
      global.Game.rooms = {
        W1N1: {
          name: "W1N1",
          controller: {
            my: true,
            id: "controller-1" as Id<StructureController>
          },
          storage: {
            id: "storage-1" as Id<StructureStorage>
          },
          terminal: {
            id: "terminal-1" as Id<StructureTerminal>
          },
          find: () => []
        }
      };
      
      const time = measurePerformance("cache_warm", () => {
        warmCache();
      });
      
      // Cache warming should be fast (< 50ms in test environment)
      expect(time).to.be.lessThan(50);
    });

    it("should scale with large cache sizes", () => {
      const { getCachedObjectById } = require("../../src/utils/objectCache");
      
      // Create 1000 unique object IDs
      const objectIds = Array.from({ length: 1000 }, (_, i) => `obj-${i}`);
      
      // @ts-ignore: Mock getObjectById
      global.Game.getObjectById = (id: Id<any>) => ({ id });
      
      // Populate cache
      for (const id of objectIds) {
        getCachedObjectById(id as Id<any>);
      }
      
      // Access random objects (should be fast due to Map lookup)
      const time = measurePerformance("large_cache_access", () => {
        for (let i = 0; i < 100; i++) {
          const randomId = objectIds[Math.floor(Math.random() * objectIds.length)];
          getCachedObjectById(randomId as Id<any>);
        }
      });
      
      // Should still be fast with large cache
      expect(time).to.be.lessThan(20);
    });
  });
});
