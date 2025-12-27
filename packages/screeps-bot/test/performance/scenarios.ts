/**
 * Performance test scenarios
 * 
 * Based on ROADMAP.md Section 2 CPU targets:
 * - Eco room: ≤0.1 CPU per tick
 * - Combat room: ≤0.25 CPU per tick
 * - Global kernel: ≤1 CPU every 20-50 ticks
 * - Scale to 100+ rooms, 5000+ creeps
 */

import type { PerformanceScenario } from './types';

/**
 * Single room economy scenario
 * Tests basic room operations at RCL 4
 */
export const singleRoomScenario: PerformanceScenario = {
  name: 'Single Room Economy',
  description: 'Basic economy operations in a single RCL 4 room',
  setup: {
    rooms: ['W1N1'],
    rcl: 4,
    energy: 50000,
    sources: 2,
    creeps: {
      harvester: 2,
      carrier: 2,
      upgrader: 1,
      builder: 1
    }
  },
  targets: {
    maxCpuPerTick: 0.1,
    avgCpuPerTick: 0.08,
    bucketStability: 9500
  }
};

/**
 * Ten-room empire scenario
 * Tests scaling across multiple rooms with varying RCLs
 */
export const tenRoomEmpireScenario: PerformanceScenario = {
  name: '10-Room Empire',
  description: 'Multi-room operations with varying RCLs and ~150 creeps',
  setup: {
    rooms: [
      'W1N1', 'W2N1', 'W1N2', 'W2N2', 'W3N1',
      'W1N3', 'W3N2', 'W4N1', 'W2N3', 'W3N3'
    ],
    rcl: [8, 7, 6, 5, 5, 4, 4, 3, 2, 1],
    totalCreeps: 150
  },
  targets: {
    maxCpuPerTick: 1.5,
    avgCpuPerTick: 1.2,
    bucketStability: 8000
  }
};

/**
 * Combat defense scenario
 * Tests tower defense and combat response at RCL 7
 */
export const combatDefenseScenario: PerformanceScenario = {
  name: 'Combat Defense',
  description: 'Tower defense against hostile creeps at RCL 7',
  setup: {
    rooms: ['W1N1'],
    rcl: 7,
    hostiles: {
      attacker: 5,
      healer: 2
    },
    towers: 3
  },
  targets: {
    maxCpuPerTick: 0.25,
    avgCpuPerTick: 0.2,
    hostilesEliminated: true,
    structuresSurvived: true
  }
};

/**
 * All defined scenarios
 */
export const scenarios: PerformanceScenario[] = [
  singleRoomScenario,
  tenRoomEmpireScenario,
  combatDefenseScenario
];

/**
 * Get a scenario by name
 */
export function getScenario(name: string): PerformanceScenario | undefined {
  return scenarios.find(s => s.name === name);
}

/**
 * Get all scenario names
 */
export function getScenarioNames(): string[] {
  return scenarios.map(s => s.name);
}
