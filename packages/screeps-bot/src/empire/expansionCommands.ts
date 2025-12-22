/**
 * Expansion Console Commands
 * 
 * Commands for monitoring and managing autonomous expansion.
 */

import { Command } from "../core/commandRegistry";
import { memoryManager } from "../memory/manager";
import { expansionManager } from "./expansionManager";

/**
 * Expansion commands for console access
 */
export class ExpansionCommands {
  @Command({
    name: "expansion.status",
    description: "Show expansion system status, GCL progress, and claim queue",
    usage: "expansion.status()",
    examples: ["expansion.status()"],
    category: "Empire"
  })
  public status(): string {
    const empire = memoryManager.getEmpire();
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    
    // GCL Status
    const gclProgress = Game.gcl.progress / Game.gcl.progressTotal;
    const gclPercent = (gclProgress * 100).toFixed(1);
    const roomsAvailable = Game.gcl.level - ownedRooms.length;
    
    // Expansion readiness
    const canExpand = roomsAvailable > 0;
    const expansionPaused = empire.objectives.expansionPaused;
    
    // Queue status
    const totalCandidates = empire.claimQueue.length;
    const unclaimedCandidates = empire.claimQueue.filter(c => !c.claimed).length;
    const activeClaims = empire.claimQueue.filter(c => c.claimed).length;
    
    // Active claimers
    const activeClaimers = Object.values(Game.creeps).filter(creep => {
      const memory = creep.memory as any;
      return memory.role === "claimer" && memory.task === "claim";
    });
    
    let output = `=== Expansion System Status ===

GCL: Level ${Game.gcl.level} (${gclPercent}% to next)
Owned Rooms: ${ownedRooms.length}/${Game.gcl.level}
Available Room Slots: ${roomsAvailable}

Expansion Status: ${expansionPaused ? "PAUSED ⚠" : canExpand ? "READY ✓" : "AT GCL LIMIT"}
Claim Queue: ${totalCandidates} total (${unclaimedCandidates} unclaimed, ${activeClaims} in progress)
Active Claimers: ${activeClaimers.length}

`;

    // Show top expansion candidates
    if (unclaimedCandidates > 0) {
      output += "=== Top Expansion Candidates ===\n";
      const unclaimed = empire.claimQueue.filter(c => !c.claimed).slice(0, 5);
      for (const candidate of unclaimed) {
        const age = Game.time - candidate.lastEvaluated;
        output += `  ${candidate.roomName}: Score ${candidate.score.toFixed(0)}, Distance ${candidate.distance}, Age ${age} ticks\n`;
      }
      output += "\n";
    }
    
    // Show active expansions
    if (activeClaims > 0) {
      output += "=== Active Expansion Attempts ===\n";
      const active = empire.claimQueue.filter(c => c.claimed);
      for (const candidate of active) {
        const age = Game.time - candidate.lastEvaluated;
        const claimer = activeClaimers.find(c => (c.memory as any).targetRoom === candidate.roomName);
        const claimerStatus = claimer ? `${claimer.name} en route` : "No claimer assigned";
        output += `  ${candidate.roomName}: ${claimerStatus}, Age ${age} ticks\n`;
      }
      output += "\n";
    }
    
    // Show owned room RCL distribution
    output += "=== Owned Room Distribution ===\n";
    const rclCounts = new Map<number, number>();
    for (const room of ownedRooms) {
      const rcl = room.controller?.level ?? 0;
      rclCounts.set(rcl, (rclCounts.get(rcl) ?? 0) + 1);
    }
    for (let rcl = 8; rcl >= 1; rcl--) {
      const count = rclCounts.get(rcl) ?? 0;
      if (count > 0) {
        const bar = "█".repeat(count);
        output += `  RCL ${rcl}: ${bar} (${count})\n`;
      }
    }
    
    return output;
  }

  @Command({
    name: "expansion.pause",
    description: "Pause autonomous expansion",
    usage: "expansion.pause()",
    examples: ["expansion.pause()"],
    category: "Empire"
  })
  public pause(): string {
    const empire = memoryManager.getEmpire();
    empire.objectives.expansionPaused = true;
    return "Expansion paused. Use expansion.resume() to re-enable.";
  }

  @Command({
    name: "expansion.resume",
    description: "Resume autonomous expansion",
    usage: "expansion.resume()",
    examples: ["expansion.resume()"],
    category: "Empire"
  })
  public resume(): string {
    const empire = memoryManager.getEmpire();
    empire.objectives.expansionPaused = false;
    return "Expansion resumed.";
  }

  @Command({
    name: "expansion.addRemote",
    description: "Manually add a remote room assignment",
    usage: "expansion.addRemote(homeRoom, remoteRoom)",
    examples: ["expansion.addRemote('W1N1', 'W2N1')"],
    category: "Empire"
  })
  public addRemote(homeRoom: string, remoteRoom: string): string {
    const success = expansionManager.addRemoteRoom(homeRoom, remoteRoom);
    if (success) {
      return `Added remote ${remoteRoom} to ${homeRoom}`;
    }
    return `Failed to add remote (check logs for details)`;
  }

  @Command({
    name: "expansion.removeRemote",
    description: "Manually remove a remote room assignment",
    usage: "expansion.removeRemote(homeRoom, remoteRoom)",
    examples: ["expansion.removeRemote('W1N1', 'W2N1')"],
    category: "Empire"
  })
  public removeRemote(homeRoom: string, remoteRoom: string): string {
    const success = expansionManager.removeRemoteRoom(homeRoom, remoteRoom);
    if (success) {
      return `Removed remote ${remoteRoom} from ${homeRoom}`;
    }
    return `Remote ${remoteRoom} not found in ${homeRoom}`;
  }

  @Command({
    name: "expansion.clearQueue",
    description: "Clear the expansion claim queue",
    usage: "expansion.clearQueue()",
    examples: ["expansion.clearQueue()"],
    category: "Empire"
  })
  public clearQueue(): string {
    const empire = memoryManager.getEmpire();
    const count = empire.claimQueue.length;
    empire.claimQueue = [];
    return `Cleared ${count} candidates from claim queue. Queue will repopulate on next empire tick.`;
  }
}

export const expansionCommands = new ExpansionCommands();
