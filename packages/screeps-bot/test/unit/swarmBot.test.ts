import { expect } from "chai";

import { creepProcessManager } from "../../src/core/creepProcessManager";
import { roomProcessManager } from "../../src/core/roomProcessManager";
import { kernel } from "../../src/core/kernel";
import { Game as MockGame } from "./mock";

describe("SwarmBot kernel process integration", () => {
  let tickCounter = 0;
  
  beforeEach(() => {
    // Increment tick counter to ensure sync works
    tickCounter++;
    
    // @ts-ignore allow overriding the global Game object for tests
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
    
    // Clean up any existing creep/room processes from previous tests
    const existingProcesses = kernel.getProcesses().filter(p => p.id.startsWith("creep:") || p.id.startsWith("room:"));
    for (const process of existingProcesses) {
      kernel.unregisterProcess(process.id);
    }
    
    // Reset internal state of managers
    creepProcessManager.reset();
    roomProcessManager.reset();
  });

  it("synchronizes creep processes with kernel", () => {
    const harvester = { 
      name: "harvester1",
      spawning: false, 
      memory: { role: "harvester", family: "economy" } 
    } as unknown as Creep;
    
    const builder = { 
      name: "builder1",
      spawning: false, 
      memory: { role: "builder", family: "economy" } 
    } as unknown as Creep;

    // @ts-ignore test setup
    global.Game.creeps = { 
      harvester1: harvester, 
      builder1: builder 
    };

    // Debug: Check Game.creeps before sync
    const creepNames = Object.keys(Game.creeps);
    expect(creepNames.length).to.equal(2, "Should have 2 creeps in Game.creeps");

    // Sync creeps
    creepProcessManager.syncCreepProcesses();

    // Check that processes were registered
    const stats = creepProcessManager.getStats();
    
    // Debug output if fails
    if (stats.registeredCreeps !== 2) {
      console.log("Stats:", stats);
      console.log("Game.creeps:", Object.keys(Game.creeps));
      console.log("Kernel processes:", kernel.getProcesses().map(p => p.id));
    }
    
    expect(stats.registeredCreeps).to.equal(2);
    
    // Verify processes exist in kernel
    const harvesterProcess = kernel.getProcess("creep:harvester1");
    const builderProcess = kernel.getProcess("creep:builder1");
    
    expect(harvesterProcess).to.not.be.undefined;
    expect(builderProcess).to.not.be.undefined;
  });

  it("unregisters dead creeps from kernel", () => {
    const harvester = { 
      name: "harvester1",
      spawning: false, 
      memory: { role: "harvester", family: "economy" } 
    } as unknown as Creep;

    // @ts-ignore test setup
    global.Game.creeps = { harvester1: harvester };

    // Sync with creep
    creepProcessManager.syncCreepProcesses();
    let stats = creepProcessManager.getStats();
    expect(stats.registeredCreeps).to.equal(1);

    // Advance to next tick
    tickCounter++;
    // @ts-ignore test setup
    global.Game.time = tickCounter;

    // Remove creep
    // @ts-ignore test setup
    global.Game.creeps = {};

    // Sync again (on new tick)
    creepProcessManager.syncCreepProcesses();
    stats = creepProcessManager.getStats();
    expect(stats.registeredCreeps).to.equal(0);
    
    // Verify process removed from kernel
    const harvesterProcess = kernel.getProcess("creep:harvester1");
    expect(harvesterProcess).to.be.undefined;
  });

  it("synchronizes room processes with kernel", () => {
    const room = {
      name: "W1N1",
      controller: { my: true, level: 5 },
      find: () => []
    } as unknown as Room;

    // @ts-ignore test setup
    global.Game.rooms = { W1N1: room };

    // Sync rooms
    roomProcessManager.syncRoomProcesses();

    // Check that process was registered
    const stats = roomProcessManager.getStats();
    expect(stats.registeredRooms).to.equal(1);
    expect(stats.ownedRooms).to.equal(1);
    
    // Verify process exists in kernel
    const roomProcess = kernel.getProcess("room:W1N1");
    expect(roomProcess).to.not.be.undefined;
  });
});
