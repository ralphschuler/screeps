import { Task, TaskConfig, TaskStatus } from './types';

/**
 * TaskManager - Manages task lifecycle and execution
 * 
 * Note: This is a minimal implementation that stores tasks in memory.
 * Tasks will NOT persist between global resets. For production use:
 * - Recreate tasks each tick based on creep state (see examples)
 * - Store task data in Memory if persistence is needed
 * - Or extend this class with serialization/deserialization methods
 */
export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private taskIdCounter = 0;

  /**
   * Create a new task
   */
  createTask(config: TaskConfig): Task {
    const task: Task = {
      id: this.generateTaskId(config.creepId),
      creepId: config.creepId,
      status: TaskStatus.PENDING,
      actions: config.actions,
      currentActionIndex: 0
    };

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Get a task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks for a creep
   */
  getCreepTasks(creepId: string): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.creepId === creepId);
  }

  /**
   * Get active task for a creep (first pending or processing task)
   */
  getActiveTask(creepId: string): Task | undefined {
    return Array.from(this.tasks.values()).find(
      task =>
        task.creepId === creepId &&
        (task.status === TaskStatus.PENDING || task.status === TaskStatus.PROCESSING)
    );
  }

  /**
   * Execute a task for a creep
   */
  executeTask(taskId: string, creep: Creep): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.creepId !== creep.name) {
      return false;
    }

    if (task.status === TaskStatus.FINISHED || task.status === TaskStatus.FAILED) {
      return false;
    }

    task.status = TaskStatus.PROCESSING;

    if (task.currentActionIndex >= task.actions.length) {
      task.status = TaskStatus.FINISHED;
      return true;
    }

    const currentAction = task.actions[task.currentActionIndex];
    const result = currentAction.execute(creep);

    if (!result.success) {
      task.status = TaskStatus.FAILED;
      return false;
    }

    if (result.completed) {
      task.currentActionIndex++;

      if (task.currentActionIndex >= task.actions.length) {
        task.status = TaskStatus.FINISHED;
        return true;
      }
    }

    return true;
  }

  /**
   * Remove a task
   */
  removeTask(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }

  /**
   * Remove all finished and failed tasks
   */
  cleanup(): void {
    for (const [id, task] of this.tasks.entries()) {
      if (task.status === TaskStatus.FINISHED || task.status === TaskStatus.FAILED) {
        this.tasks.delete(id);
      }
    }
  }

  /**
   * Remove all tasks for a creep
   */
  removeCreepTasks(creepId: string): void {
    for (const [id, task] of this.tasks.entries()) {
      if (task.creepId === creepId) {
        this.tasks.delete(id);
      }
    }
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Clear all tasks
   */
  clear(): void {
    this.tasks.clear();
    this.taskIdCounter = 0;
  }

  /**
   * Generate a predictable task ID
   */
  private generateTaskId(creepId: string): string {
    const timestamp = Game.time || 0;
    const counter = this.taskIdCounter++;
    return `task_${creepId}_${timestamp}_${counter}`;
  }
}

/**
 * Global task manager instance
 */
export const taskManager = new TaskManager();
