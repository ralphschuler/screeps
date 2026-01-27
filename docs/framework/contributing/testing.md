# Testing Guide

Learn how to write **comprehensive tests** for framework packages.

---

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Structure](#test-structure)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)

---

## Testing Philosophy

### Goals

1. **Prevent regressions** - Tests catch breaking changes
2. **Document behavior** - Tests show how code should work
3. **Enable refactoring** - Tests allow confident code changes
4. **Quality assurance** - Tests verify code meets requirements

### Testing Levels

1. **Unit Tests** - Test individual functions/classes
2. **Integration Tests** - Test package interactions
3. **E2E Tests** - Test full bot behavior (optional)

---

## Test Structure

### Directory Layout

```
packages/@ralphschuler/screeps-mynew/
├── src/
│   ├── Manager.ts
│   └── utils.ts
├── test/
│   ├── Manager.test.ts
│   ├── utils.test.ts
│   └── __mocks__/
│       └── Game.ts
├── jest.config.js
└── package.json
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ]
};
```

---

## Unit Testing

### Basic Test Structure

```typescript
// test/Manager.test.ts
import { MyManager } from '../src/Manager';

describe('MyManager', () => {
  let manager: MyManager;
  
  beforeEach(() => {
    manager = new MyManager();
  });
  
  afterEach(() => {
    // Clean up
  });
  
  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(manager).toBeDefined();
      expect(manager.options.debug).toBe(false);
    });
    
    it('should accept custom options', () => {
      const customManager = new MyManager({ debug: true });
      expect(customManager.options.debug).toBe(true);
    });
  });
  
  describe('run', () => {
    it('should process without errors', () => {
      expect(() => manager.run()).not.toThrow();
    });
  });
});
```

### Mocking Game Objects

```typescript
// test/__mocks__/Game.ts
export const mockRoom = {
  name: 'W1N1',
  controller: {
    my: true,
    level: 5,
    progress: 50000,
    progressTotal: 100000
  },
  find: jest.fn(),
  createConstructionSite: jest.fn()
};

export const mockGame = {
  rooms: {
    'W1N1': mockRoom
  },
  creeps: {},
  cpu: {
    getUsed: jest.fn(() => 5.0),
    bucket: 10000
  },
  time: 12345
};

// Use in tests
import { mockGame, mockRoom } from './__mocks__/Game';

beforeEach(() => {
  (global as any).Game = mockGame;
});
```

### Testing with Screeps API

```typescript
describe('SpawnManager', () => {
  let mockSpawn: any;
  
  beforeEach(() => {
    mockSpawn = {
      name: 'Spawn1',
      room: mockRoom,
      spawning: null,
      spawnCreep: jest.fn(() => OK),
      energy: 300,
      energyCapacity: 300
    };
  });
  
  it('should spawn a creep when requested', () => {
    const manager = new SpawnManager();
    const requests = [{
      role: 'harvester',
      priority: 100,
      memory: { role: 'harvester' }
    }];
    
    manager.processSpawnQueue([mockSpawn], requests);
    
    expect(mockSpawn.spawnCreep).toHaveBeenCalled();
  });
});
```

### Testing Pure Functions

```typescript
// src/utils.ts
export function calculateBodyCost(body: BodyPartConstant[]): number {
  const costs: Record<BodyPartConstant, number> = {
    [MOVE]: 50,
    [WORK]: 100,
    [CARRY]: 50,
    [ATTACK]: 80,
    [RANGED_ATTACK]: 150,
    [HEAL]: 250,
    [CLAIM]: 600,
    [TOUGH]: 10
  };
  
  return body.reduce((sum, part) => sum + costs[part], 0);
}

// test/utils.test.ts
import { calculateBodyCost } from '../src/utils';

describe('calculateBodyCost', () => {
  it('should calculate cost for single part', () => {
    expect(calculateBodyCost([MOVE])).toBe(50);
    expect(calculateBodyCost([WORK])).toBe(100);
  });
  
  it('should calculate cost for multiple parts', () => {
    const body = [MOVE, MOVE, WORK, CARRY];
    expect(calculateBodyCost(body)).toBe(250);  // 50+50+100+50
  });
  
  it('should return 0 for empty body', () => {
    expect(calculateBodyCost([])).toBe(0);
  });
});
```

---

## Integration Testing

### Testing Package Interactions

```typescript
// test/integration/kernel.test.ts
import { Kernel } from '@ralphschuler/screeps-kernel';
import { SpawnManager } from '@ralphschuler/screeps-spawn';

describe('Kernel integration', () => {
  let kernel: Kernel;
  let spawnManager: SpawnManager;
  
  beforeEach(() => {
    kernel = new Kernel();
    spawnManager = new SpawnManager();
  });
  
  it('should register and execute spawn process', () => {
    const executeSpy = jest.fn();
    
    kernel.registerProcess({
      id: 'spawning',
      execute: executeSpy,
      cpuBudget: 0.5,
      priority: 90
    });
    
    kernel.run();
    
    expect(executeSpy).toHaveBeenCalled();
  });
  
  it('should respect CPU budgets', () => {
    let totalCPU = 0;
    const cpuBudget = 1.0;
    
    kernel.registerProcess({
      id: 'test',
      execute: () => {
        totalCPU += 0.5;
      },
      cpuBudget,
      priority: 50
    });
    
    kernel.run();
    
    // Should not exceed budget significantly
    expect(totalCPU).toBeLessThanOrEqual(cpuBudget * 1.1);
  });
});
```

### Testing State Machines

```typescript
describe('CreepStateMachine', () => {
  it('should transition states correctly', () => {
    const creep = createMockCreep();
    const stateMachine = new CreepStateMachine(creep);
    
    // Initial state
    expect(stateMachine.currentState).toBe('harvesting');
    
    // Transition when full
    creep.store.getFreeCapacity(RESOURCE_ENERGY) = 0;
    stateMachine.update();
    expect(stateMachine.currentState).toBe('delivering');
    
    // Transition when empty
    creep.store.getUsedCapacity(RESOURCE_ENERGY) = 0;
    stateMachine.update();
    expect(stateMachine.currentState).toBe('harvesting');
  });
});
```

---

## Test Coverage

### Coverage Requirements

**Minimum thresholds**:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Running Coverage

```bash
# Run tests with coverage
npm test -- --coverage

# View HTML coverage report
open coverage/index.html
```

### Coverage Reports

```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   85.23 |    82.14 |   88.46 |   85.67 |
 src/                  |   90.12 |    87.50 |   92.31 |   90.45 |
  Manager.ts           |   95.00 |    90.00 |  100.00 |   95.00 |
  utils.ts             |   85.71 |    80.00 |   88.89 |   86.36 |
-----------------------|---------|----------|---------|---------|
```

### Improving Coverage

**1. Test edge cases**:
```typescript
it('should handle empty input', () => {
  expect(processArray([])).toEqual([]);
});

it('should handle null/undefined', () => {
  expect(processValue(null)).toBe(null);
  expect(processValue(undefined)).toBe(undefined);
});
```

**2. Test error conditions**:
```typescript
it('should throw on invalid input', () => {
  expect(() => processValue(-1)).toThrow();
});
```

**3. Test all branches**:
```typescript
it('should handle bucket > 8000', () => {
  Game.cpu.bucket = 9000;
  expect(shouldRunExpensiveOp()).toBe(true);
});

it('should handle bucket < 2000', () => {
  Game.cpu.bucket = 1000;
  expect(shouldRunExpensiveOp()).toBe(false);
});
```

---

## Best Practices

### 1. Descriptive Test Names

```typescript
// Bad
it('works', () => { /* ... */ });

// Good
it('should spawn harvester when energy available', () => { /* ... */ });
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should calculate optimal body parts', () => {
  // Arrange
  const energy = 550;
  const role = 'harvester';
  
  // Act
  const body = calculateBody(role, energy);
  
  // Assert
  expect(body).toEqual([WORK, WORK, CARRY, MOVE]);
  expect(calculateBodyCost(body)).toBeLessThanOrEqual(energy);
});
```

### 3. Use beforeEach for Setup

```typescript
describe('Manager', () => {
  let manager: Manager;
  let mockRoom: any;
  
  beforeEach(() => {
    mockRoom = createMockRoom();
    manager = new Manager();
  });
  
  // Tests...
});
```

### 4. Test One Thing Per Test

```typescript
// Bad
it('should do everything', () => {
  expect(manager.init()).toBe(true);
  expect(manager.run()).toBe(OK);
  expect(manager.cleanup()).toBe(true);
});

// Good
it('should initialize successfully', () => {
  expect(manager.init()).toBe(true);
});

it('should run without errors', () => {
  manager.init();
  expect(manager.run()).toBe(OK);
});
```

### 5. Mock External Dependencies

```typescript
// Mock cache
jest.mock('@ralphschuler/screeps-cache', () => ({
  getCachedRoomObjects: jest.fn()
}));

import { getCachedRoomObjects } from '@ralphschuler/screeps-cache';

it('should use cached objects', () => {
  (getCachedRoomObjects as jest.Mock).mockReturnValue([mockSource]);
  
  const sources = manager.getSources(mockRoom);
  
  expect(sources).toEqual([mockSource]);
  expect(getCachedRoomObjects).toHaveBeenCalledWith(mockRoom, FIND_SOURCES, 100);
});
```

### 6. Test Async Code

```typescript
it('should handle async operations', async () => {
  const result = await manager.asyncOperation();
  expect(result).toBe('success');
});
```

---

## Related Documentation

- **[Package Development](package-development.md)** - Creating packages
- **[Release Process](release-process.md)** - Publishing workflow
- **[Jest Documentation](https://jestjs.io/)** - Testing framework

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
