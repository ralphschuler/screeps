import { Task, TaskConfig, TaskStatus, SerializedTask, SerializedAction, Action } from './types';

/**
 * TaskManager - Manages task lifecycle and execution
 * 
 * Note: This implementation provides serialize/deserialize methods for persistence.
 * Tasks can be stored in Memory and restored between global resets.
 * Override serializeTask/deserializeTask methods to customize serialization behavior.
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
      currentActionIndex: 0,
      loop: config.loop ?? false
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
      if (task.loop) {
        // Reset to beginning for looping tasks
        task.currentActionIndex = 0;
      } else {
        task.status = TaskStatus.FINISHED;
        return true;
      }
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
        if (task.loop) {
          // Reset to beginning for looping tasks
          task.currentActionIndex = 0;
        } else {
          task.status = TaskStatus.FINISHED;
          return true;
        }
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
   * Serialize a task to a format that can be stored in Memory
   * Override this method to customize serialization behavior
   */
  serializeTask(task: Task): SerializedTask {
    return {
      id: task.id,
      creepId: task.creepId,
      status: task.status,
      currentActionIndex: task.currentActionIndex,
      loop: task.loop,
      actions: task.actions.map(action => this.serializeAction(action))
    };
  }

  /**
   * Deserialize a task from Memory
   * Override this method to customize deserialization behavior
   * 
   * @param serialized - The serialized task data
   * @param actionRegistry - Map of action types to constructor functions
   */
  deserializeTask(serialized: SerializedTask, actionRegistry: ActionRegistry): Task {
    const actions = serialized.actions.map(serializedAction =>
      this.deserializeAction(serializedAction, actionRegistry)
    );

    const task: Task = {
      id: serialized.id,
      creepId: serialized.creepId,
      status: serialized.status,
      currentActionIndex: serialized.currentActionIndex,
      loop: serialized.loop ?? false,
      actions
    };

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Serialize an action to a format that can be stored in Memory
   * Override this method to customize action serialization
   */
  protected serializeAction(action: Action): SerializedAction {
    if (action.serialize) {
      return action.serialize();
    }

    // Default serialization - just stores the type
    // Users should override this or implement serialize() on their actions
    return {
      type: action.type,
      data: {}
    };
  }

  /**
   * Deserialize an action from Memory
   * Override this method to customize action deserialization
   */
  protected deserializeAction(
    serialized: SerializedAction,
    actionRegistry: ActionRegistry
  ): Action {
    const ActionClass = actionRegistry[serialized.type];
    if (!ActionClass) {
      throw new Error(`No action registered for type: ${serialized.type}`);
    }

    return ActionClass(serialized.data);
  }

  /**
   * Save a task to creep memory
   */
  saveTaskToCreep(creep: Creep, task: Task): void {
    creep.memory.task = this.serializeTask(task);
  }

  /**
   * Load a task from creep memory
   */
  loadTaskFromCreep(creep: Creep, actionRegistry: ActionRegistry): Task | undefined {
    if (!creep.memory.task) {
      return undefined;
    }

    try {
      return this.deserializeTask(creep.memory.task as SerializedTask, actionRegistry);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`Failed to load task from creep ${creep.name}: ${errorMsg}`);
      return undefined;
    }
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
 * Action registry maps action type strings to deserializer functions
 */
export type ActionRegistry = {
  [actionType: string]: (data: any) => Action;
};

/**
 * Global task manager instance
 */
export const taskManager = new TaskManager();
