import { expect } from "chai";

import { getConfig } from "../../src/config";
import { creepProcessManager } from "../../src/core/creepProcessManager";
import { roomProcessManager } from "../../src/core/roomProcessManager";
import { kernel } from "../../src/core/kernel";
import { ProcessPriority } from "../../src/core/kernel";
import { Game as MockGame } from "./mock";

describe("Process manager bucket policy", () => {
  let tickCounter = 0;

  beforeEach(() => {
    tickCounter++;

    // @ts-ignore allow overriding global Game object for tests
    global.Game = {
      ...MockGame,
      creeps: {},
      rooms: {},
      time: tickCounter,
      cpu: {
        ...MockGame.cpu,
        bucket: 10000,
        limit: 50,
        getUsed: () => 0
      }
    };

    global.Memory = {
      creeps: {},
      rooms: {},
      spawns: {},
      flags: {},
      powerCreeps: {},
      empire: { incomingNukes: [] }
    } as typeof Memory;

    // Remove existing manager processes to keep test isolation
    const existing = kernel.getProcesses().filter(p => p.id.startsWith("creep:") || p.id.startsWith("room:"));
    for (const process of existing) {
      kernel.unregisterProcess(process.id);
    }

    creepProcessManager.reset();
    roomProcessManager.reset();
  });

  it("maps creep priorities to bucket-aware minBucket values", () => {
    const { lowMode, highMode } = getConfig().cpu.bucketThresholds;

    const homeRoom = {
      name: "W1N1",
      controller: { my: true, level: 1 }
    } as unknown as Room;

    // @ts-ignore test setup
    global.Game.rooms = { W1N1: homeRoom };

    const creeps: Record<string, Creep> = {
      "creep-harvester": {
        name: "creep-harvester",
        memory: { role: "harvester", family: "economy", homeRoom: "W1N1" },
        spawning: false
      } as unknown as Creep,
      "creep-builder": {
        name: "creep-builder",
        memory: { role: "builder", family: "economy", homeRoom: "W1N1" },
        spawning: false
      } as unknown as Creep,
      "creep-upgrader": {
        name: "creep-upgrader",
        memory: { role: "upgrader", family: "economy", homeRoom: "W1N1" },
        room: homeRoom,
        spawning: false
      } as unknown as Creep,
      "creep-remote-hauler": {
        name: "creep-remote-hauler",
        memory: { role: "remoteHauler", family: "economy", homeRoom: "W1N1" },
        spawning: false
      } as unknown as Creep,
      "creep-lab-tech": {
        name: "creep-lab-tech",
        memory: { role: "labTech", family: "utility", homeRoom: "W1N1" },
        spawning: false
      } as unknown as Creep
    };

    global.Game.creeps = creeps;

    creepProcessManager.syncCreepProcesses();

    expect(kernel.getProcess("creep:creep-harvester")?.minBucket).to.equal(0);
    expect(kernel.getProcess("creep:creep-builder")?.minBucket).to.equal(lowMode);
    expect(kernel.getProcess("creep:creep-upgrader")?.minBucket).to.equal(0);
    expect(kernel.getProcess("creep:creep-remote-hauler")?.minBucket).to.equal(lowMode);
    expect(kernel.getProcess("creep:creep-lab-tech")?.minBucket).to.equal(highMode);
    expect(kernel.getProcess("creep:creep-lab-tech")?.priority).to.equal(ProcessPriority.IDLE);
  });

  it("promotes an owned room with a visible nuke and exposes the response reason", () => {
    const room = {
      name: "W1N1",
      controller: { my: true, level: 8 },
      find: (type: FindConstant) =>
        type === FIND_NUKES ? [{ id: "nuke-1", timeToLand: 50000, launchRoomName: "E1N1" }] : []
    } as unknown as Room;

    global.Game.rooms = { W1N1: room };
    global.Game.spawns = {};

    roomProcessManager.syncRoomProcesses();

    const process = kernel.getProcess("room:W1N1");
    expect(process?.priority).to.equal(ProcessPriority.CRITICAL);
    expect(process?.tickModulo).to.equal(undefined);
    expect(process?.minBucket).to.equal(0);
    expect(process?.name).to.include("nuke response");
  });

  it("refreshes nuke response telemetry when another hostile keeps priority critical", () => {
    let nukes: Nuke[] = [{ id: "nuke-1", timeToLand: 50000, launchRoomName: "E1N1" }] as unknown as Nuke[];
    const hostile = { owner: { username: "Enemy" } } as unknown as Creep;
    const room = {
      name: "W1N1",
      controller: { my: true, level: 8 },
      find: (type: FindConstant) => {
        if (type === FIND_NUKES) return nukes;
        if (type === FIND_HOSTILE_CREEPS) return [hostile];
        return [];
      }
    } as unknown as Room;

    global.Game.rooms = { W1N1: room };
    global.Game.spawns = {};
    roomProcessManager.syncRoomProcesses();
    expect(kernel.getProcess("room:W1N1")?.priority).to.equal(ProcessPriority.CRITICAL);
    expect(kernel.getProcess("room:W1N1")?.name).to.include("nuke response");

    nukes = [];
    global.Game.time += 5;
    roomProcessManager.forceResync();
    expect(kernel.getProcess("room:W1N1")?.priority).to.equal(ProcessPriority.CRITICAL);
    expect(kernel.getProcess("room:W1N1")?.name).to.not.include("nuke response");

    nukes = [{ id: "nuke-2", timeToLand: 49990, launchRoomName: "E1N1" }] as unknown as Nuke[];
    global.Game.time += 5;
    roomProcessManager.forceResync();
    expect(kernel.getProcess("room:W1N1")?.priority).to.equal(ProcessPriority.CRITICAL);
    expect(kernel.getProcess("room:W1N1")?.name).to.include("nuke response");
  });

  it("promotes persisted nuke intent after a global reset without rescanning a nuke", () => {
    const room = {
      name: "W1N1",
      controller: { my: true, level: 8 },
      find: (type: FindConstant) => {
        if (type === FIND_NUKES) {
          throw new Error("persisted nuke intent should avoid a live scan");
        }
        return [];
      }
    } as unknown as Room;

    global.Memory.rooms = {} as typeof Memory.rooms;
    global.Memory.empire = {
      incomingNukes: [{ roomName: "W1N1", impactTick: global.Game.time + 50000 }]
    } as unknown as typeof Memory.empire;
    global.Game.rooms = { W1N1: room };
    global.Game.spawns = {};

    roomProcessManager.syncRoomProcesses();

    expect(kernel.getProcess("room:W1N1")?.priority).to.equal(ProcessPriority.CRITICAL);
    expect(kernel.getProcess("room:W1N1")?.tickModulo).to.equal(undefined);
  });

  it("promotes a room when a nuke appears after the bounded scan interval", () => {
    let nukes: Nuke[] = [];
    const room = {
      name: "W1N1",
      controller: { my: true, level: 8 },
      find: (type: FindConstant) => (type === FIND_NUKES ? nukes : [])
    } as unknown as Room;

    global.Game.rooms = { W1N1: room };
    global.Game.spawns = {};
    roomProcessManager.syncRoomProcesses();
    expect(kernel.getProcess("room:W1N1")?.priority).to.equal(ProcessPriority.HIGH);

    nukes = [{ id: "nuke-1", timeToLand: 50000, launchRoomName: "E1N1" }] as unknown as Nuke[];
    global.Game.time += 5;
    roomProcessManager.forceResync();

    const process = kernel.getProcess("room:W1N1");
    expect(process?.priority).to.equal(ProcessPriority.CRITICAL);
    expect(process?.tickModulo).to.equal(undefined);
    expect(process?.name).to.include("nuke response");
  });

  it("uses persisted room swarm nuke intent after a global reset", () => {
    const room = {
      name: "W1N1",
      controller: { my: true, level: 8 },
      find: (type: FindConstant) => {
        if (type === FIND_NUKES) {
          throw new Error("persisted swarm nuke intent should avoid a live scan");
        }
        return [];
      }
    } as unknown as Room;

    global.Memory.rooms = {
      W1N1: { swarm: { nukeDetected: true } }
    } as typeof Memory.rooms;
    global.Game.rooms = { W1N1: room };
    global.Game.spawns = {};

    roomProcessManager.syncRoomProcesses();

    expect(kernel.getProcess("room:W1N1")?.priority).to.equal(ProcessPriority.CRITICAL);
    expect(kernel.getProcess("room:W1N1")?.tickModulo).to.equal(undefined);
  });

  it("returns to distributed scheduling after persisted nuke intent expires", () => {
    const room = {
      name: "W1N1",
      controller: { my: true, level: 8 },
      find: () => []
    } as unknown as Room;
    global.Memory.empire = {
      incomingNukes: [{ roomName: "W1N1", impactTick: global.Game.time + 1 }]
    } as unknown as typeof Memory.empire;
    global.Game.rooms = { W1N1: room };
    global.Game.spawns = {};

    roomProcessManager.syncRoomProcesses();
    expect(kernel.getProcess("room:W1N1")?.priority).to.equal(ProcessPriority.CRITICAL);

    global.Game.time += 2;
    roomProcessManager.forceResync();

    const process = kernel.getProcess("room:W1N1");
    expect(process?.priority).to.equal(ProcessPriority.HIGH);
    expect(process?.tickModulo).to.equal(5);
    expect(process?.name).to.not.include("nuke response");
  });

  it("drops nuke scan cache when a room leaves visibility", () => {
    let nukes: Nuke[] = [];
    const room = {
      name: "W1N1",
      controller: { my: true, level: 8 },
      find: (type: FindConstant) => (type === FIND_NUKES ? nukes : [])
    } as unknown as Room;

    global.Game.rooms = { W1N1: room };
    global.Game.spawns = {};
    roomProcessManager.syncRoomProcesses();

    global.Game.time += 1;
    global.Game.rooms = {};
    roomProcessManager.forceResync();

    nukes = [{ id: "nuke-1", timeToLand: 50000, launchRoomName: "E1N1" }] as unknown as Nuke[];
    global.Game.time += 1;
    global.Game.rooms = { W1N1: room };
    roomProcessManager.forceResync();

    expect(kernel.getProcess("room:W1N1")?.priority).to.equal(ProcessPriority.CRITICAL);
  });

  it("keeps an owned room without nuke intent on distributed high priority", () => {
    const room = {
      name: "W1N1",
      controller: { my: true, level: 8 },
      find: () => []
    } as unknown as Room;

    global.Game.rooms = { W1N1: room };
    global.Game.spawns = {};

    roomProcessManager.syncRoomProcesses();

    const process = kernel.getProcess("room:W1N1");
    expect(process?.priority).to.equal(ProcessPriority.HIGH);
    expect(process?.tickModulo).to.equal(5);
    expect(process?.name).to.not.include("nuke response");
  });

  it("assigns distinct scheduler offsets to distributed owned rooms", () => {
    const room = (name: string) =>
      ({
        name,
        controller: { my: true, level: 8 },
        find: () => []
      }) as unknown as Room;

    global.Game.rooms = {
      W1N1: room("W1N1"),
      W1N2: room("W1N2")
    };
    global.Game.spawns = {};

    roomProcessManager.syncRoomProcesses();

    expect(kernel.getProcess("room:W1N1")?.tickModulo).to.equal(5);
    expect(kernel.getProcess("room:W1N1")?.tickOffset).to.equal(0);
    expect(kernel.getProcess("room:W1N2")?.tickModulo).to.equal(5);
    expect(kernel.getProcess("room:W1N2")?.tickOffset).to.equal(1);
  });

  it("bounds nuke priority scans while the bucket is low", () => {
    const { lowMode } = getConfig().cpu.bucketThresholds;
    let nukeScans = 0;
    const room = {
      name: "W1N1",
      controller: { my: true, level: 8 },
      find: (type: FindConstant) => {
        if (type === FIND_NUKES) nukeScans++;
        return [];
      }
    } as unknown as Room;

    global.Game.cpu.bucket = lowMode - 1;
    global.Game.rooms = { W1N1: room };
    global.Game.spawns = {};

    roomProcessManager.syncRoomProcesses();
    global.Game.time += 1;
    roomProcessManager.forceResync();

    expect(nukeScans).to.equal(1);
  });

  it("maps room priorities to bucket-aware minBucket values", () => {
    const { lowMode } = getConfig().cpu.bucketThresholds;
    const myUsername = "TestPlayer";

    global.Game.rooms = {
      W1N1: {
        name: "W1N1",
        controller: {
          my: true,
          level: 7
        },
        find: () => []
      } as unknown as Room,
      W1N2: {
        name: "W1N2",
        controller: {
          my: false,
          reservation: { username: myUsername, ticksToEnd: 2000 }
        },
        find: () => []
      } as unknown as Room,
      W1N3: {
        name: "W1N3",
        controller: {
          my: false,
          reservation: { username: "other-player", ticksToEnd: 2000 }
        },
        find: () => []
      } as unknown as Room
    } as unknown as Record<string, Room>;

    global.Game.spawns = {
      Spawn1: {
        owner: {
          username: myUsername
        }
      } as unknown as StructureSpawn
    };

    roomProcessManager.syncRoomProcesses();

    expect(kernel.getProcess("room:W1N1")?.minBucket).to.equal(0);
    expect(kernel.getProcess("room:W1N1")?.priority).to.equal(ProcessPriority.HIGH);

    expect(kernel.getProcess("room:W1N2")?.minBucket).to.equal(lowMode);
    expect(kernel.getProcess("room:W1N2")?.priority).to.equal(ProcessPriority.MEDIUM);

    expect(kernel.getProcess("room:W1N3")?.minBucket).to.equal(lowMode);
    expect(kernel.getProcess("room:W1N3")?.priority).to.equal(ProcessPriority.LOW);
  });
});
