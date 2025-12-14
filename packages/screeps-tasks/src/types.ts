/**
 * Task status enum
 */
export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  FINISHED = 'finished',
  FAILED = 'failed'
}

/**
 * Action result interface
 */
export interface ActionResult {
  success: boolean;
  error?: string;
  completed?: boolean;
}

/**
 * Base Action interface
 */
export interface Action {
  readonly type: string;
  execute(creep: Creep): ActionResult;
  serialize?(): SerializedAction;
}

/**
 * Serialized action data that can be stored in Memory
 */
export interface SerializedAction {
  type: string;
  data: any;
}

/**
 * Task interface
 */
export interface Task {
  id: string;
  creepId: string;
  status: TaskStatus;
  actions: Action[];
  currentActionIndex: number;
  loop: boolean;
}

/**
 * Serialized task data that can be stored in Memory
 */
export interface SerializedTask {
  id: string;
  creepId: string;
  status: TaskStatus;
  actions: SerializedAction[];
  currentActionIndex: number;
  loop: boolean;
}

/**
 * Task configuration for creation
 */
export interface TaskConfig {
  creepId: string;
  actions: Action[];
  loop?: boolean;
}
