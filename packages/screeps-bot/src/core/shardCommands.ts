/**
 * Shard Management Console Commands
 *
 * Provides console commands for managing multi-shard coordination,
 * including shard roles, portal routes, and cross-shard transfers.
 *
 * Implements ROADMAP Section 3 & 11 requirements.
 */

import { Command } from "./commandRegistry";
import { shardManager } from "../intershard/shardManager";
import { resourceTransferCoordinator } from "../intershard/resourceTransferCoordinator";
import type { ShardRole } from "@ralphschuler/screeps-intershard";
import { INTERSHARD_MEMORY_LIMIT } from "@ralphschuler/screeps-intershard";

/**
 * Shard management commands
 */
export class ShardCommands {
  @Command({
    name: "shard.status",
    description: "Display current shard status and metrics",
    usage: "shard.status()",
    examples: ["shard.status()"],
    category: "Shard"
  })
  public status(): string {
    const currentShard = Game.shard?.name ?? "shard0";
    const shardState = shardManager.getCurrentShardState();

    if (!shardState) {
      return `No shard state found for ${currentShard}`;
    }

    const health = shardState.health;
    const lines = [
      `=== Shard Status: ${currentShard} ===`,
      `Role: ${shardState.role.toUpperCase()}`,
      `Rooms: ${health.roomCount} (Avg RCL: ${health.avgRCL})`,
      `Creeps: ${health.creepCount}`,
      `CPU: ${health.cpuCategory.toUpperCase()} (${Math.round(health.cpuUsage * 100)}%)`,
      `Bucket: ${health.bucketLevel}`,
      `Economy Index: ${health.economyIndex}%`,
      `War Index: ${health.warIndex}%`,
      `Portals: ${shardState.portals.length}`,
      `Active Tasks: ${shardState.activeTasks.length}`,
      `Last Update: ${health.lastUpdate}`
    ];

    if (shardState.cpuLimit) {
      lines.push(`CPU Limit: ${shardState.cpuLimit}`);
    }

    return lines.join("\n");
  }

  @Command({
    name: "shard.all",
    description: "List all known shards with summary info",
    usage: "shard.all()",
    examples: ["shard.all()"],
    category: "Shard"
  })
  public all(): string {
    const shards = shardManager.getAllShards();

    if (shards.length === 0) {
      return "No shards tracked yet";
    }

    const lines = ["=== All Shards ==="];
    for (const shard of shards) {
      const h = shard.health;
      lines.push(
        `${shard.name} [${shard.role}]: ${h.roomCount} rooms, RCL ${h.avgRCL}, ` +
        `CPU ${h.cpuCategory} (${Math.round(h.cpuUsage * 100)}%), ` +
        `Eco ${h.economyIndex}%, War ${h.warIndex}%`
      );
    }

    return lines.join("\n");
  }

  @Command({
    name: "shard.setRole",
    description: "Manually set the role for the current shard",
    usage: "shard.setRole(role)",
    examples: [
      "shard.setRole('core')",
      "shard.setRole('frontier')",
      "shard.setRole('resource')",
      "shard.setRole('backup')",
      "shard.setRole('war')"
    ],
    category: "Shard"
  })
  public setRole(role: string): string {
    const validRoles: ShardRole[] = ["core", "frontier", "resource", "backup", "war"];

    if (!validRoles.includes(role as ShardRole)) {
      return `Invalid role: ${role}. Valid roles: ${validRoles.join(", ")}`;
    }

    shardManager.setShardRole(role as ShardRole);
    return `Shard role set to: ${role.toUpperCase()}`;
  }

  @Command({
    name: "shard.portals",
    description: "List all known portals from the current shard",
    usage: "shard.portals(targetShard?)",
    examples: [
      "shard.portals()",
      "shard.portals('shard1')"
    ],
    category: "Shard"
  })
  public portals(targetShard?: string): string {
    const currentShard = Game.shard?.name ?? "shard0";
    const shardState = shardManager.getCurrentShardState();

    if (!shardState) {
      return `No shard state found for ${currentShard}`;
    }

    let portals = shardState.portals;

    if (targetShard) {
      portals = portals.filter(p => p.targetShard === targetShard);
    }

    if (portals.length === 0) {
      const msg = targetShard
        ? `No portals to ${targetShard}`
        : "No portals discovered yet";
      return msg;
    }

    const lines = [
      targetShard
        ? `=== Portals to ${targetShard} ===`
        : "=== All Portals ==="
    ];

    for (const portal of portals) {
      const stable = portal.isStable ? "✓" : "✗";
      const threat = "⚠".repeat(portal.threatRating);
      const traversals = portal.traversalCount ?? 0;
      const ticksAgo = Game.time - portal.lastScouted;

      lines.push(
        `${portal.sourceRoom} → ${portal.targetShard}/${portal.targetRoom} ` +
        `[${stable}] ${threat || "○"} (${traversals} uses, ${ticksAgo}t ago)`
      );
    }

    return lines.join("\n");
  }

