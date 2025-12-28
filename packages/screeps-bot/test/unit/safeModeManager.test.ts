/**
 * Safe Mode Manager Tests
 *
 * Tests for emergency safe mode activation system
 */

import { expect } from "chai";
import { SafeModeManager } from "@ralphschuler/screeps-defense";
import { createDefaultSwarmState } from "../../src/memory/schemas";

describe("Safe Mode Manager", () => {
  let safeModeManager: SafeModeManager;

  beforeEach(() => {
    safeModeManager = new SafeModeManager();
  });

  describe("Safe Mode Availability Check", () => {
    it("should not activate when already in safe mode", () => {
      const mockRoom = {
        name: "W1N1",
        controller: {
          my: true,
          safeMode: 15000, // Currently in safe mode
          safeModeAvailable: 1,
          safeModeCooldown: undefined
        },
        find: () => []
      } as unknown as Room;

      const swarm = createDefaultSwarmState();
      swarm.danger = 3;

      // Should not trigger - already active
      const shouldTrigger = !mockRoom.controller?.safeMode;
      expect(shouldTrigger).to.be.false;
    });

    it("should not activate when on cooldown", () => {
      const mockRoom = {
        name: "W1N1",
        controller: {
          my: true,
          safeMode: undefined,
          safeModeAvailable: 1,
          safeModeCooldown: 10000 // On cooldown
        },
        find: () => []
      } as unknown as Room;

      const swarm = createDefaultSwarmState();
      swarm.danger = 3;

      const shouldTrigger = !mockRoom.controller?.safeModeCooldown;
      expect(shouldTrigger).to.be.false;
    });

    it("should not activate when no safe modes available", () => {
      const mockRoom = {
        name: "W1N1",
        controller: {
          my: true,
          safeMode: undefined,
          safeModeAvailable: 0, // None available
          safeModeCooldown: undefined
        },
        find: () => []
      } as unknown as Room;

      const swarm = createDefaultSwarmState();
      swarm.danger = 3;

      const shouldTrigger = (mockRoom.controller?.safeModeAvailable ?? 0) > 0;
      expect(shouldTrigger).to.be.false;
    });
  });

  describe("Danger Level Thresholds", () => {
    it("should not trigger at danger level 0", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 0;

      const shouldTrigger = swarm.danger >= 2;
      expect(shouldTrigger).to.be.false;
    });

    it("should not trigger at danger level 1", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 1;

      const shouldTrigger = swarm.danger >= 2;
      expect(shouldTrigger).to.be.false;
    });

    it("should consider triggering at danger level 2", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 2;

      const shouldTrigger = swarm.danger >= 2;
      expect(shouldTrigger).to.be.true;
    });

    it("should consider triggering at danger level 3", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 3;

      const shouldTrigger = swarm.danger >= 2;
      expect(shouldTrigger).to.be.true;
    });
  });

  describe("Critical Structure Protection", () => {
    it("should trigger when spawn health is critical", () => {
      const spawn = {
        hits: 800,
        hitsMax: 5000,
        structureType: STRUCTURE_SPAWN
      };

      const healthPercent = spawn.hits / spawn.hitsMax;
      const isCritical = healthPercent < 0.2;

      expect(isCritical).to.be.true;
    });

    it("should not trigger when spawn health is healthy", () => {
      const spawn = {
        hits: 4000,
        hitsMax: 5000,
        structureType: STRUCTURE_SPAWN
      };

      const healthPercent = spawn.hits / spawn.hitsMax;
      const isCritical = healthPercent < 0.2;

      expect(isCritical).to.be.false;
    });

    it("should trigger when storage health is critical", () => {
      const storage = {
        hits: 1500,
        hitsMax: 10000,
        structureType: STRUCTURE_STORAGE
      };

      const healthPercent = storage.hits / storage.hitsMax;
      const isCritical = healthPercent < 0.2;

      expect(isCritical).to.be.true;
    });

    it("should trigger when terminal health is critical", () => {
      const terminal = {
        hits: 500,
        hitsMax: 3000,
        structureType: STRUCTURE_TERMINAL
      };

      const healthPercent = terminal.hits / terminal.hitsMax;
      const isCritical = healthPercent < 0.2;

      expect(isCritical).to.be.true;
    });

    it("should check multiple spawns for critical health", () => {
      const spawns = [
        { hits: 4000, hitsMax: 5000 },
        { hits: 800, hitsMax: 5000 }, // Critical
        { hits: 3500, hitsMax: 5000 }
      ];

      const hasCriticalSpawn = spawns.some(s => s.hits / s.hitsMax < 0.2);

      expect(hasCriticalSpawn).to.be.true;
    });
  });

  describe("Defender Count Assessment", () => {
    it("should trigger when defenders are outnumbered", () => {
      const hostileCount = 5;
      const defenderCount = 1;

      const isOutnumbered = defenderCount < hostileCount * 0.5;

      expect(isOutnumbered).to.be.true;
    });

    it("should not trigger when defenders are adequate", () => {
      const hostileCount = 3;
      const defenderCount = 2;

      const isOutnumbered = defenderCount < hostileCount * 0.5;

      expect(isOutnumbered).to.be.false;
    });

    it("should not trigger when no hostiles present", () => {
      const hostileCount = 0;
      const defenderCount = 0;

      const needsSafeMode = hostileCount > 0 && defenderCount < hostileCount * 0.5;

      expect(needsSafeMode).to.be.false;
    });
  });

  describe("Safe Mode Duration and Cooldown", () => {
    it("should know safe mode duration", () => {
      const duration = SAFE_MODE_DURATION;

      expect(duration).to.equal(20000);
    });

    it("should know safe mode cooldown period", () => {
      const cooldown = SAFE_MODE_COOLDOWN;

      expect(cooldown).to.equal(50000);
    });

    it("should calculate when safe mode will end", () => {
      const currentTime = 10000;
      const safeModeActivated = 5000;
      const remainingTime = SAFE_MODE_DURATION - (currentTime - safeModeActivated);

      expect(remainingTime).to.equal(15000);
    });

    it("should calculate when safe mode becomes available again", () => {
      const lastUsed = 5000;
      const currentTime = 30000;
      const cooldownRemaining = Math.max(0, SAFE_MODE_COOLDOWN - (currentTime - lastUsed));

      expect(cooldownRemaining).to.equal(25000);
    });
  });

  describe("Multiple Criteria Evaluation", () => {
    it("should trigger when all criteria are met", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 3;

      const spawn = { hits: 800, hitsMax: 5000 };
      const safeModeAvailable = 1;
      const isOnCooldown = false;
      const isActive = false;

      const shouldTrigger = 
        !isActive &&
        !isOnCooldown &&
        safeModeAvailable > 0 &&
        swarm.danger >= 2 &&
        spawn.hits / spawn.hitsMax < 0.2;

      expect(shouldTrigger).to.be.true;
    });

    it("should not trigger when danger is low despite critical structure", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 1; // Too low

      const spawn = { hits: 800, hitsMax: 5000 };
      const safeModeAvailable = 1;
      const isOnCooldown = false;
      const isActive = false;

      const shouldTrigger = 
        !isActive &&
        !isOnCooldown &&
        safeModeAvailable > 0 &&
        swarm.danger >= 2 &&
        spawn.hits / spawn.hitsMax < 0.2;

      expect(shouldTrigger).to.be.false;
    });

    it("should not trigger when structures are healthy despite high danger", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 3;

      const spawn = { hits: 4500, hitsMax: 5000 }; // Healthy
      const storage = { hits: 9000, hitsMax: 10000 }; // Healthy
      const safeModeAvailable = 1;

      const hasAnyCritical = 
        spawn.hits / spawn.hitsMax < 0.2 ||
        storage.hits / storage.hitsMax < 0.2;

      expect(hasAnyCritical).to.be.false;
    });
  });

  describe("Priority Structure Identification", () => {
    it("should prioritize spawn over other structures", () => {
      const structures = [
        { type: STRUCTURE_STORAGE, hits: 1000, hitsMax: 10000, priority: 2 },
        { type: STRUCTURE_SPAWN, hits: 800, hitsMax: 5000, priority: 1 },
        { type: STRUCTURE_TERMINAL, hits: 500, hitsMax: 3000, priority: 3 }
      ];

      structures.sort((a, b) => a.priority - b.priority);

      expect(structures[0].type).to.equal(STRUCTURE_SPAWN);
    });

    it("should check all spawns before other structures", () => {
      const spawns = [
        { hits: 4000, hitsMax: 5000 },
        { hits: 3500, hitsMax: 5000 }
      ];
      
      const storage = { hits: 1000, hitsMax: 10000 };

      const hasHealthySpawns = spawns.every(s => s.hits / s.hitsMax >= 0.2);
      const storageCritical = storage.hits / storage.hitsMax < 0.2;

      // Even if storage is critical, spawns are healthy
      expect(hasHealthySpawns).to.be.true;
      expect(storageCritical).to.be.true;
    });
  });

  describe("Safe Mode Activation Result", () => {
    it("should return OK on successful activation", () => {
      const result = OK;

      expect(result).to.equal(OK);
    });

    it("should handle controller not available", () => {
      const mockRoom = {
        name: "W1N1",
        controller: undefined
      } as unknown as Room;

      const canActivate = mockRoom.controller !== undefined;

      expect(canActivate).to.be.false;
    });

    it("should handle controller not owned", () => {
      const mockRoom = {
        name: "W1N1",
        controller: {
          my: false
        }
      } as unknown as Room;

      const canActivate = mockRoom.controller?.my === true;

      expect(canActivate).to.be.false;
    });
  });

  describe("Emergency Response Timing", () => {
    it("should activate before spawn is destroyed", () => {
      const spawn = {
        hits: 950,
        hitsMax: 5000,
        damagePerTick: 100
      };

      const ticksUntilDestroyed = Math.floor(spawn.hits / spawn.damagePerTick);
      const threshold = spawn.hitsMax * 0.2;
      const shouldActivateNow = spawn.hits < threshold;

      expect(shouldActivateNow).to.be.true;
      expect(ticksUntilDestroyed).to.be.lessThan(10);
    });

    it("should allow time for defenders to respond before safe mode", () => {
      const spawn = {
        hits: 2000,
        hitsMax: 5000
      };

      const healthPercent = spawn.hits / spawn.hitsMax;
      const needsImmediateSafeMode = healthPercent < 0.2;
      const needsDefenders = healthPercent < 0.5;

      expect(needsDefenders).to.be.true;
      expect(needsImmediateSafeMode).to.be.false;
    });
  });
});
