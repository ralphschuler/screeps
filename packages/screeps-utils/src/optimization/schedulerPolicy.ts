/**
 * Pure scheduling policy helpers for the computation scheduler.
 *
 * These functions keep bucket gates, interval checks, and CPU-budget decisions
 * separate from task registration and execution side effects. The public
 * `ComputationScheduler` API owns mutation; this module owns deterministic
 * policy rules that can be reused without touching Screeps globals.
 */

/** Minimal task shape required for priority sorting/counting. */
export interface PrioritizedTask<TPriority extends number = number> {
  priority: TPriority;
}

/** A task is due once its interval has fully elapsed since the last run. */
export function isTaskDue(now: number, lastRun: number, interval: number): boolean {
  return now - lastRun >= interval;
}

/** Sort lower numeric priorities first; TaskPriority.CRITICAL is 0. */
export function compareTaskPriority<TTask extends PrioritizedTask>(a: TTask, b: TTask): number {
  return a.priority - b.priority;
}

/** Critical tasks bypass bucket gates; every other priority must meet its threshold. */
export function shouldSkipForBucket<TPriority extends number>(
  priority: TPriority,
  bucket: number,
  bucketThresholds: Record<TPriority, number>,
  criticalPriority: TPriority
): boolean {
  if (priority === criticalPriority) return false;
  return bucket < bucketThresholds[priority];
}

/** Skippable tasks defer when their declared max CPU would exceed the remaining budget. */
export function shouldDeferForBudget(
  cpuUsed: number,
  taskMaxCpu: number,
  cpuBudget: number,
  skippable: boolean | undefined
): boolean {
  return Boolean(skippable) && cpuUsed + taskMaxCpu > cpuBudget;
}

/** Create a zero-filled priority count record with stable keys. */
export function createPriorityCounts<TPriority extends number>(
  priorities: readonly TPriority[]
): Record<TPriority, number> {
  const counts = {} as Record<TPriority, number>;
  for (const priority of priorities) {
    counts[priority] = 0;
  }
  return counts;
}

/** Count registered tasks by priority while preserving explicit zero entries. */
export function countTasksByPriority<TPriority extends number, TTask extends PrioritizedTask<TPriority>>(
  tasks: Iterable<TTask>,
  priorities: readonly TPriority[]
): Record<TPriority, number> {
  const counts = createPriorityCounts(priorities);
  for (const task of tasks) {
    counts[task.priority]++;
  }
  return counts;
}