  @Command({
    name: "shard.bestPortal",
    description: "Find the optimal portal route to a target shard",
    usage: "shard.bestPortal(targetShard, fromRoom?)",
    examples: [
      "shard.bestPortal('shard1')",
      "shard.bestPortal('shard2', 'E1N1')"
    ],
    category: "Shard"
  })
  public bestPortal(targetShard: string, fromRoom?: string): string {
    const portal = shardManager.getOptimalPortalRoute(targetShard, fromRoom);

    if (!portal) {
      return `No portal found to ${targetShard}`;
    }

    const stable = portal.isStable ? "Stable" : "Unstable";
    const threat = portal.threatRating > 0 ? ` (Threat: ${portal.threatRating})` : "";

    return (
      `Best portal to ${targetShard}:\n` +
      `  Source: ${portal.sourceRoom} (${portal.sourcePos.x},${portal.sourcePos.y})\n` +
      `  Target: ${portal.targetShard}/${portal.targetRoom}\n` +
      `  Status: ${stable}${threat}\n` +
      `  Traversals: ${portal.traversalCount ?? 0}\n` +
      `  Last Scouted: ${Game.time - portal.lastScouted} ticks ago`
    );
  }

  @Command({
    name: "shard.createTask",
    description: "Create a cross-shard task",
    usage: "shard.createTask(type, targetShard, targetRoom?, priority?)",
    examples: [
      "shard.createTask('colonize', 'shard1', 'E5N5', 80)",
      "shard.createTask('reinforce', 'shard2', 'W1N1', 90)",
      "shard.createTask('evacuate', 'shard0', 'E1N1', 100)"
    ],
    category: "Shard"
  })
  public createTask(
    type: string,
    targetShard: string,
    targetRoom?: string,
    priority = 50
  ): string {
    const validTypes = ["colonize", "reinforce", "transfer", "evacuate"];

    if (!validTypes.includes(type)) {
      return `Invalid task type: ${type}. Valid types: ${validTypes.join(", ")}`;
    }

    shardManager.createTask(
      type as "colonize" | "reinforce" | "transfer" | "evacuate",
      targetShard,
      targetRoom,
      priority
    );

    return `Created ${type} task to ${targetShard}${targetRoom ? `/${targetRoom}` : ""} (priority: ${priority})`;
  }

  @Command({
    name: "shard.transferResource",
    description: "Create a cross-shard resource transfer task",
    usage: "shard.transferResource(targetShard, targetRoom, resourceType, amount, priority?)",
    examples: [
      "shard.transferResource('shard1', 'E5N5', 'energy', 50000, 70)",
      "shard.transferResource('shard2', 'W1N1', 'U', 5000, 80)"
    ],
    category: "Shard"
  })
  public transferResource(
    targetShard: string,
    targetRoom: string,
    resourceType: string,
    amount: number,
    priority = 50
  ): string {
    shardManager.createResourceTransferTask(
      targetShard,
      targetRoom,
      resourceType as ResourceConstant,
      amount,
      priority
    );

    return (
      `Created resource transfer task:\n` +
      `  ${amount} ${resourceType} → ${targetShard}/${targetRoom}\n` +
      `  Priority: ${priority}`
    );
  }

  @Command({
    name: "shard.transfers",
    description: "List active cross-shard resource transfers",
    usage: "shard.transfers()",
    examples: ["shard.transfers()"],
    category: "Shard"
  })
  public transfers(): string {
    const requests = resourceTransferCoordinator.getActiveRequests();

    if (requests.length === 0) {
      return "No active resource transfers";
    }

    const lines = ["=== Active Resource Transfers ==="];

    for (const req of requests) {
      const progress = Math.round((req.transferred / req.amount) * 100);
      const creeps = req.assignedCreeps.length;

      lines.push(
        `${req.taskId}: ${req.amount} ${req.resourceType}\n` +
        `  ${req.sourceRoom} → ${req.targetShard}/${req.targetRoom}\n` +
        `  Status: ${req.status.toUpperCase()} (${progress}%)\n` +
        `  Creeps: ${creeps}, Priority: ${req.priority}`
      );
    }

    return lines.join("\n");
  }

