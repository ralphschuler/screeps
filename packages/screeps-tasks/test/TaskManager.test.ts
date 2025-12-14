import { expect } from 'chai';
import { TaskManager } from '../src/TaskManager';
import { TaskStatus, Action, ActionResult } from '../src/types';
import { MoveToAction } from '../src/actions/MoveToAction';

// Mock creep for testing
const createMockCreep = (name: string, pos?: any, store?: any): any => {
  return {
    name,
    pos: pos || {
      x: 25,
      y: 25,
      roomName: 'W1N1',
      inRangeTo: () => false,
      findClosestByPath: () => null
    },
    store: store || {
      [RESOURCE_ENERGY]: 0,
      getFreeCapacity: () => 50
    },
    moveTo: () => OK,
    harvest: () => OK,
    transfer: () => OK,
    withdraw: () => OK,
    upgradeController: () => OK,
    build: () => OK,
    memory: {}
  };
};

// Mock global Game object
(global as any).Game = {
  time: 1000,
  creeps: {},
  rooms: {}
};

// Mock constants
(global as any).OK = 0;
(global as any).ERR_NOT_IN_RANGE = -9;
(global as any).ERR_TIRED = -4;
(global as any).RESOURCE_ENERGY = 'energy';

describe('TaskManager', () => {
  let taskManager: TaskManager;

  beforeEach(() => {
    taskManager = new TaskManager();
    (global as any).Game.time = 1000;
  });

  describe('createTask', () => {
    it('should create a task with a predictable ID', () => {
      const mockAction: Action = {
        type: 'test',
        execute: () => ({ success: true, completed: true })
      };

      const task = taskManager.createTask({
        creepId: 'harvester1',
        actions: [mockAction]
      });

      expect(task).to.exist;
      expect(task.id).to.match(/^task_harvester1_\d+_\d+$/);
      expect(task.creepId).to.equal('harvester1');
      expect(task.status).to.equal(TaskStatus.PENDING);
      expect(task.actions).to.have.lengthOf(1);
      expect(task.currentActionIndex).to.equal(0);
    });

    it('should create tasks with unique IDs', () => {
      const mockAction: Action = {
        type: 'test',
        execute: () => ({ success: true, completed: true })
      };

      const task1 = taskManager.createTask({
        creepId: 'harvester1',
        actions: [mockAction]
      });

      const task2 = taskManager.createTask({
        creepId: 'harvester1',
        actions: [mockAction]
      });

      expect(task1.id).to.not.equal(task2.id);
    });
  });

  describe('getTask', () => {
    it('should retrieve a task by ID', () => {
      const mockAction: Action = {
        type: 'test',
        execute: () => ({ success: true, completed: true })
      };

      const task = taskManager.createTask({
        creepId: 'harvester1',
        actions: [mockAction]
      });

      const retrieved = taskManager.getTask(task.id);
      expect(retrieved).to.exist;
      expect(retrieved!.id).to.equal(task.id);
    });

    it('should return undefined for non-existent task', () => {
      const retrieved = taskManager.getTask('non-existent-id');
      expect(retrieved).to.be.undefined;
    });
  });

  describe('getActiveTask', () => {
    it('should return pending task for a creep', () => {
      const mockAction: Action = {
        type: 'test',
        execute: () => ({ success: true, completed: false })
      };

      const task = taskManager.createTask({
        creepId: 'harvester1',
        actions: [mockAction]
      });

      const activeTask = taskManager.getActiveTask('harvester1');
      expect(activeTask).to.exist;
      expect(activeTask!.id).to.equal(task.id);
    });

    it('should return processing task for a creep', () => {
      const mockAction: Action = {
        type: 'test',
        execute: () => ({ success: true, completed: false })
      };

      const task = taskManager.createTask({
        creepId: 'harvester1',
        actions: [mockAction]
      });

      task.status = TaskStatus.PROCESSING;

      const activeTask = taskManager.getActiveTask('harvester1');
      expect(activeTask).to.exist;
      expect(activeTask!.id).to.equal(task.id);
    });

    it('should not return finished task', () => {
      const mockAction: Action = {
        type: 'test',
        execute: () => ({ success: true, completed: true })
      };

      const task = taskManager.createTask({
        creepId: 'harvester1',
        actions: [mockAction]
      });

      task.status = TaskStatus.FINISHED;

      const activeTask = taskManager.getActiveTask('harvester1');
      expect(activeTask).to.be.undefined;
    });
  });

  describe('executeTask', () => {
    it('should execute actions in sequence', () => {
      let action1Executed = false;
      let action2Executed = false;

      const action1: Action = {
        type: 'test1',
        execute: () => {
          action1Executed = true;
          return { success: true, completed: true };
        }
      };

      const action2: Action = {
        type: 'test2',
        execute: () => {
          action2Executed = true;
          return { success: true, completed: true };
        }
      };

      const task = taskManager.createTask({
        creepId: 'harvester1',
        actions: [action1, action2]
      });

      const creep = createMockCreep('harvester1');

      // Execute first action
      taskManager.executeTask(task.id, creep);
      expect(action1Executed).to.be.true;
      expect(action2Executed).to.be.false;
      expect(task.currentActionIndex).to.equal(1);

      // Execute second action
      taskManager.executeTask(task.id, creep);
      expect(action2Executed).to.be.true;
      expect(task.currentActionIndex).to.equal(2);
      expect(task.status).to.equal(TaskStatus.FINISHED);
    });

    it('should mark task as failed if action fails', () => {
      const failingAction: Action = {
        type: 'failing',
        execute: () => ({ success: false, error: 'Test error' })
      };

      const task = taskManager.createTask({
        creepId: 'harvester1',
        actions: [failingAction]
      });

      const creep = createMockCreep('harvester1');

      const result = taskManager.executeTask(task.id, creep);
      expect(result).to.be.false;
      expect(task.status).to.equal(TaskStatus.FAILED);
    });

    it('should not execute action if not completed', () => {
      let executionCount = 0;

      const action: Action = {
        type: 'repeating',
        execute: () => {
          executionCount++;
          return { success: true, completed: false };
        }
      };

      const task = taskManager.createTask({
        creepId: 'harvester1',
        actions: [action]
      });

      const creep = createMockCreep('harvester1');

      taskManager.executeTask(task.id, creep);
      taskManager.executeTask(task.id, creep);
      taskManager.executeTask(task.id, creep);

      expect(executionCount).to.equal(3);
      expect(task.currentActionIndex).to.equal(0);
      expect(task.status).to.equal(TaskStatus.PROCESSING);
    });
  });

  describe('removeTask', () => {
    it('should remove a task', () => {
      const mockAction: Action = {
        type: 'test',
        execute: () => ({ success: true, completed: true })
      };

      const task = taskManager.createTask({
        creepId: 'harvester1',
        actions: [mockAction]
      });

      const removed = taskManager.removeTask(task.id);
      expect(removed).to.be.true;

      const retrieved = taskManager.getTask(task.id);
      expect(retrieved).to.be.undefined;
    });
  });

  describe('cleanup', () => {
    it('should remove finished and failed tasks', () => {
      const mockAction: Action = {
        type: 'test',
        execute: () => ({ success: true, completed: true })
      };

      const task1 = taskManager.createTask({
        creepId: 'harvester1',
        actions: [mockAction]
      });
      task1.status = TaskStatus.FINISHED;

      const task2 = taskManager.createTask({
        creepId: 'harvester2',
        actions: [mockAction]
      });
      task2.status = TaskStatus.FAILED;

      const task3 = taskManager.createTask({
        creepId: 'harvester3',
        actions: [mockAction]
      });
      task3.status = TaskStatus.PROCESSING;

      taskManager.cleanup();

      expect(taskManager.getTask(task1.id)).to.be.undefined;
      expect(taskManager.getTask(task2.id)).to.be.undefined;
      expect(taskManager.getTask(task3.id)).to.exist;
    });
  });

  describe('clear', () => {
    it('should clear all tasks', () => {
      const mockAction: Action = {
        type: 'test',
        execute: () => ({ success: true, completed: true })
      };

      taskManager.createTask({
        creepId: 'harvester1',
        actions: [mockAction]
      });

      taskManager.createTask({
        creepId: 'harvester2',
        actions: [mockAction]
      });

      taskManager.clear();

      expect(taskManager.getAllTasks()).to.have.lengthOf(0);
    });
  });
});
