import type { InterShardTask, ShardHealthMetrics, ShardRole } from "../schema";

export type CpuCategory = ShardHealthMetrics["cpuCategory"];

export const ROLE_TO_COMPACT: Record<ShardRole, string> = {
  core: "c",
  frontier: "f",
  resource: "r",
  backup: "b",
  war: "w"
};

export const COMPACT_TO_ROLE: Record<string, ShardRole> = {
  c: "core",
  f: "frontier",
  r: "resource",
  b: "backup",
  w: "war"
};

export const CPU_TO_COMPACT: Record<CpuCategory, string> = {
  low: "l",
  medium: "m",
  high: "h",
  critical: "c"
};

export const COMPACT_TO_CPU: Record<string, CpuCategory> = {
  l: "low",
  m: "medium",
  h: "high",
  c: "critical"
};

export const TASK_TYPE_TO_COMPACT: Record<InterShardTask["type"], string> = {
  colonize: "c",
  reinforce: "r",
  transfer: "t",
  evacuate: "e"
};

export const COMPACT_TO_TASK_TYPE: Record<string, InterShardTask["type"]> = {
  c: "colonize",
  r: "reinforce",
  t: "transfer",
  e: "evacuate"
};

export const TASK_STATUS_TO_COMPACT: Record<InterShardTask["status"], string> = {
  pending: "p",
  active: "a",
  complete: "c",
  failed: "f"
};

export const COMPACT_TO_TASK_STATUS: Record<string, InterShardTask["status"]> = {
  p: "pending",
  a: "active",
  c: "complete",
  f: "failed"
};