  @Command({
    name: "shard.cpuHistory",
    description: "Display CPU allocation history for the current shard",
    usage: "shard.cpuHistory()",
    examples: ["shard.cpuHistory()"],
    category: "Shard"
  })
  public cpuHistory(): string {
    const shardState = shardManager.getCurrentShardState();

    if (!shardState || !shardState.cpuHistory || shardState.cpuHistory.length === 0) {
      return "No CPU history available";
    }

    const lines = ["=== CPU Allocation History ==="];

    for (const entry of shardState.cpuHistory.slice(-10)) {
      const usage = Math.round((entry.cpuUsed / entry.cpuLimit) * 100);
      lines.push(
        `Tick ${entry.tick}: ${entry.cpuUsed.toFixed(2)}/${entry.cpuLimit} (${usage}%) ` +
        `Bucket: ${entry.bucketLevel}`
      );
    }

    return lines.join("\n");
  }

  @Command({
    name: "shard.tasks",
    description: "List all inter-shard tasks",
    usage: "shard.tasks()",
    examples: ["shard.tasks()"],
    category: "Shard"
  })
  public tasks(): string {
    const tasks = shardManager.getActiveTransferTasks();

    if (tasks.length === 0) {
      return "No active inter-shard tasks";
    }

    const lines = ["=== Inter-Shard Tasks ==="];

    for (const task of tasks) {
      const progress = task.progress ?? 0;
      lines.push(
        `${task.id} [${task.type.toUpperCase()}]\n` +
        `  ${task.sourceShard} → ${task.targetShard}${task.targetRoom ? `/${task.targetRoom}` : ""}\n` +
        `  Status: ${task.status.toUpperCase()} (${progress}%)\n` +
        `  Priority: ${task.priority}`
      );
    }

    return lines.join("\n");
  }

  @Command({
    name: "shard.syncStatus",
    description: "Display InterShardMemory sync status and health",
    usage: "shard.syncStatus()",
    examples: ["shard.syncStatus()"],
    category: "Shard"
  })
  public syncStatus(): string {
    const status = shardManager.getSyncStatus();
    const health = status.isHealthy ? "✓ HEALTHY" : "⚠ DEGRADED";

    return (
      `=== InterShardMemory Sync Status ===\n` +
      `Status: ${health}\n` +
      `Last Sync: ${status.lastSync} (${status.ticksSinceSync} ticks ago)\n` +
      `Memory Usage: ${status.memorySize} / ${INTERSHARD_MEMORY_LIMIT} bytes (${status.sizePercent}%)\n` +
      `Shards Tracked: ${status.shardsTracked}\n` +
      `Active Tasks: ${status.activeTasks}\n` +
      `Total Portals: ${status.totalPortals}`
    );
  }

  @Command({
    name: "shard.memoryStats",
    description: "Display InterShardMemory size breakdown",
    usage: "shard.memoryStats()",
    examples: ["shard.memoryStats()"],
    category: "Shard"
  })
  public memoryStats(): string {
    const stats = shardManager.getMemoryStats();

    return (
      `=== InterShardMemory Usage ===\n` +
      `Total: ${stats.size} / ${stats.limit} bytes (${stats.percent}%)\n` +
      `\nBreakdown:\n` +
      `  Shards: ${stats.breakdown.shards} bytes\n` +
      `  Tasks: ${stats.breakdown.tasks} bytes\n` +
      `  Portals: ${stats.breakdown.portals} bytes\n` +
      `  Other: ${stats.breakdown.other} bytes`
    );
  }

  @Command({
    name: "shard.forceSync",
    description: "Force a full InterShardMemory sync with validation",
    usage: "shard.forceSync()",
    examples: ["shard.forceSync()"],
    category: "Shard"
  })
  public forceSync(): string {
    shardManager.forceSync();
    return "InterShardMemory sync forced. Check logs for results.";
  }
}

/**
 * Global shard commands instance
 */
export const shardCommands = new ShardCommands();
