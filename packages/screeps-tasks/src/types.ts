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
}

/**
 * Task configuration for creation
 */
export interface TaskConfig {
  creepId: string;
  actions: Action[];
}
