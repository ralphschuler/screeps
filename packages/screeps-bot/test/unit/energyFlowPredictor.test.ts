import { assert } from "chai";
import { EnergyFlowPredictor } from "../../src/economy/energyFlowPredictor";

describe("EnergyFlowPredictor", () => {
  let predictor: EnergyFlowPredictor;
  let mockRoom: Room;

  beforeEach(() => {
    predictor = new EnergyFlowPredictor();

    // Setup mock Game object
    (global as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      getObjectById: () => null
    };

    // Create mock room
    mockRoom = {
      name: "W1N1",
      energyAvailable: 500,
      energyCapacityAvailable: 1000,
      controller: {
        my: true,
        level: 4
      },
      find: (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          return [];
        }
        if (type === FIND_MY_STRUCTURES) {
          return [];
        }
        if (type === FIND_MY_CONSTRUCTION_SITES) {
          return [];
        }
        return [];
      }
    } as unknown as Room;
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  describe("predictEnergyInTicks", () => {
    it("should return current energy when ticks is 0", () => {
      const prediction = predictor.predictEnergyInTicks(mockRoom, 0);
      
      assert.equal(prediction.current, 500);
      assert.equal(prediction.predicted, 500);
      assert.equal(prediction.ticks, 0);
    });

    it("should predict positive energy flow", () => {
      // Mock room with harvesters (income)
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          // 2 harvesters with 2 WORK parts each = 4 energy/tick income
          return [
            {
              memory: { role: "harvester" },
              body: [
                { type: WORK, hits: 100 },
                { type: WORK, hits: 100 },
                { type: CARRY, hits: 100 },
                { type: MOVE, hits: 100 }
              ]
            },
            {
              memory: { role: "harvester" },
              body: [
                { type: WORK, hits: 100 },
                { type: WORK, hits: 100 },
                { type: CARRY, hits: 100 },
                { type: MOVE, hits: 100 }
              ]
            }
          ] as Creep[];
        }
        return [];
      };

      const prediction = predictor.predictEnergyInTicks(mockRoom, 50);
      
      assert.equal(prediction.current, 500);
      assert.isAbove(prediction.predicted, 500, "Predicted energy should be higher than current");
      assert.isAbove(prediction.income.total, 0, "Should have positive income");
    });

    it("should predict negative energy flow", () => {
      // Mock room with upgraders (consumption) but no income
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          return [
            {
              memory: { role: "upgrader" },
              body: [
                { type: WORK, hits: 100 },
                { type: WORK, hits: 100 },
                { type: WORK, hits: 100 },
                { type: CARRY, hits: 100 },
                { type: MOVE, hits: 100 }
              ]
            }
          ] as Creep[];
        }
        return [];
      };

      const prediction = predictor.predictEnergyInTicks(mockRoom, 50);
      
      assert.equal(prediction.current, 500);
      assert.isBelow(prediction.predicted, 500, "Predicted energy should be lower than current");
      assert.isAbove(prediction.consumption.total, 0, "Should have positive consumption");
      assert.isBelow(prediction.netFlow, 0, "Net flow should be negative");
    });

    it("should not predict negative energy values", () => {
      // Room with massive consumption
      mockRoom.energyAvailable = 100;
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          // Many upgraders
          return Array.from({ length: 10 }, () => ({
            memory: { role: "upgrader" },
            body: Array.from({ length: 5 }, () => ({ type: WORK, hits: 100 }))
          })) as Creep[];
        }
        return [];
      };

      const prediction = predictor.predictEnergyInTicks(mockRoom, 100);
      
      assert.isAtLeast(prediction.predicted, 0, "Predicted energy should never be negative");
    });

    it("should throw error for negative ticks", () => {
      assert.throws(() => {
        predictor.predictEnergyInTicks(mockRoom, -1);
      }, "Cannot predict negative ticks");
    });

    it("should clamp prediction to max ticks", () => {
      const prediction = predictor.predictEnergyInTicks(mockRoom, 10000);
      
      assert.isAtMost(prediction.ticks, 100, "Should clamp to default max (100 ticks)");
    });
  });

  describe("calculateEnergyIncome", () => {
    it("should calculate income from harvesters", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          return [
            {
              memory: { role: "harvester" },
              body: [
                { type: WORK, hits: 100 },
                { type: WORK, hits: 100 }
              ]
            }
          ] as Creep[];
        }
        return [];
      };

      const income = predictor.calculateEnergyIncome(mockRoom);
      
      assert.isAbove(income.harvesters, 0, "Should have harvester income");
      assert.equal(income.total, income.harvesters + income.miners + income.links);
    });

    it("should calculate income from static miners", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          return [
            {
              memory: { role: "staticMiner" },
              body: [
                { type: WORK, hits: 100 },
                { type: WORK, hits: 100 },
                { type: WORK, hits: 100 }
              ]
            }
          ] as Creep[];
        }
        return [];
      };

      const income = predictor.calculateEnergyIncome(mockRoom);
      
      assert.isAbove(income.miners, 0, "Should have miner income");
      assert.isAbove(income.miners, income.harvesters, "Miners should be more efficient than harvesters");
    });

    it("should ignore damaged body parts", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          return [
            {
              memory: { role: "harvester" },
              body: [
                { type: WORK, hits: 100 }, // Healthy
                { type: WORK, hits: 0 }     // Damaged
              ]
            }
          ] as Creep[];
        }
        return [];
      };

      const income = predictor.calculateEnergyIncome(mockRoom);
      
      // Should only count 1 WORK part (the healthy one)
      assert.isAbove(income.harvesters, 0);
      assert.isBelow(income.harvesters, 2); // Less than 2 WORK parts worth
    });
  });

  describe("calculateEnergyConsumption", () => {
    it("should calculate consumption from upgraders", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          return [
            {
              memory: { role: "upgrader" },
              body: [
                { type: WORK, hits: 100 },
                { type: WORK, hits: 100 }
              ]
            }
          ] as Creep[];
        }
        return [];
      };

      const consumption = predictor.calculateEnergyConsumption(mockRoom);
      
      assert.isAbove(consumption.upgraders, 0, "Should have upgrader consumption");
    });

    it("should calculate consumption from builders", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          return [
            {
              memory: { role: "builder" },
              body: [{ type: WORK, hits: 100 }]
            }
          ] as Creep[];
        } else if (type === FIND_MY_CONSTRUCTION_SITES) {
          return [{ progressTotal: 5000, progress: 0 }] as ConstructionSite[];
        }
        return [];
      };

      const consumption = predictor.calculateEnergyConsumption(mockRoom);
      
      assert.isAbove(consumption.builders, 0, "Should have builder consumption when construction sites exist");
    });

    it("should have minimal builder consumption without construction sites", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          return [
            {
              memory: { role: "builder" },
              body: [{ type: WORK, hits: 100 }]
            }
          ] as Creep[];
        } else if (type === FIND_MY_CONSTRUCTION_SITES) {
          return []; // No construction sites
        }
        return [];
      };

      const consumption = predictor.calculateEnergyConsumption(mockRoom);
      
      assert.isBelow(consumption.builders, 1, "Should have minimal builder consumption without construction sites");
    });

    it("should calculate tower consumption", () => {
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_STRUCTURES) {
          return [
            { structureType: STRUCTURE_TOWER },
            { structureType: STRUCTURE_TOWER }
          ] as Structure[];
        }
        return [];
      };

      const consumption = predictor.calculateEnergyConsumption(mockRoom);
      
      assert.isAbove(consumption.towers, 0, "Should have tower consumption");
    });

    it("should calculate spawning consumption based on RCL", () => {
      const consumption = predictor.calculateEnergyConsumption(mockRoom);
      
      assert.isAbove(consumption.spawning, 0, "Should have spawning consumption");
      assert.equal(consumption.total, 
        consumption.upgraders + consumption.builders + consumption.towers + consumption.spawning + consumption.repairs);
    });
  });

  describe("getRecommendedSpawnDelay", () => {
    it("should return 0 when energy is already available", () => {
      mockRoom.energyAvailable = 1000;
      
      const delay = predictor.getRecommendedSpawnDelay(mockRoom, 500);
      
      assert.equal(delay, 0, "Should be able to spawn immediately");
    });

    it("should return delay when energy will be available later", () => {
      mockRoom.energyAvailable = 100;
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          return [
            {
              memory: { role: "harvester" },
              body: [
                { type: WORK, hits: 100 },
                { type: WORK, hits: 100 }
              ]
            }
          ] as Creep[];
        }
        return [];
      };

      const delay = predictor.getRecommendedSpawnDelay(mockRoom, 200);
      
      assert.isAbove(delay, 0, "Should need to wait for energy");
      assert.isBelow(delay, 999, "Should be achievable");
    });

    it("should return large delay for negative energy flow", () => {
      mockRoom.energyAvailable = 100;
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          // Only consumers, no producers
          return [
            {
              memory: { role: "upgrader" },
              body: [{ type: WORK, hits: 100 }]
            }
          ] as Creep[];
        }
        return [];
      };

      const delay = predictor.getRecommendedSpawnDelay(mockRoom, 200);
      
      assert.equal(delay, 999, "Should return max delay for negative flow");
    });
  });

  describe("canAffordInTicks", () => {
    it("should return true when energy will be available", () => {
      mockRoom.energyAvailable = 500;
      
      const canAfford = predictor.canAffordInTicks(mockRoom, 500, 0);
      
      assert.isTrue(canAfford, "Should be able to afford current energy immediately");
    });

    it("should return false when energy will not be available", () => {
      mockRoom.energyAvailable = 100;
      mockRoom.find = () => []; // No income
      
      const canAfford = predictor.canAffordInTicks(mockRoom, 500, 10);
      
      assert.isFalse(canAfford, "Should not be able to afford with no income");
    });
  });

  describe("getMaxAffordableInTicks", () => {
    it("should return predicted energy amount", () => {
      mockRoom.energyAvailable = 500;
      mockRoom.energyCapacityAvailable = 1000;
      
      const max = predictor.getMaxAffordableInTicks(mockRoom, 0);
      
      assert.equal(max, 500, "Should return current energy when ticks is 0");
    });

    it("should cap at room energy capacity", () => {
      mockRoom.energyAvailable = 500;
      mockRoom.energyCapacityAvailable = 1000;
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          // Very high income
          return Array.from({ length: 20 }, () => ({
            memory: { role: "harvester" },
            body: Array.from({ length: 5 }, () => ({ type: WORK, hits: 100 }))
          })) as Creep[];
        }
        return [];
      };

      const max = predictor.getMaxAffordableInTicks(mockRoom, 100);
      
      assert.isAtMost(max, 1000, "Should not exceed room energy capacity");
    });
  });

  describe("configuration", () => {
    it("should allow setting custom config", () => {
      predictor.setConfig({
        maxPredictionTicks: 200,
        safetyMargin: 0.8
      });

      const config = predictor.getConfig();
      
      assert.equal(config.maxPredictionTicks, 200);
      assert.equal(config.safetyMargin, 0.8);
    });

    it("should apply safety margin to income", () => {
      predictor.setConfig({ safetyMargin: 0.5 }); // Only count 50% of income
      
      mockRoom.find = (type: FindConstant) => {
        if (type === FIND_MY_CREEPS) {
          return [
            {
              memory: { role: "harvester" },
              body: [
                { type: WORK, hits: 100 },
                { type: WORK, hits: 100 }
              ]
            }
          ] as Creep[];
        }
        return [];
      };

      const prediction = predictor.predictEnergyInTicks(mockRoom, 50);
      
      // Net flow should be lower due to safety margin
      const income = predictor.calculateEnergyIncome(mockRoom);
      assert.isBelow(prediction.netFlow, income.total, "Safety margin should reduce effective income");
    });
  });
});

